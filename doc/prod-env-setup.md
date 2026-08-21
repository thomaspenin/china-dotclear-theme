# Production development environment setup

1. Install [Dotclear](https://dotclear.org/) on your production server according to the [official installation instructions](https://dotclear.org/post/2025/11/08/Installation).

2. [Deploy the theme](./deploy-theme.md) in production mode, either by running `npm run deploy:prod` or by calling the script directly: `./deploy.sh prod`. This will build the theme with minified CSS and JavaScript in the folder that you will have specified via the `PROD_LOCAL_FTP_FOLDER` variable in your `.env` file.

3. From there, upload/sync that folder to the production server with your FTP client of choice, so that the `china` folder is deployed into the `themes/` folder.

4. Log into the admin interface.

5. [Configure Dotclear](./dotclear-config.md)

6. Check that the blog is working correctly.
