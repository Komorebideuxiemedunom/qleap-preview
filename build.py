#!/usr/bin/env python3
"""Générateur statique minimal du site Q-LEAP (refonte locale).

pages/*.html commencent par un commentaire de métadonnées :
<!--meta {"title": "...", "desc": "...", "path": "testing/", "nav": "testing", "darkHero": false, "css": [], "js": []} -->
Le reste du fichier est le contenu de <main>. Le header, le menu mobile et le footer viennent de partials/.
Sortie : site/<path>index.html. Lancer : python3 build.py
"""
import json, re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent
PAGES, PARTIALS, OUT = ROOT / "pages", ROOT / "partials", ROOT / "docs"
SVG = {n: (OUT / "assets/img" / f"{n}.svg").read_text() for n in ("wordmark", "q", "logo-full", "qbot", "qguard")}

def svg(name, cls="", label=None):
    s = SVG[name]
    attrs = f' class="{cls}"' if cls else ""
    attrs += f' role="img" aria-label="{label}"' if label else ' aria-hidden="true" focusable="false"'
    return s.replace("<svg ", f"<svg{attrs} ", 1)

def partial(name, **ctx):
    t = (PARTIALS / name).read_text()
    for k, v in ctx.items():
        t = t.replace("{{" + k + "}}", v)
    return t

NAV = [("testing", "/testing/", "Testing"), ("accessibility", "/accessibility/", "Accessibility"),
       ("training", "/training/", "Training"), ("products", "/products/", "Products"),
       ("about", "/about/", "About"), ("careers", "/careers/", "Careers")]

def nav_items(active):
    out = []
    for key, href, label in NAV:
        cur = ' aria-current="page"' if key == active else ""
        out.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return "\n".join(out)

def panel_items(active):
    out = []
    for i, (key, href, label) in enumerate(NAV + [("contact", "/contact/", "Contact")], 1):
        cur = ' aria-current="page"' if key == active else ""
        out.append(f'<li><a href="{href}"{cur}><small>{i:02d}</small>{label}</a></li>')
    return "\n".join(out)

def expand(body):
    # {{svg:q:classes}} raccourci pour insérer les SVG de charte
    def rep(m):
        parts = m.group(1).split(":")
        return svg(parts[0], parts[1] if len(parts) > 1 else "", parts[2] if len(parts) > 2 else None)
    return re.sub(r"\{\{svg:([^}]+)\}\}", rep, body)

CTA = {
    "default": ("Contact", "What should we test <em>first?</em>", "/contact/", "Talk to a tester"),
    "training": ("Training", "Which certification <em>is next?</em>", "mailto:training@q-leap.eu", "Ask the training team"),
    "careers": ("Careers", "Want to test <em>with us?</em>", "/contact/?intent=job", "Send your application"),
    "products": ("Demo", "Want to see it <em>on your tests?</em>", "/contact/?intent=product", "Ask for a demo"),
}

def cta(meta):
    key = meta.get("nav", "")
    e, t, h, b = CTA.get(key, CTA["default"])
    return dict(ctaEyebrow=e, ctaTitle=t, ctaHref=h, ctaBtn=b)

def build(PAGES=PAGES, PARTIALS_DIR=None, prefix=""):
    global PARTIALS
    saved = PARTIALS
    if PARTIALS_DIR: PARTIALS = PARTIALS_DIR
    n = 0
    for f in sorted(PAGES.glob("*.html")):
        raw = f.read_text()
        m = re.match(r"\s*<!--meta\s+(\{.*?\})\s*-->", raw, re.S)
        if not m:
            raise SystemExit(f"meta manquante : {f.name}")
        meta = json.loads(m.group(1))
        body = expand(raw[m.end():])
        active = meta.get("nav", "")
        css = "".join(f'\n<link rel="stylesheet" href="/assets/css/{c}">' for c in meta.get("css", []))
        js = "".join(f'\n<script src="{s}" defer></script>' for s in meta.get("js", []))
        page = partial("layout.html",
            title=html.escape(meta["title"]), desc=html.escape(meta.get("desc", "")),
            canonical="https://q-leap.eu/en/" + meta.get("path", ""),
            css=css, js=js, bodyclass=meta.get("bodyClass", ""), feature=html.escape(meta.get("feature", "")),
            hdrclass="on-dark" if meta.get("darkHero") else "",
            header=partial("header.html", logo=svg("wordmark", "", "Q-LEAP, home"), nav=nav_items(active), panel=panel_items(active)),
            topbar=partial("topbar.html", logo=svg("wordmark", "", "Q-LEAP, home"), nav=nav_items(active)) if (PARTIALS / "topbar.html").exists() else "",
            main=body,
            footer=expand(partial("footer.html", **cta(meta))))
        dest = OUT / prefix / meta.get("path", "") / "index.html" if meta.get("path") != "404" else OUT / prefix / "404.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        if prefix:
            page = re.sub(r'((?:href|src|poster|data-src|content)=")/(?!/|assets/|' + prefix + r'/)', r"\1/" + prefix + "/", page)
        depth = len(dest.relative_to(OUT).parts) - 1
        rel = "../" * depth or "./"
        page = re.sub(r'((?:href|src|poster|data-src|content)=")/(?!/)', r"\1" + rel, page)
        page = page.replace("<head>", f"<head>\n<script>window.QBASE='{rel}'</script>", 1)
        dest.write_text(page)
        n += 1
    PARTIALS = saved
    print(f"{n} pages générées dans {OUT / prefix}")

if __name__ == "__main__":
    build()
    if (ROOT / "pages-v2").exists():
        build(ROOT / "pages-v2", ROOT / "partials-v2", "v2")
