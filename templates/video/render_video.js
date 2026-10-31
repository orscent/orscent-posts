// Render an animated HTML (exposes window.render(t)) to MP4 frames.
// Usage: node render_video.js <html> <out.mp4> [seconds=15] [fps=30]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const [html, out, secs = '15', fpsArg = '30'] = process.argv.slice(2);
  const dur = +secs, fps = +fpsArg, n = Math.round(dur * fps);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await browser.close();
  // soft ambient pad (generated, royalty-free)
  const pad = path.join(dir, 'pad.wav');
  execSync(`ffmpeg -y -loglevel error -f lavfi -i "sine=f=220:d=${dur}" -f lavfi -i "sine=f=277.18:d=${dur}" -f lavfi -i "sine=f=329.63:d=${dur}" -f lavfi -i "sine=f=440:d=${dur}" ` +
    `-filter_complex "[0][1][2][3]amix=inputs=4,tremolo=f=0.25:d=0.5,lowpass=f=900,aecho=0.8:0.7:400:0.4,volume=0.6,afade=t=in:d=1.5,afade=t=out:st=${dur - 2}:d=2" ${pad}`);
  execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${dir}/f%04d.jpg -i ${pad} -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 -c:a aac -b:a 128k -shortest -movflags +faststart ${out}`);
  fs.rmSync(dir, { recursive: true });
  console.log('done', out);
})();
