#!/usr/bin/env bash
# Sourced by scripts in ./scripts/. Produces a clean env that works around:
#   - vendored bundler 1.17.2 under /vendor/bundle (can't run on Ruby 3.3)
#   - RVM shims that intercept PATH
#   - .bundle/config forcing BUNDLE_PATH=vendor/bundle
# Pairs with `env -i` invocation in per-task scripts for full isolation.
export GEM_HOME="$HOME/.gem/ruby/3.3.0"
export GEM_PATH="$HOME/.gem/ruby/3.3.0:$HOME/.rvm/rubies/ruby-3.3.0/lib/ruby/gems/3.3.0"
export PATH="$HOME/.gem/ruby/3.3.0/bin:$HOME/.nvm/versions/node/v20.19.3/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/homebrew/bin"
export LANG=en_US.UTF-8
unset BUNDLE_GEMFILE BUNDLE_PATH BUNDLE_FORCE_RUBY_PLATFORM RUBYOPT RUBYLIB
