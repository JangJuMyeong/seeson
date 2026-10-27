#!/usr/bin/env python3
"""Create a portable source handoff without Git metadata, hosting IDs or secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
import subprocess
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[1]
output = root / 'artifacts' / 'siseon-demo-2026-10-28.zip'
output.parent.mkdir(exist_ok=True)
files = []
for folder in ['dist', 'docs', 'skills', 'scripts', 'tests']:
    files.extend(p for p in (root / folder).rglob('*') if p.is_file() and p.name != '.DS_Store' and '__pycache__' not in p.parts)
for name in ['README.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'package.json', 'package-lock.json', 'run-demo.command', 'run-demo.bat']:
    files.append(root / name)
try:
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True, stderr=subprocess.DEVNULL).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True, stderr=subprocess.DEVNULL).strip())
except (FileNotFoundError, subprocess.CalledProcessError):
    commit, dirty = None, None
manifest = {'commit': commit, 'working_tree_changed': dirty, 'packaged_at_utc': datetime.now(timezone.utc).isoformat(), 'sha256': {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}}
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, Path('siseon') / path.relative_to(root))
    archive.writestr('siseon/BUILD-INFO.json', json.dumps(manifest, ensure_ascii=False, indent=2))
with ZipFile(output) as archive:
    assert archive.testzip() is None
print(output)
