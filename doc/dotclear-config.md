# Dotclear configuration

1. Install and configure the required plugins:
   1. Go to the "Plugins management" section and install the `TemplateHelper` from the directory (it is required by MyMeta).
   2. Go to the "Install or upgrade manually" and add the following plugin by getting their zip URL from their Github repository "release" pages:
      - [ColorBox](https://github.com/Philippe-dev/colorbox)
      - [MyMeta](https://github.com/franck-paul/mymeta)
      - [AccessibleCaptcha](https://github.com/franck-paul/accessibleCaptcha)

   3. Configure MyMeta:
      - Add a metadata called `ENTRY_IMAGE`, with type `String` and description "Image associated to the post (relative path to the public media folder of the blog)"
      - Add a metadata called `ENTRY_LARGE_IMAGE`, with type `String` and description "Large image for home page thumbnails (400 x 300, path from root of media folder)"
      - Ensure to set the metadata as "enabled".

   4. Configure AccessibleCaptcha to add a few challenges (this way it is possible to test the anti-spam feature behavior). This is made via the "Antispam" section of the admin interface.

2. (Optional) Import data from a previous Dotclear blog: content and media

3. Create the "about" page if it doesn't exist yet. Set the `basename` field to "about", so that the theme can find it.

4. Configure the blog via the "Blog settings":
   - Set the "Blog name". It is used as the main title in the main toolbar
   - Set the "Blog description". It is used as the subtitle in the main toolbar.
   - Set the default language
   - Set the time zone
   - Check "Display smilies on entries and comments"

5. Configure the theme via the "Block appearance" section: set the theme to "china".

   **Note:** If the "china" theme is not available, it means that the theme was not deployed correctly. Please check the deployment instructions in the [Deploy the theme](./deploy-theme.md) document.
