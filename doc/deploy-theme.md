# Deploy the theme

Use the root-level `deploy.sh` script to deploy the theme into your local Dotclear installation.

1. Create a `.env` file at the root of the repository with the following content:

   ```bash
   # Path to your local Dotclear installation
   DEV_LOCAL_DOTCLEAR_FOLDER="~/Public/htdocs/blog"
   ```

2. Run the deployment script:

   ```bash
   npm run deploy
   ```

   This deploys to the dev environment. You can also run `npm run deploy:dev` explicitly, or `npm run deploy:prod` for production (not implemented yet).

   Alternatively, call the script directly: `./deploy.sh [dev|prod]`.

The script replaces the existing `themes/china` folder in the Dotclear installation without touching other themes.
