#!/bin/bash

# CodeQL Local Analysis Script
# This script runs CodeQL analysis locally before pushing to GitHub
# Usage: ./libs/utilities/scripts/run-codeql-local.sh [--upload]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LANGUAGE="javascript"
DATABASE_NAME="codeql-database"
RESULTS_FILE="codeql-results.sarif"
QUERY_SUITE="javascript-security-extended.qls"

# Check if CodeQL CLI is installed
check_codeql() {
  if ! command -v codeql &> /dev/null; then
    echo -e "${RED}❌ CodeQL CLI is not installed${NC}"
    echo -e "${YELLOW}📦 Installing CodeQL CLI...${NC}"
    echo ""
    echo "Please install CodeQL CLI using one of these methods:"
    echo ""
    echo "1. Using Homebrew (macOS):"
    echo "   brew install codeql"
    echo ""
    echo "2. Manual installation:"
    echo "   Visit: https://github.com/github/codeql-cli-binaries/releases"
    echo "   Download the latest release for your OS"
    echo "   Extract and add to PATH"
    echo ""
    echo "3. Using GitHub CLI (if you have gh installed):"
    echo "   gh extension install github/gh-codeql"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✅ CodeQL CLI found: $(codeql version)${NC}"
}

# Clean up previous database
cleanup() {
  if [ -d "$DATABASE_NAME" ]; then
    echo -e "${YELLOW}🧹 Cleaning up previous database...${NC}"
    rm -rf "$DATABASE_NAME"
  fi
}

# Create CodeQL database
create_database() {
  echo -e "${BLUE}📦 Creating CodeQL database for $LANGUAGE...${NC}"
  
  # Clean up first
  cleanup
  
  # Create database
  codeql database create "$DATABASE_NAME" \
    --language="$LANGUAGE" \
    --source-root="." \
    --command="npm run build" \
    --threads=0 || {
    echo -e "${RED}❌ Failed to create database${NC}"
    echo -e "${YELLOW}💡 Trying without build command...${NC}"
    codeql database create "$DATABASE_NAME" \
      --language="$LANGUAGE" \
      --source-root="." \
      --threads=0
  }
  
  if [ ! -d "$DATABASE_NAME" ]; then
    echo -e "${RED}❌ Database creation failed${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Database created successfully${NC}"
}

# Analyze the database
analyze() {
  echo -e "${BLUE}🔍 Analyzing codebase with CodeQL...${NC}"
  
  codeql database analyze "$DATABASE_NAME" \
    "$QUERY_SUITE" \
    --format=sarifv2.1.0 \
    --output="$RESULTS_FILE" \
    --threads=0 || {
    echo -e "${RED}❌ Analysis failed${NC}"
    exit 1
  }
  
  if [ ! -f "$RESULTS_FILE" ]; then
    echo -e "${RED}❌ Results file not created${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Analysis complete. Results saved to $RESULTS_FILE${NC}"
}

# Display results summary
show_summary() {
  echo -e "${BLUE}📊 Analysis Summary:${NC}"
  echo ""
  
  # Try to extract summary from SARIF file if jq is available
  if command -v jq &> /dev/null && [ -f "$RESULTS_FILE" ]; then
    echo "Results file: $RESULTS_FILE"
    echo ""
    echo "To view detailed results, you can:"
    echo "1. Open the SARIF file in VS Code with the SARIF extension"
    echo "2. Upload to GitHub (see --upload option)"
    echo "3. Use: codeql bqrs interpret <database>/results/javascript.bqrs"
  else
    echo "Results file: $RESULTS_FILE"
    echo ""
    echo "Install 'jq' for better result parsing, or view the SARIF file directly"
  fi
}

# Upload results to GitHub (optional)
upload_results() {
  if [ "$1" != "--upload" ]; then
    return
  fi
  
  echo -e "${BLUE}📤 Uploading results to GitHub...${NC}"
  
  # Check for GitHub token
  if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ GITHUB_TOKEN environment variable is not set${NC}"
    echo -e "${YELLOW}💡 Set it with: export GITHUB_TOKEN=your_token${NC}"
    echo -e "${YELLOW}💡 Token needs 'security_events: write' permission${NC}"
    exit 1
  fi
  
  # Get repository info from git
  REPO_OWNER=$(git remote get-url origin | sed -E 's/.*github.com[:/]([^/]+)\/([^/]+)(\.git)?$/\1/')
  REPO_NAME=$(git remote get-url origin | sed -E 's/.*github.com[:/]([^/]+)\/([^/]+)(\.git)?$/\2/' | sed 's/\.git$//')
  BRANCH=$(git branch --show-current)
  
  if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ Could not determine repository information${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Repository: $REPO_OWNER/$REPO_NAME${NC}"
  echo -e "${YELLOW}Branch: $BRANCH${NC}"
  
  codeql github upload-results \
    --repository="$REPO_OWNER/$REPO_NAME" \
    --ref="$BRANCH" \
    --sarif="$RESULTS_FILE" \
    --github-auth-stdin <<< "$GITHUB_TOKEN" || {
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
  }
  
  echo -e "${GREEN}✅ Results uploaded to GitHub${NC}"
  echo -e "${YELLOW}💡 Check the Security tab in your repository${NC}"
}

# Main execution
main() {
  echo -e "${BLUE}🔐 CodeQL Local Analysis${NC}"
  echo -e "${BLUE}=======================${NC}"
  echo ""
  
  # Check prerequisites
  check_codeql
  
  # Create database
  create_database
  
  # Analyze
  analyze
  
  # Show summary
  show_summary
  
  # Upload if requested
  if [ "$1" == "--upload" ]; then
    upload_results "$1"
  else
    echo ""
    echo -e "${YELLOW}💡 To upload results to GitHub, run with --upload flag:${NC}"
    echo -e "${YELLOW}   ./libs/utilities/scripts/run-codeql-local.sh --upload${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✅ CodeQL analysis complete!${NC}"
}

# Run main function
main "$@"

