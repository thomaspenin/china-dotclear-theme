# Deploy the theme

Use the root-level `deploy.sh` script to deploy the theme, either into your local Dotclear
installation (dev) or into a local staging folder meant to be uploaded to the production FTP
server (prod).

## Dev

1. Create a `.env` file at the root of the repository with the following content:

   ```bash
   # Path to your local Dotclear installation
   DEV_LOCAL_DOTCLEAR_FOLDER="~/Public/htdocs/blog"
   ```

2. Run the deployment script:

   ```bash
   npm run deploy
   ```

   This deploys to the dev environment. You can also run `npm run deploy:dev` explicitly.

   Alternatively, call the script directly: `./deploy.sh dev`.

The script replaces the existing `themes/china` folder in the Dotclear installation without
touching other themes. The stylesheet is compiled from SCSS with a source map, and the scripts
are left untouched (not minified), to ease debugging.

## Prod

1. Add the following to your `.env` file:

   ```bash
   # Local folder used to stage the theme before uploading it to the production FTP server (create it or change it to your liking)
   PROD_LOCAL_FTP_FOLDER="~/Public/voyage-est-ftp"
   ```

   This folder should be the local mirror of your FTP client's remote root (or of whatever
   folder on it you sync `themes/` from) — the script only manages a `china` subfolder inside
   it and never touches anything else there.

2. Run the deployment script:

   ```bash
   npm run deploy:prod
   ```

   Alternatively, call the script directly: `./deploy.sh prod`.

The script builds the same content as the dev deployment, but with the stylesheet compiled in
compressed mode (no source map) and every script in `includes/js` minified with `terser`. The
result replaces the `china` folder inside `PROD_LOCAL_FTP_FOLDER` without touching its other
content. From there, upload/sync that folder to the production server with your FTP client of
choice — actual FTP upload is not automated by this script.

Before building anything, the script checks that the version number in `_define.php`,
`package.json`, and the last (topmost) entry of `changelog.md` are all identical, and aborts
otherwise. Bump all three together when releasing a new version.
