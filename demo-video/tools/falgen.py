#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["fal-client>=1.0"]
# ///
"""falgen: run one fal.ai endpoint from a request file, download the outputs, log the cost.

    uv run --quiet demo-video/tools/falgen.py REQUEST.json --ledger LEDGER.csv --cap 15 --session NAME

What it does, in order:
  1. reads the request file (endpoint, inputs, the price you expect, where the output goes);
  2. prints the expected cost and fal.ai's live base price, and REFUSES the call if the ledger
     total plus the calls still running plus this call would pass the cap;
  3. uploads any local input written as "file:<path from the repo root>";
  4. submits to fal.ai's queue, waits, downloads every file in the result;
  5. appends one row to the ledger (also for a failed call, at cost 0).

Request file (JSON):
  {
    "endpoint": "google/nano-banana-2.1",
    "inputs":   {"prompt": "...", "image_urls": ["file:demo-video/look/frames/f1.png"]},
    "expect":   {"units": 1, "unit": "image at 2K", "unit_price": 0.07, "cost_usd": 0.07,
                 "basis": "where the price comes from"},
    "output":   "demo-video/look/frames/f2",      (no extension: it comes from the result)
    "note":     "F2, the double half-risen"
  }

The cost written in the ledger: fal.ai reports the billable units of a call; units x the live
base price is the bill. If that is lower than the request file expected, the HIGHER figure is
logged (a listed per-second price is firm, so a lower reading is more likely a misread unit).
Set "estimate": true inside "expect" for a token-priced model, where the expected cost is only
a guess: then what fal.ai reports is logged as it is.

The key is read from the FAL_KEY environment variable and is never printed.
Other modes: --dry-run (steps 1 and 2 only, no call), --summary (ledger totals).
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import fcntl
import hashlib
import json
import mimetypes
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

QUEUE_HOST = "https://queue.fal.run"
PRICING_URL = "https://api.fal.ai/v1/models/pricing"
FAL_HOSTS = ("queue.fal.run", "api.fal.ai", "fal.run", "rest.fal.ai")
LEDGER_COLUMNS = [
    "time_utc", "session", "endpoint", "units", "unit_price_usd", "cost_usd",
    "request_file", "output_file", "note", "request_id", "seconds",
]
EXTENSIONS = {
    "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif",
    "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm",
    "audio/mpeg": ".mp3", "audio/wav": ".wav", "application/json": ".json",
}


class Refused(Exception):
    """The call was not made (cap, bad request file, output exists)."""


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def key() -> str:
    value = os.environ.get("FAL_KEY", "")
    if not value:
        raise Refused("FAL_KEY is not set in the environment")
    return value


def http(method: str, url: str, body: dict | None = None, timeout: int = 120):
    """Call a fal.ai host. Returns (status, headers, parsed json or text)."""
    host = urllib.parse.urlparse(url).hostname or ""
    if host not in FAL_HOSTS:
        raise Refused(f"refusing to send the key to an unknown host: {host}")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Key {key()}")
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status, headers, raw = resp.status, dict(resp.headers.items()), resp.read()
    except urllib.error.HTTPError as err:
        status, headers, raw = err.code, dict(err.headers.items()), err.read()
    text = raw.decode("utf-8", "replace")
    try:
        return status, headers, json.loads(text)
    except json.JSONDecodeError:
        return status, headers, text


def repo_root(start: Path) -> Path:
    out = subprocess.run(
        ["git", "-C", str(start), "rev-parse", "--show-toplevel"],
        capture_output=True, text=True,
    )
    if out.returncode == 0 and out.stdout.strip():
        return Path(out.stdout.strip())
    return Path(__file__).resolve().parents[2]


def rel(p: Path, root: Path) -> str:
    try:
        return str(p.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(p)


# ---------------------------------------------------------------- request file

def load_request(path: Path) -> dict:
    req = json.loads(path.read_text())
    for field in ("endpoint", "inputs", "expect", "output"):
        if field not in req:
            raise Refused(f"{path.name}: missing \"{field}\"")
    exp = req["expect"]
    for field in ("units", "unit_price", "cost_usd"):
        if not isinstance(exp.get(field), (int, float)):
            raise Refused(f"{path.name}: expect.{field} must be a number")
    if exp["cost_usd"] < 0:
        raise Refused(f"{path.name}: expect.cost_usd is negative")
    product = exp["units"] * exp["unit_price"]
    if abs(product - exp["cost_usd"]) > max(0.005, 0.02 * exp["cost_usd"]):
        raise Refused(
            f"{path.name}: expect.units x expect.unit_price = {product:.4f} "
            f"but expect.cost_usd = {exp['cost_usd']:.4f}"
        )
    return req


# ---------------------------------------------------------------- ledger and cap

def ledger_rows(ledger: Path) -> list[dict]:
    if not ledger.exists():
        return []
    with ledger.open(newline="") as fh:
        return list(csv.DictReader(fh))


def ledger_total(ledger: Path) -> float:
    return sum(float(r["cost_usd"] or 0) for r in ledger_rows(ledger))


def append_row(ledger: Path, row: dict) -> None:
    ledger.parent.mkdir(parents=True, exist_ok=True)
    new = not ledger.exists() or ledger.stat().st_size == 0
    with ledger.open("a", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=LEDGER_COLUMNS, lineterminator="\n")
        if new:
            writer.writeheader()
        writer.writerow({c: row.get(c, "") for c in LEDGER_COLUMNS})


class Pending:
    """Calls that are running now: their expected cost counts against the cap.

    Kept beside the ledger in a file that is not committed. One lock guards the file and
    the ledger, so two calls started together cannot both slip under the cap.
    """

    def __init__(self, ledger: Path):
        self.file = ledger.with_name("." + ledger.stem + ".pending.json")
        self.lock_file = ledger.with_name("." + ledger.stem + ".lock")
        ledger.parent.mkdir(parents=True, exist_ok=True)

    def __enter__(self):
        self._fh = self.lock_file.open("w")
        fcntl.flock(self._fh, fcntl.LOCK_EX)
        return self

    def __exit__(self, *exc):
        fcntl.flock(self._fh, fcntl.LOCK_UN)
        self._fh.close()

    def read(self) -> list[dict]:
        if not self.file.exists():
            return []
        try:
            return json.loads(self.file.read_text())
        except json.JSONDecodeError:
            return []

    def write(self, entries: list[dict]) -> None:
        self.file.write_text(json.dumps(entries, indent=1))


def alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


# ---------------------------------------------------------------- inputs

def upload(path: Path, cache_file: Path) -> str:
    import fal_client  # only needed when a local file is uploaded

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    if digest in cache:
        return cache[digest]
    url = fal_client.upload_file(str(path))
    cache[digest] = url
    cache_file.write_text(json.dumps(cache, indent=1))
    return url


def resolve(value, root: Path, cache_file: Path, uploads: dict):
    """Replace every "file:<path>" string by the URL of the uploaded file."""
    if isinstance(value, str) and value.startswith("file:"):
        local = root / value[len("file:"):]
        if not local.exists():
            raise Refused(f"input file not found: {local}")
        url = upload(local, cache_file)
        uploads[value] = url
        return url
    if isinstance(value, list):
        return [resolve(v, root, cache_file, uploads) for v in value]
    if isinstance(value, dict):
        return {k: resolve(v, root, cache_file, uploads) for k, v in value.items()}
    return value


def local_inputs(value) -> list[str]:
    if isinstance(value, str) and value.startswith("file:"):
        return [value[len("file:"):]]
    if isinstance(value, list):
        return [x for v in value for x in local_inputs(v)]
    if isinstance(value, dict):
        return [x for v in value.values() for x in local_inputs(v)]
    return []


# ---------------------------------------------------------------- outputs

def result_files(value, found: list | None = None) -> list[dict]:
    """Every {"url": "http..."} object in the result, in order."""
    found = [] if found is None else found
    if isinstance(value, dict):
        url = value.get("url")
        if isinstance(url, str) and url.startswith("http"):
            found.append(value)
        else:
            for v in value.values():
                result_files(v, found)
    elif isinstance(value, list):
        for v in value:
            result_files(v, found)
    return found


def extension(file_obj: dict) -> str:
    ctype = (file_obj.get("content_type") or "").split(";")[0].strip()
    if ctype in EXTENSIONS:
        return EXTENSIONS[ctype]
    suffix = Path(urllib.parse.urlparse(file_obj["url"]).path).suffix
    if suffix:
        return ".jpg" if suffix == ".jpeg" else suffix
    return mimetypes.guess_extension(ctype) or ".bin"


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "falgen"})  # no key: public CDN
    with urllib.request.urlopen(req, timeout=600) as resp, dest.open("wb") as fh:
        while chunk := resp.read(1 << 20):
            fh.write(chunk)


# ---------------------------------------------------------------- pricing

def live_price(endpoint: str) -> tuple[float, str] | None:
    url = PRICING_URL + "?" + urllib.parse.urlencode({"endpoint_id": endpoint})
    try:
        status, _, body = http("GET", url, timeout=30)
    except Exception:  # the price check is information; the cap check does not depend on it
        return None
    if status != 200 or not isinstance(body, dict):
        return None
    for price in body.get("prices", []):
        if price.get("endpoint_id") == endpoint:
            return float(price["unit_price"]), str(price.get("unit", ""))
    return None


# ---------------------------------------------------------------- the run

def run(args) -> int:
    request_path = Path(args.request).resolve()
    ledger = Path(args.ledger).resolve()
    root = repo_root(request_path.parent)
    req = load_request(request_path)
    endpoint, expect = req["endpoint"], req["expect"]
    expected = float(expect["cost_usd"])
    request_rel = rel(request_path, root)

    stem = root / req["output"]
    stem = stem.with_suffix("") if stem.suffix in EXTENSIONS.values() else stem
    existing = [p for p in stem.parent.glob(stem.name + "*") if p.suffix != ".json"]
    existing = [p for p in existing if p.stem == stem.name or p.stem.startswith(stem.name + "-")]
    missing = [p for p in local_inputs(req["inputs"]) if not (root / p).exists()]
    if missing:
        raise Refused("input file not found: " + ", ".join(missing))

    base = live_price(endpoint)
    print(f"request   {request_rel}")
    print(f"endpoint  {endpoint}")
    print(
        f"expected  {expect['units']} x ${expect['unit_price']} "
        f"({expect.get('unit', 'unit')}) = ${expected:.4f}"
    )
    if base:
        print(f"live base price on fal.ai: ${base[0]} per {base[1]} (a resolution or mode can multiply it)")
    else:
        print("live base price on fal.ai: could not be read")

    with Pending(ledger) as pend:
        entries = pend.read()
        mine = [e for e in entries if e["request_file"] == request_rel]
        others = [e for e in entries if e["request_file"] != request_rel]
        resume = None
        if mine:
            if alive(mine[0]["pid"]):
                raise Refused(f"this request is already running (pid {mine[0]['pid']})")
            if mine[0].get("status_url"):
                resume = mine[0]
        spent = ledger_total(ledger)
        running = sum(float(e["expected_cost"]) for e in others)
        after = spent + running + expected
        print(
            f"ledger    ${spent:.4f} spent + ${running:.4f} running + ${expected:.4f} this call "
            f"= ${after:.4f} of the ${args.cap:.2f} cap"
        )
        if after > args.cap + 1e-9:
            raise Refused(f"this call would pass the cap of ${args.cap:.2f}: not made")
        if existing and not args.force and not resume:
            raise Refused(
                "output exists (" + ", ".join(p.name for p in existing) + "): "
                "use a new request file for a new take, or --force"
            )
        if args.dry_run:
            print("dry run: no call made")
            return 0
        entry = resume or {
            "request_file": request_rel, "expected_cost": expected, "started_utc": utc_now(),
        }
        entry["pid"] = os.getpid()
        pend.write(others + [entry])

    started = time.time()
    row = {
        "session": args.session, "endpoint": endpoint, "request_file": request_rel,
        "note": req.get("note", ""),
    }
    try:
        if resume:
            print(f"resuming request {resume['request_id']} (submitted {resume['started_utc']} UTC)")
            submitted = resume
        else:
            uploads: dict = {}
            cache_file = ledger.with_name(".upload-cache.json")
            inputs = resolve(req["inputs"], root, cache_file, uploads)
            for local, url in uploads.items():
                print(f"uploaded  {local} -> {url}")
            status, _, body = http("POST", f"{QUEUE_HOST}/{endpoint}", inputs)
            if status != 200 or not isinstance(body, dict) or "request_id" not in body:
                raise RuntimeError(f"submit failed, http {status}: {json.dumps(body)[:800]}")
            submitted = {
                **entry, "request_id": body["request_id"], "status_url": body["status_url"],
                "response_url": body["response_url"], "inputs_sent": inputs,
            }
            with Pending(ledger) as pend:
                pend.write(
                    [e for e in pend.read() if e["request_file"] != request_rel] + [submitted]
                )
            print(f"submitted request {body['request_id']}")
        row["request_id"] = submitted["request_id"]

        last = None
        deadline = time.time() + args.timeout
        while True:
            status, _, body = http("GET", submitted["status_url"], timeout=60)
            state = body.get("status") if isinstance(body, dict) else None
            if state is None and status not in (200, 202):
                raise RuntimeError(f"status failed, http {status}: {str(body)[:400]}")
            shown = state if state != "IN_QUEUE" else f"IN_QUEUE position {body.get('queue_position')}"
            if shown != last:
                print(f"  {int(time.time() - started):>4}s  {shown}")
                last = shown
            if state == "COMPLETED":
                break
            if time.time() > deadline:
                print(
                    f"still running after {args.timeout}s. Its cost stays reserved. "
                    "Run the same command again to pick the result up."
                )
                return 4
            time.sleep(args.poll)

        status, headers, result = http("GET", submitted["response_url"], timeout=120)
        seconds = int(time.time() - started)
        billed_header = next((v for k, v in headers.items() if k.lower() == "x-fal-billable-units"), None)
        if status != 200 or not isinstance(result, dict):
            detail = json.dumps(result)[:900] if not isinstance(result, str) else result[:900]
            print(f"FAILED, http {status}: {detail}")
            stem.parent.mkdir(parents=True, exist_ok=True)
            stem.with_name(stem.name + ".result.json").write_text(json.dumps(
                {"request_id": submitted["request_id"], "http_status": status, "error": result,
                 "inputs_sent": submitted.get("inputs_sent")}, indent=1))
            with Pending(ledger) as pend:
                pend.write([e for e in pend.read() if e["request_file"] != request_rel])
                append_row(ledger, {
                    **row, "time_utc": utc_now(), "units": 0, "unit_price_usd": expect["unit_price"],
                    "cost_usd": "0.0000", "output_file": "", "seconds": seconds,
                    "note": (row["note"] + f" | FAILED http {status}, taken as not billed").strip(" |"),
                })
            return 2

        files = result_files(result)
        stem.parent.mkdir(parents=True, exist_ok=True)
        outputs = []
        for i, file_obj in enumerate(files, start=1):
            name = stem.name + (f"-{i}" if len(files) > 1 else "") + extension(file_obj)
            dest = stem.with_name(name)
            download(file_obj["url"], dest)
            outputs.append(dest)
            print(f"saved     {rel(dest, root)} ({dest.stat().st_size:,} bytes)")
        stem.with_name(stem.name + ".result.json").write_text(json.dumps(
            {"request_id": submitted["request_id"], "billable_units_header": billed_header,
             "inputs_sent": submitted.get("inputs_sent"), "result": result}, indent=1))

        # What was billed. fal.ai reports billable units on the result; units x base price is
        # the bill. If that differs from what the request file expected, the higher is logged.
        units, unit_price, cost = expect["units"], expect["unit_price"], expected
        basis = "expected (fal.ai reported no billable units)"
        if billed_header is not None and base:
            try:
                billed_cost = float(billed_header) * base[0]
            except ValueError:
                billed_cost = None
            if billed_cost is not None:
                if billed_cost >= expected * 0.98 or expect.get("estimate"):
                    units, unit_price, cost = float(billed_header), base[0], billed_cost
                    basis = "billed units reported by fal.ai"
                else:
                    basis = (
                        f"expected kept: fal.ai reported {billed_header} units "
                        f"= ${billed_cost:.4f}, lower than expected"
                    )
                if abs(billed_cost - expected) > max(0.002, 0.02 * expected):
                    print(
                        f"NOTE: expected ${expected:.4f}, fal.ai reported {billed_header} units "
                        f"x ${base[0]} = ${billed_cost:.4f}"
                    )
        with Pending(ledger) as pend:
            pend.write([e for e in pend.read() if e["request_file"] != request_rel])
            append_row(ledger, {
                **row, "time_utc": utc_now(), "units": f"{units:g}", "unit_price_usd": f"{unit_price:g}",
                "cost_usd": f"{cost:.4f}", "seconds": seconds,
                "output_file": "; ".join(rel(p, root) for p in outputs),
                "note": (row["note"] + f" | cost basis: {basis}").strip(" |"),
            })
            total = ledger_total(ledger)
        print(f"cost      ${cost:.4f} ({basis}); {seconds}s")
        print(f"ledger    ${total:.4f} of ${args.cap:.2f}; ${args.cap - total:.4f} left")
        if not files:
            print("NOTE: the result held no file. See the .result.json beside the output path.")
        return 0
    except KeyboardInterrupt:
        print("interrupted: a submitted call may still be billed. Run the same command again to pick it up.")
        return 130
    except Exception as err:
        # Before submit: nothing was sent, free the reservation. After submit: keep it.
        with Pending(ledger) as pend:
            entries = pend.read()
            mine = [e for e in entries if e["request_file"] == request_rel]
            if mine and not mine[0].get("status_url"):
                pend.write([e for e in entries if e["request_file"] != request_rel])
                print(f"ERROR before submit (nothing sent, nothing billed): {err}")
            else:
                print(f"ERROR after submit (cost stays reserved; run the same command again): {err}")
        return 1


def summary(args) -> int:
    rows = ledger_rows(Path(args.ledger))
    by_endpoint: dict[str, list[float]] = {}
    for r in rows:
        by_endpoint.setdefault(r["endpoint"], []).append(float(r["cost_usd"] or 0))
    for endpoint, costs in sorted(by_endpoint.items()):
        print(f"${sum(costs):8.4f}  {len(costs):3d} calls  {endpoint}")
    total = sum(sum(c) for c in by_endpoint.values())
    print(f"${total:8.4f}  {len(rows):3d} calls  TOTAL" + (f" of ${args.cap:.2f} cap" if args.cap else ""))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("request", nargs="?", help="the request file (JSON)")
    parser.add_argument("--ledger", required=True, help="the ledger CSV to append to")
    parser.add_argument("--cap", type=float, help="refuse a call that takes the ledger past this many USD")
    parser.add_argument("--session", default="unknown", help="the session name written in the ledger")
    parser.add_argument("--dry-run", action="store_true", help="print the cost and the cap check, make no call")
    parser.add_argument("--force", action="store_true", help="allow overwriting an existing output")
    parser.add_argument("--summary", action="store_true", help="print the ledger totals and exit")
    parser.add_argument("--timeout", type=int, default=1800, help="seconds to wait for the result")
    parser.add_argument("--poll", type=float, default=3.0, help="seconds between status checks")
    args = parser.parse_args()
    sys.stdout.reconfigure(line_buffering=True)   # progress shows at once, also in a log file
    try:
        if args.summary:
            return summary(args)
        if not args.request:
            parser.error("a request file is needed")
        if args.cap is None:
            parser.error("--cap is needed for a call")
        return run(args)
    except Refused as err:
        print(f"REFUSED: {err}")
        return 3


if __name__ == "__main__":
    sys.exit(main())
