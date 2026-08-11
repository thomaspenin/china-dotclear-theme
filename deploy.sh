#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/.env"

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [dev|prod]

Deploy the theme to a local Dotclear installation.

The default environment is dev. Production deployment is not implemented yet.
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

if [[ "$environment" == "prod" ]]; then
  die "Production deployment is not implemented yet. Use dev instead."
fi

[[ -f "$env_file" ]] || die ".env file not found at $env_file"

# shellcheck source=/dev/null
source "$env_file"

[[ -n "${DEV_LOCAL_DOTCLEAR_FOLDER:-}" ]] || die "DEV_LOCAL_DOTCLEAR_FOLDER is not set in .env"

dotclear_root="${DEV_LOCAL_DOTCLEAR_FOLDER/#\~/$HOME}"
dotclear_root="${dotclear_root%/}"
themes_dir="$dotclear_root/themes"
target_dir="$themes_dir/china"

[[ -d "$dotclear_root" ]] || die "Dotclear installation not found at $dotclear_root"

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

# Compile SCSS to CSS for the deployed theme
printf 'Compiling stylesheets...\n'
mkdir -p "$staging_dir/includes/css"
"$script_dir/node_modules/.bin/sass" --source-map "$script_dir/includes/css/style.scss" "$staging_dir/includes/css/style.css"

rsync -a \
  --exclude '*.scss' \
  --exclude '*.sh' \
  --exclude '*.css.map' \
  "$script_dir/includes/" \
  "$staging_dir/includes/"

mkdir -p "$themes_dir"
rm -rf "$target_dir"
mv "$staging_dir" "$target_dir"

printf 'Theme deployed to %s\n' "$target_dir"