#!/usr/bin/env python3
"""Stamp app.js and styles.css with a content hash in every page's tag.

Without this the URL never changes, so a browser keeps serving a cached
copy after a deploy. Run it after editing either file, before committing.
The CTO can drop the query strings entirely once his server sets its own
cache headers.
"""
import hashlib, re, pathlib

site = pathlib.Path(__file__).parent / 'site'
def h(name):
    return hashlib.md5((site / name).read_bytes()).hexdigest()[:8]

js, css = h('app.js'), h('styles.css')
for page in ['index.html', 'prophecies.html', 'record.html', 'prophet.html']:
    p = site / page
    s = p.read_text()
    s = re.sub(r'(<script src="app\.js)(\?v=[0-9a-f]+)?(")', r'\g<1>?v=' + js + r'\3', s)
    s = re.sub(r'(<link rel="stylesheet" href="styles\.css)(\?v=[0-9a-f]+)?(")', r'\g<1>?v=' + css + r'\3', s)
    p.write_text(s)
print('app.js v=%s   styles.css v=%s' % (js, css))
