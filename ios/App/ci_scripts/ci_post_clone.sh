#!/bin/sh
# Xcode Cloud post-clone hook. The clone has no node_modules (the Capacitor plugin
# Swift packages resolve from there) and no ios/App/App/public (the exported web app
# is gitignored), so install deps, build the static export and sync it into the iOS
# project before Xcode resolves packages and archives.
set -e

cd "${CI_PRIMARY_REPOSITORY_PATH:-$(dirname "$0")/../../..}"

if ! command -v node >/dev/null 2>&1; then
  export HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1
  brew install node@22
  export PATH="$(brew --prefix node@22)/bin:$PATH"
fi
echo "node $(node -v), npm $(npm -v)"

npm ci
npm run build
npx cap sync ios
