"""Assemble a portable, dependency-free site and its source-backed downloads."""
from pathlib import Path
import hashlib
import json
import shutil
from zipfile import ZipFile, ZIP_DEFLATED

SITE = Path(__file__).resolve().parent
ROOT = SITE.parent
OUT = SITE / 'dist'

def build():
    # Only known output files are overwritten; no recursive deletion is needed.
    OUT.mkdir(exist_ok=True)
    for name in ('index.html', 'styles.css', 'network.js', 'app.js'):
        shutil.copy2(SITE / name, OUT / name)
    (OUT / '.nojekyll').touch()
    assets = OUT / 'assets'
    assets.mkdir(exist_ok=True)
    for image in (ROOT / 'evidence' / 'screenshots').glob('*.png'):
        shutil.copy2(image, assets / image.name)
    shutil.copy2(ROOT / 'assets' / 'topology.png', assets / 'topology.png')
    files = [ROOT / 'README.md', ROOT / '.gitignore', ROOT / 'vercel.json']
    for folder in ('lab', 'configs', 'docs', 'assets', 'evidence', 'tests'):
        files += sorted(p for p in (ROOT / folder).rglob('*') if p.is_file())
    files += [SITE / name for name in ('index.html', 'styles.css', 'network.js', 'app.js', 'build.py', 'network.test.cjs', 'README.md')]
    files.append(ROOT / '.github' / 'workflows' / 'pages.yml')
    downloads = OUT / 'downloads'
    downloads.mkdir(exist_ok=True)
    for source in files:
        target = downloads / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    # Include website source, but never generated output or recursive archives.
    with ZipFile(downloads / 'network-project.zip', 'w', ZIP_DEFLATED) as archive:
        for source in files:
            archive.write(source, source.relative_to(ROOT).as_posix())
    manifest = json.loads((ROOT / 'evidence' / 'integrity.json').read_text(encoding='utf-8'))
    for entry in manifest['files']:
        published = downloads / entry['path']
        assert hashlib.sha256(published.read_bytes()).hexdigest() == entry['sha256'], entry['path']
    print(f'Built {OUT}; {len(files)} network files packaged; all 5 original-file hashes match.')

if __name__ == '__main__':
    build()
