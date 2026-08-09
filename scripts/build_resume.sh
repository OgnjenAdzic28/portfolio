#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="$ROOT_DIR/resume/Ognjen_Adzic_Resume.tex"
OUTPUT_DIR="$ROOT_DIR/output/pdf"
PUBLIC_DIR="$ROOT_DIR/public"
PDF_NAME="Ognjen_Adzic_Resume.pdf"

if ! command -v tectonic >/dev/null 2>&1; then
  echo "tectonic is required. Install it with: brew install tectonic" >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/tmp/pdfs" "$OUTPUT_DIR" "$PUBLIC_DIR"
BUILD_DIR="$(mktemp -d "$ROOT_DIR/tmp/pdfs/resume-build.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT

tectonic --keep-logs --outdir "$BUILD_DIR" "$SOURCE_FILE"
cp "$BUILD_DIR/$PDF_NAME" "$OUTPUT_DIR/$PDF_NAME"
cp "$BUILD_DIR/$PDF_NAME" "$PUBLIC_DIR/$PDF_NAME"

echo "Built $OUTPUT_DIR/$PDF_NAME"
echo "Updated $PUBLIC_DIR/$PDF_NAME"
