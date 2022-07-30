# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
* Environment url for nightly
* Better config options in `src/config/*.json` and `auth-server`.
* Regex escaping for search input
* local IPFS node support in dev (See [README](./README.md) for setup guides) 
* Mantine UI library
* Better event messages on [EventView](src/customComponents/ProjectProfile/components/EventView.tsx)


### Changed
* More Explicit types to better match what is actually present. I.e toHuman vs toJSON
* Updated types.json
* Reran Typegen (changed casing)
* Startup scripts and environments for `auth-server` and `functions`
* MAJOR refactoring of files, following new [NRN](https://unlyed.github.io/next-right-now/reference/folder-structure.html) folder structure
* Fixed a lot of typescript issues for strict mode (including api availability from `useSubstrate`)
* Cleaned up providers and included `@types/react-dom` to match our version.


### Removed
* `.env` config option
* Storybook, styled-components
* `query-string` in favour of `URLSearchParams`
* JSON project class in favour of onchain fields
* `*.scss` files, only left few css files that are still useful

## [v0.0.1-nightly-16-03-22] - 2022-03-16
### Added

### Changed

### Removed


[Unreleased]: https://github.com/chocolatenetwork/chocolate-front-end/compare/v0.0.1-nightly-15-5-22...development
<!-- update with more diffs -->

[v0.0.1-nightly-23-03-22-4]: https://github.com/chocolatenetwork/chocolate-front-end/compare/v0.0.1-nightly-16-03-22--2...v0.0.1-nightly-23-03-22-4
[v0.0.1-nightly-16-03-22]: https://github.com/chocolatenetwork/chocolate-front-end/releases/tag/v0.0.1-nightly-16-03-22--2
