# Cosmos patched Sharp native packages

ENG-14549: this fork builds libheif 1.23.4 with libvips 8.18.6 for upstream Sharp 0.35.4.
The Cosmos CI produces scoped `@cosmos-entity/sharp-libvips-<platform>@1.3.3-cosmos.1`
packages. It never publishes to public npm and has no Nexus credentials.

After CI succeeds, the trusted `cosmos-actions` vendor publisher verifies the build
repository, run, and commit before publishing the exact tarballs to Nexus npm-hosted.
Consumers read through `https://nexus.m.cos.ms/repository/npm-group/` and override
`@img/sharp-libvips-<platform>` with the matching scoped Cosmos package. Test every
native addon/platform pairing; upgrading a lockfile alone does not prove the loaded
library changed. Deployments must verify their final artifacts.

Production targets are glibc x64 (Lambda) and musl arm64 (cosmos-www). CI also builds
musl x64 and macOS arm64. Other platforms are not yet covered by this remediation.
All packages retain upstream notices and a BUILD-PROVENANCE.json with source/run IDs.
The source for modified libraries remains available through the recorded versions;
this repository contains the build recipes. Upstream's uncompressed codec and HEVC
feature choices are preserved; adding HEVC decoding is a separate change (ENG-11148).

Remove consumer overrides once upstream publishes and verifies equivalent fixes.
Review libheif releases regularly; 1.23.4 is a security baseline, not a guarantee
against future vulnerabilities. Build system packages still track distro updates;
we do not claim bit-for-bit reproducibility.

## Upstream documentation

# Packaging scripts

libvips and its dependencies are provided as pre-compiled shared libraries
for the most common operating systems and CPU architectures.

These are [packaged](npm) and published to the npm registry under the
[@img](https://www.npmjs.com/org/img) organisation.

## Creating a tarball

Most people will not need to do this; proceed with caution.

Run the top-level [build script](build.sh) without parameters for help.

### Linux

One [build script](build/posix.sh) is used to (cross-)compile
the same shared libraries within multiple containers.

* [x64 glibc](platforms/linux-x64/Dockerfile)
* [x64 musl](platforms/linuxmusl-x64/Dockerfile)
* [ARMv6 glibc](platforms/linux-armv6/Dockerfile)
* [ARM64v8-A glibc](platforms/linux-arm64v8/Dockerfile)
* [ARM64v8-A musl](platforms/linuxmusl-arm64v8/Dockerfile)
* [ppc64le glibc](platforms/linux-ppc64le/Dockerfile)
* [RISC-V 64-bit glibc](platforms/linux-riscv64/Dockerfile)
* [s390x glibc](platforms/linux-s390x/Dockerfile)

### Windows

The output of libvips' [build-win64-mxe](https://github.com/libvips/build-win64-mxe)
static "web" releases are [post-processed](build/win.sh) within a [container](platforms/win32/Dockerfile).

### macOS

Uses a macOS virtual machine hosted by GitHub to compile the shared libraries.
The dylib files are compiled within the same build script as Linux.

* x64
* ARM64

Dependency paths are modified to use the relative `@rpath` with `install_name_tool`.

### WebAssembly

The scripts from [wasm-vips](https://github.com/kleisauke/wasm-vips)
are [used to compile](build/wasm.sh) libvips and its dependencies
as static Wasm libraries ready for further compilation into a single,
statically-linked sharp shared library.

## Licences

These scripts are licensed under the terms of the [Apache 2.0 Licence](LICENSE).

The shared libraries contained in the tarballs are distributed under
the terms of [various licences](THIRD-PARTY-NOTICES.md), all of which
are compatible with the Apache 2.0 Licence.
