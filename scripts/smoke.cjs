const assert = require('node:assert/strict');
const sharp = require('sharp');

async function main() {
  assert.equal(sharp.versions.heif, '1.23.4');
  assert.equal(sharp.versions.vips, '8.18.6');
  const pixels = Buffer.alloc(32 * 32 * 3, 128);
  for (const format of ['png', 'jpeg', 'webp', 'avif']) {
    const encoded = await sharp(pixels, { raw: { width: 32, height: 32, channels: 3 } })
      .toFormat(format).toBuffer();
    const metadata = await sharp(encoded).metadata();
    assert.equal(metadata.width, 32);
    const resized = await sharp(encoded).resize(16, 16).png().toBuffer();
    assert.equal((await sharp(resized).metadata()).width, 16);
  }
  await assert.rejects(sharp(Buffer.from('not an image')).metadata());
  console.log(JSON.stringify(sharp.versions));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
