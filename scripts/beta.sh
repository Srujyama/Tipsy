#!/usr/bin/env bash
# Run: ./scripts/beta.sh
# Builds a Release archive and uploads to TestFlight.
# Expects fastlane/.env with ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_FILEPATH.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec env -i HOME="$HOME" USER="$USER" \
  GEM_HOME="$HOME/.gem/ruby/3.3.0" \
  GEM_PATH="$HOME/.gem/ruby/3.3.0:$HOME/.rvm/rubies/ruby-3.3.0/lib/ruby/gems/3.3.0" \
  PATH="$HOME/.rvm/rubies/ruby-3.3.0/bin:$HOME/.nvm/versions/node/v20.19.3/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/homebrew/bin" \
  LANG=en_US.UTF-8 \
  /Users/srujanyamali/.rvm/rubies/ruby-3.3.0/bin/ruby \
    /Users/srujanyamali/.gem/ruby/3.3.0/gems/fastlane-2.232.2/bin/fastlane ios beta
