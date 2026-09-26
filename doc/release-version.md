# Release a version

This document explains the steps to release a new version of the China Dotclear theme.

## Prepare the release

1. Make sure the release branch contains the latest changes from `main`:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

   Resolve any conflicts, then run the tests again after the rebase.

2. Choose the next version and use it consistently everywhere. Update:
   - the `Version` value in `_define.php`;
   - the `version` value in `package.json`;
   - the root package version in `package-lock.json` (both occurrences near the top of the file);
   - the top entry in `changelog.md`.

   The changelog entry must use the same version and a real release date in `YYYY-MM-DD` format.
   Keep the newest entry at the top. The production deployment checks the first three theme
   version values and the top changelog version before building.

3. Review the changelog entry. It should describe the user-visible changes in this release and
   must not contain placeholder dates or unfinished text.

4. Run the checks locally:

   ```bash
   npm install
   npm test
   ```

## Build and publish

5. Configure `PROD_LOCAL_FTP_FOLDER` in `.env`, then build the production package:

   ```bash
   npm run deploy:prod
   ```

   This validates the versions, compiles compressed CSS, minifies JavaScript, and prepares the
   `china` folder in the local FTP staging directory. It does not upload anything to the server.

6. Upload or sync the staged `china` folder to the production Dotclear `themes/` directory,
   then verify the theme and the main user-facing pages on the production site.

7. Commit the release changes and push the branch:

   ```bash
   git add _define.php package.json package-lock.json changelog.md doc/release-version.md
   git commit -m "Release vX.Y"
   git push origin HEAD
   ```

8. Check the tag format against the existing tags before creating the new one. Tags are
   lightweight tags named `vX.Y`, for example `v3.1` and `v3.2`:

   ```bash
   git tag --list --sort=version:refname
   git tag vX.Y
   git push origin vX.Y
   ```

9. On GitHub, open the repository's [Releases page](https://github.com/thomaspenin/china-dotclear-theme/releases)
   and create a release for the new tag. Copy the complete top entry for that version from
   `changelog.md` into the GitHub release notes, omitting the version heading if GitHub already
   displays it. Mark the release as the latest release.
