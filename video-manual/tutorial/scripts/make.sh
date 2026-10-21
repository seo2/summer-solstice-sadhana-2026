#!/bin/sh
# Rebuild scenes + index.html, then carve the music bed under the voice-over.
# HF_CORE: a directory with node_modules/@hyperframes/core (carve needs it), e.g. from
#   npm i @hyperframes/core@0.8.181 in a scratch folder.
set -eu
cd "$(dirname "$0")/.."
python3 scripts/build.py
sh scripts/music.sh
node "$HOME/.claude/skills/hyperframes-audio/scripts/carve.mjs" --comp index.html --bed music-bed ${HF_CORE:+--core "$HF_CORE"}
