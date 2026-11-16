"""
Builds a static, clickable preview of the site (demo mode) from a running
`next start` server, for hosting where no Node server is available.
Usage: python3 scripts/preview/build_preview.py http://localhost:3002 OUT_DIR
"""
import json, os, re, shutil, sys, urllib.parse, urllib.request, html as htmllib

BASE, OUT = sys.argv[1].rstrip("/"), sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))

def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode("utf-8")

# Painting data from the running demo (via sample-data through the shop sitemap)
sitemap = get("/sitemap.xml")
slugs = re.findall(r"/paintings/([a-z0-9-]+)</loc>", sitemap)
data = json.loads(open(os.path.join(HERE, "data.json")).read())  # produced by export_data.mjs
by_id = {p["id"]: p["slug"] for p in data}
available = [p["slug"] for p in data if p["status"] == "available"]

pages = {"/": "index.html", "/shop": "shop.html", "/about": "about.html", "/commissions": "commissions.html",
         "/contact": "contact.html", "/admin": "admin.html", "/admin/login": "admin-login.html",
         "/admin/paintings": "admin-paintings.html", "/admin/paintings/new": "admin-painting-new.html",
         "/admin/orders": "admin-orders.html", "/admin/commissions": "admin-commissions.html",
         "/admin/messages": "admin-messages.html", "/admin/settings": "admin-settings.html"}
for s in slugs:
    pages[f"/paintings/{s}"] = f"painting-{s}.html"
for s in available:
    pages[f"/order/{s}"] = f"order-{s}.html"
for p in data:
    pages[f"/admin/paintings/{p['id']}"] = f"admin-painting-{p['slug']}.html"
extra = {f"/order/confirmation?demo=1&p={s}": f"confirmation-{s}.html" for s in available}

def map_href(h):
    h = htmllib.unescape(h)
    if h.startswith("/_next/image"):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(h).query)
        return q["url"][0].lstrip("/")
    path, _, frag = h.partition("#")
    path, _, query = path.partition("?")
    if path in pages:
        target = pages[path]
        if path == "/admin/orders" and query.startswith("status="):
            target = "admin-orders.html"
        return target + ("#" + frag if frag else "")
    if path.startswith("/order/") and path[7:] in [p["slug"] for p in data]:
        return f"painting-{path[7:]}.html"
    if re.match(r"^/(samples|images)/", path) or path in ("/icon.svg", "/og-default.jpg"):
        return path.lstrip("/")
    return h

FONT_CSS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">'
            "<style>html{--font-display:'Cormorant Garamond',Georgia,serif!important;--font-body:'DM Sans',system-ui,sans-serif!important}"
            ".preview-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;background:#1f1d1b;color:#fff;padding:10px 18px;border-radius:999px;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.2)}</style>")

def convert(src, page_key):
    h = src
    h = re.sub(r"<script\b(?![^>]*application/ld\+json)[^>]*>.*?</script>", "", h, flags=re.S)
    h = re.sub(r'<link rel="preload"[^>]*/>', "", h)
    h = re.sub(r'<link rel="stylesheet" href="/_next/static/[^"]+"[^>]*/>', '<link rel="stylesheet" href="site.css"/>', h, count=1)
    h = re.sub(r'<link rel="stylesheet" href="/_next/static/[^"]+"[^>]*/>', "", h)
    h = re.sub(r'\s(srcSet|srcset|sizes)="[^"]*"', "", h)
    h = re.sub(r'(href|src)="(/[^"]*)"', lambda m: f'{m.group(1)}="{map_href(m.group(2))}"', h)
    # Server-action forms: drop the action attribute and hidden action inputs
    h = re.sub(r'<form([^>]*?)\saction="[^"]*"', r"<form\1", h)
    h = re.sub(r'<input type="hidden" name="\$ACTION[^>]*/>', "", h)
    # Order form: carry the painting slug for the preview script
    for pid, slug in by_id.items():
        h = h.replace(f'name="paintingId" value="{pid}"', f'name="paintingId" value="{slug}"')
    h = h.replace("Connect Supabase to go live (see README).", "This is a design preview.")
    h = h.replace("</head>", FONT_CSS + "</head>", 1)
    body_attr = f' data-page="{page_key}"'
    h = re.sub(r"<body([^>]*)>", lambda m: f"<body{m.group(1)}{body_attr}>", h, count=1)
    h = h.replace("</body>", '<script src="data.js"></script><script src="preview.js"></script></body>', 1)
    return h

os.makedirs(OUT, exist_ok=True)
css_href = None
for path, name in {**pages, **extra}.items():
    src = get(path)
    if css_href is None:
        css_href = re.search(r'<link rel="stylesheet" href="(/_next/static/[^"]+\.css)"', src).group(1)
    open(os.path.join(OUT, name), "w").write(convert(src, path.split("?")[0]))

css = get(css_href)
css = re.sub(r"@font-face\{[^}]*\}", "", css)
open(os.path.join(OUT, "site.css"), "w").write(css)

for d in ("samples", "images"):
    shutil.copytree(os.path.join(ROOT, "public", d), os.path.join(OUT, d), dirs_exist_ok=True)
shutil.copy(os.path.join(ROOT, "public", "icon.svg"), OUT)
shutil.copy(os.path.join(HERE, "preview.js"), OUT)
open(os.path.join(OUT, "data.js"), "w").write("window.__PAINTINGS__=" + json.dumps(data) + ";")
print(len(pages) + len(extra), "pages written to", OUT)
