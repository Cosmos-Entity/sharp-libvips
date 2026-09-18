#!/usr/bin/env bash
set -euo pipefail
platform="$1"
case "$platform" in
  linux-x64) runtime_platform=linux-x64 ;;
  linuxmusl-x64) runtime_platform=linuxmusl-x64 ;;
  linuxmusl-arm64v8) runtime_platform=linuxmusl-arm64 ;;
  darwin-arm64v8) runtime_platform=darwin-arm64 ;;
  *) exit 2 ;;
esac
package="$PWD/dist/cosmos-entity-sharp-libvips-${runtime_platform}-1.3.3-cosmos.1.tgz"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT
cp "$package" "$test_dir/native.tgz"
cp scripts/smoke.cjs "$test_dir/smoke.cjs"
printf '{"private":true,"dependencies":{"sharp":"0.35.4"},"overrides":{"@img/sharp-libvips-%s":"file:./native.tgz"}}\n' "$runtime_platform" > "$test_dir/package.json"
case "$platform" in
  linux-x64)
    docker run --rm --memory=1g --cpus=2 --pids-limit=256 --entrypoint /bin/bash -v "$test_dir:/var/task" -w /var/task public.ecr.aws/lambda/nodejs:24 -c 'npm install --ignore-scripts && node --max-old-space-size=256 smoke.cjs'
    ;;
  linuxmusl-*)
    docker run --rm --memory=1g --cpus=2 --pids-limit=256 -v "$test_dir:/app" -w /app node:24-alpine sh -c 'npm install --ignore-scripts && node --max-old-space-size=256 smoke.cjs'
    ;;
  darwin-arm64v8)
    (cd "$test_dir" && npm install --ignore-scripts && node smoke.cjs)
    ;;
esac
