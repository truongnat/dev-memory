#!/usr/bin/env bash
# Configure skill CLI for Personal KB + Skill Hub (one-time).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="bun run --cwd $ROOT/packages/cli src/index.ts"

HUB_URL="${HUB_URL:-https://dev.truongsoftware.com}"
API_KEY="${API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
  echo "Set API_KEY env var (kb_live_...) or pass: API_KEY=kb_live_xxx $0"
  exit 1
fi

$CLI config set hub_url "$HUB_URL"
$CLI config set api_key "$API_KEY"
$CLI config set skills_dir "${SKILLS_DIR:-$HOME/.claude/skills}"
$CLI config set default_project "${DEFAULT_PROJECT:-personal-ai}"

echo "Configured:"
$CLI config get hub_url
$CLI config get skills_dir
echo "api_key: (set)"
