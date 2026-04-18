fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios pods

```sh
[bundle exec] fastlane ios pods
```

Install CocoaPods (uses scripts/pod-install.sh to bypass vendored bundler 1.17.2)

### ios bump_build

```sh
[bundle exec] fastlane ios bump_build
```

Bump build number from App Store Connect latest + 1

### ios signing

```sh
[bundle exec] fastlane ios signing
```

Fetch or create Distribution cert + App Store provisioning profile

### ios build

```sh
[bundle exec] fastlane ios build
```

Build a signed Release archive

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Pods + bump + build + upload to TestFlight (internal)

### ios release

```sh
[bundle exec] fastlane ios release
```

Submit current TestFlight build to App Store review

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
