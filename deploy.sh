#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/.env"

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [dev|prod]

Deploy the theme.

- dev: copies the theme, with a plain (non-minified) build of the stylesheet, into a local
  Dotclear installation's themes folder (DEV_LOCAL_DOTCLEAR_FOLDER in .env).
- prod: copies the theme, with minified CSS and JS, into a local staging folder
  (PROD_LOCAL_FTP_FOLDER in .env) meant to be uploaded to the production FTP server.

The default environment is dev.
EOF
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

environment="dev"

while [[ $# -gt 0 ]]; do
  case "$1" in
    dev|prod)
      environment="$1"
      shift
      ;;
    -e|--env)
      [[ $# -ge 2 ]] || die "Missing value for $1"
      environment="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ -f "$env_file" ]] || die ".env file not found at $env_file"

# shellcheck source=/dev/null
source "$env_file"

if [[ "$environment" == "dev" ]]; then
  [[ -n "${DEV_LOCAL_DOTCLEAR_FOLDER:-}" ]] || die "DEV_LOCAL_DOTCLEAR_FOLDER is not set in .env"

  dotclear_root="${DEV_LOCAL_DOTCLEAR_FOLDER/#\~/$HOME}"
  dotclear_root="${dotclear_root%/}"
  target_dir="$dotclear_root/themes/china"

  [[ -d "$dotclear_root" ]] || die "Dotclear installation not found at $dotclear_root"
else
  [[ -n "${PROD_LOCAL_FTP_FOLDER:-}" ]] || die "PROD_LOCAL_FTP_FOLDER is not set in .env"

  ftp_staging_root="${PROD_LOCAL_FTP_FOLDER/#\~/$HOME}"
  ftp_staging_root="${ftp_staging_root%/}"
  target_dir="$ftp_staging_root/china"

  [[ -d "$ftp_staging_root" ]] || die "FTP staging folder not found at $ftp_staging_root"
fi

check_versions_match() {
  local define_version package_version changelog_line changelog_version

  define_version="$(sed -nE "s/.*\/\* Version \*\/[[:space:]]*'([^']+)'.*/\1/p" "$script_dir/_define.php")"
  package_version="$(sed -nE 's/^[[:space:]]*"version": *"([^"]+)".*/\1/p' "$script_dir/package.json" | head -n1)"
  changelog_line="$(grep -m1 -E '^\- v' "$script_dir/changelog.md" || true)"
  changelog_version="$(printf '%s' "$changelog_line" | sed -E 's/^\- v([^ ]+).*/\1/')"

  [[ -n "$define_version" ]] || die "Could not find the version in _define.php"
  [[ -n "$package_version" ]] || die "Could not find the version in package.json"
  [[ -n "$changelog_version" ]] || die "Could not find the last entry's version in changelog.md"

  if [[ "$define_version" != "$package_version" || "$define_version" != "$changelog_version" ]]; then
    die "Version mismatch: _define.php=$define_version, package.json=$package_version, changelog.md=$changelog_version"
  fi
}

if [[ "$environment" == "prod" ]]; then
  check_versions_match
fi

staging_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$staging_dir"
}
trap cleanup EXIT

mkdir -p "$staging_dir"

cp -f "$script_dir/screenshot.jpg" "$staging_dir/"
cp -f "$script_dir/LICENSE" "$staging_dir/"
cp -f "$script_dir/_define.php" "$staging_dir/"
cp -f "$script_dir/_public.php" "$staging_dir/"
cp -R "$script_dir/tpl" "$staging_dir/"
cp -R "$script_dir/smilies" "$staging_dir/"
cp -R "$script_dir/locales" "$staging_dir/"

rsync -a \
  --exclude '*.scss' \
  --exclude '*.sh' \
  --exclude '*.css.map' \
  --exclude 'style.css' \
  "$script_dir/includes/" \
  "$staging_dir/includes/"

# Compile SCSS to CSS last so the freshly built file is never overwritten by any stale one
printf 'Compiling stylesheets...\n'
mkdir -p "$staging_dir/includes/css"
if [[ "$environment" == "prod" ]]; then
  "$script_dir/node_modules/.bin/sass" --no-source-map --style=compressed "$script_dir/includes/css/style.scss" "$staging_dir/includes/css/style.css"

  printf 'Minifying scripts...\n'
  for js_file in "$staging_dir"/includes/js/*.js; do
    "$script_dir/node_modules/.bin/terser" "$js_file" --compress --mangle --output "$js_file"
  done
else
  "$script_dir/node_modules/.bin/sass" --source-map "$script_dir/includes/css/style.scss" "$staging_dir/includes/css/style.css"
fi

mkdir -p "$(dirname "$target_dir")"
rm -rf "$target_dir"
mv "$staging_dir" "$target_dir"

printf 'Theme deployed to %s\n' "$target_dir"