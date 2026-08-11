# Deploy the theme

Use the root-level `deploy.sh` script to deploy the theme into your local Dotclear installation.

1. Create a `.env` file at the root of the repository with the following content:

   ```bash
   # Path to your local Dotclear installation
   DEV_LOCAL_DOTCLEAR_FOLDER="~/Public/htdocs/blog"
   ```

2. Run the deployment script:

   ```bash
   ./deploy.sh
   ```

   The script defaults to the dev environment. You can also pass `dev` explicitly. The `prod` environment is not implemented yet.

The script replaces the existing `themes/china` folder in the Dotclear installation without touching other themes.