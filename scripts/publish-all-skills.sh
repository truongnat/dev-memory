#!/usr/bin/env bash
# Publish all skills listed in skills/publish-manifest.json to the Skill Hub.
# Requires: skill CLI configured (~/.skill-cli/config.json) with hub_url and api_key.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$ROOT/skills/publish-manifest.json"
CLI="bun run --cwd $ROOT/packages/cli src/index.ts"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Missing $MANIFEST" >&2
  exit 1
fi

DEFAULT_COMPATIBLE=$(jq -r '.default_compatible | join(",")' "$MANIFEST")
DEFAULT_VERSION=$(jq -r '.default_version' "$MANIFEST")
DEFAULT_CHANGELOG=$(jq -r '.default_changelog' "$MANIFEST")

echo "==> Validating all skills"
$CLI validate-all "$ROOT/skills" --fix

echo "==> Publishing skills"
for name in $(jq -r '.skills | keys[]' "$MANIFEST"); do
  tags=$(jq -r --arg n "$name" '.skills[$n].tags | join(",")' "$MANIFEST")
  version=$(jq -r --arg n "$name" '.skills[$n].version // empty' "$MANIFEST")
  version=${version:-$DEFAULT_VERSION}
  changelog=$(jq -r --arg n "$name" '.skills[$n].changelog // empty' "$MANIFEST")
  changelog=${changelog:-$DEFAULT_CHANGELOG}

  echo "--- $name @ $version"
  $CLI publish "$ROOT/skills/$name" \
    --version "$version" \
    --compatible "$DEFAULT_COMPATIBLE" \
    --tags "$tags" \
    --changelog "$changelog"
done

echo "==> Done"
