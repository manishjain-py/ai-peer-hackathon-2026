"""Settings, secrets and paths.

Secrets come only from ~/.ai-peer/.env. Runtime data lives only under ~/.ai-peer/<owner>/.
The live settings file is ~/.ai-peer/<owner>/settings.yaml, created from peer/defaults.yaml.
"""
from __future__ import annotations

import copy
import os
import threading
from pathlib import Path
from typing import Any

import yaml

REPO = Path(__file__).resolve().parent.parent
PKG = Path(__file__).resolve().parent
PEER_HOME = Path(os.environ.get("AI_PEER_HOME", "~/.ai-peer")).expanduser()
ENV_FILE = PEER_HOME / ".env"
DEFAULTS_FILE = PKG / "defaults.yaml"

_lock = threading.RLock()


def load_env(path: Path = ENV_FILE) -> dict[str, str]:
    """Parse KEY=VALUE lines (no shell expansion). Values never get printed by callers."""
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[7:]
        key, val = line.split("=", 1)
        val = val.strip().strip('"').strip("'")
        out[key.strip()] = val
    return out


def secret(name: str, required: bool = False) -> str | None:
    val = load_env().get(name) or os.environ.get(name)
    if required and not val:
        raise RuntimeError(f"{name} is missing from {ENV_FILE}")
    return val or None


def _deep_merge(base: dict, over: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


class Settings:
    """Defaults + the owner's live settings.yaml, re-read when the file changes."""

    def __init__(self, owner: str | None = None):
        defaults = yaml.safe_load(DEFAULTS_FILE.read_text())
        self.owner = owner or os.environ.get("AI_PEER_OWNER") or defaults["owner"]["id"]
        self.owner_dir = PEER_HOME / self.owner
        self.file = self.owner_dir / "settings.yaml"
        self._defaults = defaults
        self._data: dict = {}
        self._mtime = None
        self.ensure()

    def ensure(self) -> None:
        with _lock:
            self.owner_dir.mkdir(parents=True, exist_ok=True)
            if not self.file.exists():
                self.file.write_text(DEFAULTS_FILE.read_text())
            self.reload(force=True)

    def reload(self, force: bool = False) -> None:
        with _lock:
            mtime = self.file.stat().st_mtime
            if force or mtime != self._mtime:
                live = yaml.safe_load(self.file.read_text()) or {}
                self._data = _deep_merge(self._defaults, live)
                self._mtime = mtime

    def get(self, dotted: str, default: Any = None) -> Any:
        self.reload()
        node: Any = self._data
        for part in dotted.split("."):
            if not isinstance(node, dict) or part not in node:
                return default
            node = node[part]
        return node

    def set(self, dotted: str, value: Any) -> None:
        with _lock:
            live = yaml.safe_load(self.file.read_text()) or {}
            node = live
            parts = dotted.split(".")
            for part in parts[:-1]:
                node = node.setdefault(part, {})
            node[parts[-1]] = value
            self.file.write_text(yaml.safe_dump(live, sort_keys=False, allow_unicode=True))
            self.reload(force=True)

    def path(self, dotted: str) -> Path:
        return Path(str(self.get(dotted))).expanduser()

    @property
    def db_path(self) -> Path:
        return self.owner_dir / "peer.db"

    @property
    def log_path(self) -> Path:
        return self.owner_dir / "log.jsonl"

    def profile_path(self) -> Path:
        p = Path(self.get("owner.profile"))
        return p if p.is_absolute() else REPO / p


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
