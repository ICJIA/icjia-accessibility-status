#!/bin/bash
cd /Users/cschweda/webdev/icjia-accessibility-status
git add -A
git commit -m "Comprehensive deployment documentation audit and cleanup

- Removed 16 outdated deployment files with Docusaurus references
- Removed all port 3002 and docs service references
- Updated architecture.md to reflect 2-service architecture
- Fixed migration file names in deployment docs
- Updated production.md, nginx.md, overview.md
- Verified package.json scripts are current"
git push origin main

