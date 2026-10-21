#!/bin/sh
# Loops the tour's 75 s bed once (4 s crossfade) and trims it to the film's length with a 4.5 s fade-out.
set -eu
cd "$(dirname "$0")/.."
T=$(python3 -c "import json;print(json.load(open('scripts/board.json'))[-1]['end'])")
ffmpeg -v error -y -i assets/audio/music-bed.m4a -i assets/audio/music-bed.m4a -filter_complex \
  "[0][1]acrossfade=d=4:c1=tri:c2=tri,atrim=0:$T,afade=t=in:d=0.5,afade=t=out:st=$(python3 -c "print($T-4.5)"):d=4.5" \
  -c:a aac -b:a 192k assets/audio/music-bed-long.m4a
echo "music bed: $T s"
