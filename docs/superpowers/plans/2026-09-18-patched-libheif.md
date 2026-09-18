# Patched libheif native packages

ENG-14549. Approved design: retain upstream Sharp, rebuild its native dependency,
and publish distinct Cosmos packages through the private cosmos-actions publisher.

- [x] Fork upstream at f5f1839e29ed98c2a1d0030e23bf2d403ab3b699 (libheif 1.23.4, libvips 8.18.6).
- [ ] Build glibc x64 (Lambda), musl arm64 (web production), musl x64 (CI), Darwin arm64 (development).
- [ ] Package exact versions with provenance and third-party notices.
- [ ] Smoke-test clean Sharp 0.35.4 installs using dependency overrides in target runtimes.
- [ ] Publish successful exact-head artifacts through cosmos-actions, verify Nexus download integrity.
- [ ] Verify clean Nexus consumer installs before unblocking ENG-14550 and ENG-14551.

Local validation: node --check scripts/pack-cosmos.mjs, node --check scripts/smoke.cjs,
bash -n scripts/test-package.sh, actionlint .github/workflows/ci.yml.
Native compilation and image-decoding regression checks belong to CI.

Do not publish from public fork workflows or expose Nexus credentials there.
Source dependency versions are in versions.properties; runner and distro package
updates mean builds are not claimed to be bit-for-bit reproducible. Record the
exact source SHA, build run, versions and immutable package integrity for consumers.
