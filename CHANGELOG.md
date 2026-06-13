# Changelog

All notable changes to ThreatPkg are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-06-08

### Added

- Dependency manifest scanner: upload lock files or manifests to check pinned versions against malware and supply-chain incidents
- Support for npm (`package-lock.json`, `pnpm-lock.yaml`), Poetry, requirements.txt, and more
- Package search filter on scan results
- Incident OG images for social sharing

### Changed

- Refreshed package metadata and incident history UI
- Copy actions replace visible source hashes
- Improved dependency scan reliability and feedback for multi-project uploads

### Removed

- Reputation score component from package pages
