// Builds a single self-contained HTML file (CSS + JS + images inlined)
// that can be emailed/sent and opened by double-click on any machine.
// Usage: node build-preview.js  ->  preview/lucx-preview.html
const fs = require('fs');
const path = require('path');
const https = require('https');

const pub = path.join(__dirname, 'public');
// External images (in styles.css backgrounds AND index.html <img> tags) to inline for a portable file.
const IMAGES = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1900&q=80', // hero
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=900&q=75',  // mobile menu
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=72',  // pkg: interior
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=72',  // pkg: refresh
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=72',  // pkg: restoration
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=72',  // pkg: protection
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1100&q=75', // pkg: signature (featured)
  'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=72',  // showroom: mobile
  'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=800&q=72',  // showroom: exterior
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=72',  // showroom: paint
  'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=72',  // showroom: ceramic
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=72',  // showroom: maintenance
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75', // showroom: video poster
];
// Local photos to inline (before/after pair + service-area city cards)
const LOCAL_JPG = ['before.jpg', 'after.jpg',
  'city-austin.jpg', 'city-round-rock.jpg', 'city-georgetown.jpg', 'city-cedar-park.jpg',
  'city-pflugerville.jpg', 'city-hutto.jpg', 'city-lago-vista.jpg', 'city-manor.jpg'];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return get(r.headers.location).then(resolve, reject);
      }
      if (r.statusCode !== 200) { reject(new Error('HTTP ' + r.statusCode)); return; }
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const uri = (file, mime) =>
  `data:${mime};base64,` + fs.readFileSync(path.join(pub, 'img', file)).toString('base64');

(async () => {
  let html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8');
  let css = fs.readFileSync(path.join(pub, 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(pub, 'app.js'), 'utf8');

  const logo = uri('logo-gold.png', 'image/png');
  const favicon = uri('favicon.png', 'image/png');
  const apple = uri('apple-touch-icon.png', 'image/png');

  // Download external photos once, then inline them wherever they appear (CSS backgrounds + <img> tags).
  const dataUris = {};
  for (const url of IMAGES) {
    try {
      const buf = await get(url);
      dataUris[url] = 'data:image/jpeg;base64,' + buf.toString('base64');
      css = css.split(url).join(dataUris[url]);
      console.log('Inlined (' + (buf.length / 1024).toFixed(0) + ' KB): ' + url.slice(0, 58) + '...');
    } catch (e) {
      console.warn('Could not download, keeping live URL:', url, '-', e.message);
    }
  }

  html = html.replace('<link rel="stylesheet" href="/styles.css">', `<style>\n${css}\n</style>`);
  html = html.replace('<script src="/app.js" defer></script>', `<script>\n${js}\n</script>`);
  html = html.split('/img/logo-gold.png').join(logo);
  html = html.split('/img/favicon.png').join(favicon);
  html = html.split('/img/apple-touch-icon.png').join(apple);
  // inline package <img> sources too
  for (const url in dataUris) { html = html.split(url).join(dataUris[url]); }
  // inline local before/after photos if present
  for (const f of LOCAL_JPG) {
    try {
      html = html.split('/img/' + f).join(uri(f, 'image/jpeg'));
    } catch (e) { console.warn('skip local img', f, '-', e.message); }
  }

  const out = path.join(__dirname, 'preview');
  fs.mkdirSync(out, { recursive: true });
  const file = path.join(out, 'lucx-preview.html');
  fs.writeFileSync(file, html);
  console.log('Wrote ' + file + ' (' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB)');
})();
