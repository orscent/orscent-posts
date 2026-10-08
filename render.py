# שימוש: python3 render.py templates/n1.html out.png   (1080x1350)
import sys
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':1080,'height':1350})
    pg.goto('file://'+__import__('os').path.abspath(src))
    pg.wait_for_timeout(500)
    pg.screenshot(path=out)
    b.close()
