"""Check final film streams, carried picture, and the source of the soundtrack."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

PACKAGE = Path(__file__).resolve().parents[1]
DEMO = PACKAGE.parent
RENDERS = DEMO / "film/renders"
OLD = RENDERS / "blended-moss-v6.mp4"
MASTER = RENDERS / "blended-moss-v7.mp4"
DELIVERY = RENDERS / "blended-moss-v7-1080p.mp4"


def ffprobe(movie, *args):
    raw = subprocess.check_output(["ffprobe", "-v", "error", *args, "-of", "json", str(movie)])
    return json.loads(raw)


def digest(movie):
    h = hashlib.sha256()
    with movie.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def packets(movie, selector):
    return ffprobe(movie, "-select_streams", selector, "-show_packets", "-show_data_hash", "sha256",
                   "-show_entries", "packet=pts,dts,duration,size,data_hash")["packets"]


def check_edition(movie, size):
    metadata = ffprobe(movie, "-show_format", "-show_streams")
    streams = metadata["streams"]
    assert [s["codec_type"] for s in streams] == ["video", "audio"]
    video = streams[0]
    assert [video["width"], video["height"]] == size and video["r_frame_rate"] == "30/1"
    assert video["nb_frames"] == "3588" and float(metadata["format"]["duration"]) == 119.6
    assert "NASA Earth Observatory" in metadata["format"]["tags"]["comment"]
    measured = subprocess.run(["ffmpeg", "-nostdin", "-xerror", "-hide_banner", "-i", str(movie),
                               "-af", "ebur128=peak=true", "-f", "null", "-"],
                              check=True, capture_output=True, text=True).stderr
    summary = measured[measured.rfind("Summary:"):]
    lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary)[1])
    peak = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary)[1])
    assert abs(lufs + 14) <= .2 and peak <= -1.4
    return dict(file=movie.name, dimensions=size, seconds=119.6, frames=3588, fps=30,
                bytes=movie.stat().st_size, sha256=digest(movie), full_decode="passed",
                integrated_lufs=lufs, true_peak_dbtp=peak)


def main():
    assert digest(OLD) == "eb541daa30c59f2ee73dc3f816f99aca05730c8c21866bffffb655a6784eb208"
    assert digest(RENDERS / "blended-moss-v6-1080p.mp4") == "e3f32330f289037587b5f2ec0adf8ce9e693f611bd9ebc75771cf60b55ce083c"
    editions = [check_edition(MASTER, [3840, 2160]), check_edition(DELIVERY, [1920, 1080])]
    assert editions[1]["bytes"] < 49_000_000
    previous = sorted(packets(OLD, "v:0"), key=lambda p: p["pts"])
    current = sorted(packets(MASTER, "v:0"), key=lambda p: p["pts"])
    assert len(previous) == len(current) == 3588
    assert [p["pts"] for p in previous] == [p["pts"] for p in current]
    retained = [(0, 694), (1779, 2620), (3330, 3588)]
    for start, stop in retained:
        assert previous[start:stop] == current[start:stop], (start, stop)
    original_audio = packets(OLD, "a:0")
    assert len(original_audio) == 5608 and original_audio == packets(MASTER, "a:0") == packets(DELIVERY, "a:0")
    def morning(version):
        shots = json.loads((DEMO / f"film/cuts/blended-moss-{version}/shots.json").read_text())
        return next(s["brief"] for s in shots["slots"] if s["id"] == "morning-laptop")
    assert morning("v6") == morning("v7")
    report = dict(exports=editions, retained_parent_picture_ranges=retained,
                  retained_picture_packets=sum(b-a for a,b in retained),
                  all_video_presentation_timestamps_match_v6=True,
                  exact_audio_packets_and_timestamps_from_v6=5608,
                  morning_brief_data_identical_to_v6=True, parent_movie_hashes_match=True,
                  new_generation_usd=0)
    (PACKAGE / "evidence/checks.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
