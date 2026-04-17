#!/usr/bin/env bash
# Run: ./scripts/pod-install.sh
# Installs iOS native pods. Uses env -i + COCOAPODS_NO_BUNDLER to bypass the
# project's vendored bundler 1.17.2 (broken on Ruby 3.3) and its .bundle/config.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec env -i HOME="$HOME" USER="$USER" COCOAPODS_NO_BUNDLER=1 \
  GEM_HOME="$HOME/.gem/ruby/3.3.0" \
  GEM_PATH="$HOME/.gem/ruby/3.3.0:$HOME/.rvm/rubies/ruby-3.3.0/lib/ruby/gems/3.3.0" \
  PATH="$HOME/.rvm/rubies/ruby-3.3.0/bin:$HOME/.nvm/versions/node/v20.19.3/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/homebrew/bin" \
  LANG=en_US.UTF-8 \
  /Users/srujanyamali/.rvm/rubies/ruby-3.3.0/bin/ruby \
    /Users/srujanyamali/.gem/ruby/3.3.0/gems/cocoapods-1.16.2/bin/pod install --project-directory="$ROOT/ios"
