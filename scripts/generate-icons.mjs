/**
 * Generate PWA icons (icon-192.png, icon-512.png) as pure-JS PNG files.
 * No native deps — uses raw PNG chunk encoding.
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crcBuf]);
}

function makePng(size) {
  // Draw a purple rounded-rect background with white 'S'
  // Simplified: solid purple square (no canvas) with 'S' approximated
  // Use RGBA raw pixels
  const pixels = new Uint8Array(size * size * 4);

  const bg = [124, 58, 237, 255];   // #7c3aed
  const fg = [255, 255, 255, 255];  // white
  const r = size * 0.188;           // corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Rounded rect test
      const dx = Math.max(0, Math.max(r - x, x - (size - 1 - r)));
      const dy = Math.max(0, Math.max(r - y, y - (size - 1 - r)));
      const inRect = dx * dx + dy * dy <= r * r;
      const [R, G, B, A] = inRect ? bg : [0, 0, 0, 0];
      pixels[idx] = R; pixels[idx+1] = G; pixels[idx+2] = B; pixels[idx+3] = A;
    }
  }

  // Draw 'S' — approximate with thick strokes
  const cx = size / 2, cy = size / 2;
  const sw = size * 0.06; // stroke width
  const sr = size * 0.22; // letter radius
  function drawArc(ox, oy, radius, a0, a1, col) {
    for (let a = a0; a <= a1; a += 0.01) {
      for (let t = -sw; t <= sw; t += 0.5) {
        const nx = Math.round(ox + (radius + t) * Math.cos(a));
        const ny = Math.round(oy + (radius + t) * Math.sin(a));
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          const idx = (ny * size + nx) * 4;
          if (pixels[idx+3] > 0) { // only inside rect
            pixels[idx] = col[0]; pixels[idx+1] = col[1];
            pixels[idx+2] = col[2]; pixels[idx+3] = col[3];
          }
        }
      }
    }
  }
  const PI = Math.PI;
  // Top arc of S (upper half)
  drawArc(cx, cy - sr * 0.5, sr * 0.5, PI, PI * 2, fg);
  // Bottom arc of S (lower half)
  drawArc(cx, cy + sr * 0.5, sr * 0.5, 0, PI, fg);

  // PNG encode
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines with filter byte 0
  const raw = new Uint8Array(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter None
    raw.set(pixels.subarray(y * size * 4, (y + 1) * size * 4), y * (size * 4 + 1) + 1);
  }

  const compressed = deflateSync(Buffer.from(raw));
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const out = 'd:/boulot/dev/node/sive/static/icons';
writeFileSync(`${out}/icon-192.png`, makePng(192));
writeFileSync(`${out}/icon-512.png`, makePng(512));
console.log('✓ icon-192.png and icon-512.png generated');
