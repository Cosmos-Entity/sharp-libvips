import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const platforms = new Map([
  ['linux-x64', 'linux-x64'],
  ['linuxmusl-x64', 'linuxmusl-x64'],
  ['linuxmusl-arm64v8', 'linuxmusl-arm64'],
  ['darwin-arm64v8', 'darwin-arm64'],
]);
const platform = process.argv[2];
const target = platforms.get(platform);
if (!target) throw new Error('Unsupported Cosmos platform');
const directory = resolve('npm', target);
execFileSync('tar', ['xzf', `sharp-libvips-${platform}.tar.gz`, '-C', directory]);
const versions = JSON.parse(readFileSync(`${directory}/versions.json`));
if (versions.heif !== '1.23.4' || versions.vips !== '8.18.6') {
  throw new Error('Unexpected libheif/libvips version');
}
const pkg = JSON.parse(readFileSync(`${directory}/package.json`));
pkg.name = `@cosmos-entity/sharp-libvips-${target}`;
pkg.version = '1.3.3-cosmos.1';
pkg.repository.url = 'git+https://github.com/Cosmos-Entity/sharp-libvips.git';
delete pkg.publishConfig;
pkg.files = ['lib', 'versions.json', 'BUILD-PROVENANCE.json', 'THIRD-PARTY-NOTICES.md', 'SOURCE-LICENSE'];
pkg.exports['./binary'] = `./lib/${target.startsWith('darwin') ? 'libvips-cpp.8.18.6.dylib' : 'libvips-cpp.so.8.18.6'}`;
writeFileSync(`${directory}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`);
writeFileSync(`${directory}/lib/index.js`, 'module.exports = __dirname;\n');
copyFileSync('LICENSE', `${directory}/SOURCE-LICENSE`);
writeFileSync(`${directory}/BUILD-PROVENANCE.json`, `${JSON.stringify({
  repository: 'https://github.com/Cosmos-Entity/sharp-libvips',
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  upstreamBase: 'f5f1839e29ed98c2a1d0030e23bf2d403ab3b699',
  platform, versions,
  buildRun: process.env.GITHUB_RUN_ID ?? null,
}, null, 2)}\n`);
mkdirSync('dist', { recursive: true });
execFileSync('npm', ['pack', directory, '--ignore-scripts', '--pack-destination', resolve('dist')], { stdio: 'inherit' });
