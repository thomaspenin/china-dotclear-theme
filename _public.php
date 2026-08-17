<?php

# -- BEGIN LICENSE BLOCK ----------------------------------
#
# "China" theme for Dotclear
# --------------------------
# Author: Thomas PENIN
# Website: https://www.voyage-est.com
# License: GNU/GPL
# -- END LICENSE BLOCK ------------------------------------

if (!defined('DC_RC_PATH')) { return; }

# Language additions
l10n::set(dirname(__FILE__).'/locales/'.$_lang.'/public');

// --- Alias management ---

// Register our alias handler
$core->url->register('alias','','^(.*)$',array('urlAlias','alias'));

/**
 * Object in charge of intercepting URL aliases and loading the right template file from the theme
 */
class urlAlias extends dcUrlHandlers
{
  public static function alias($args)
  {
    // Global Dotclear core object
    global $core;

    // Handle the particular case of pagination on the main page
    if (preg_match('/\/page\/(?P<digit>\d+)/', $args, $matches) == 1)
    {
      self::home($args);
      return;
    }

    // In case we are dealing with pagination, our args will look like "mon_tpl/page/2"
    if (preg_match('/(?P<name>\w+)\/page\/(?P<digit>\d+)/', $args, $matches) == 1)
    {
      // Name of the template
      $args = $matches['name'];
      $GLOBALS["_page_number"] = $matches['digit'];
    }

    // The template shall be named after the URL alias that was provided
    $tpl = $args.'.html';

    // If the template exists, serve it, otherwise return 404
    if ($core->tpl->getFilePath($tpl))
      self::serveDocument($tpl);
    else
      self::p404();
  }
}

// --- Retrieve the current version of the theme ---

$core->tpl->addValue('ThemeVersion',array('tplThemeVersionTpl','ThemeVersion'));

class tplThemeVersionTpl
{
  public static function ThemeVersion($attr)
  {
    // Global Dotclear core object
    global $core;
    // Get the version of the current theme
    $version = $core->themes->moduleInfo($core->blog->settings->system->theme,"version");
    
    return $version;
    }
}
    
// --- Translate a string with arguments (taken from po files) ---

/**
 * Translate and format a string from the theme's public.po file.
 *
 * Usage in a template:
 *   {{tpl:ArgLang string="Example %s" arg1="value"}}
 *
 * The string attribute is the complete translation key, including its
 * formatting placeholders. Arguments are numbered arg1, arg2, and so on.
 * The supported placeholders are:
 *   %s - a regular string argument, such as arg1="value"
 *   %u - the current BlogURL in an argument, such as arg1="%u/tags"
 *
 * A %u argument is expanded at render time and has its trailing slash
 * normalized before an optional suffix is appended.
 * 
 * Usage in po files:
 *   msgid "Example %s"
 *   msgstr "Exemple %s"
 */
$core->tpl->addValue('ArgLang', array('tplArgLang','ArgLang'));

class tplArgLang
{
  public static function ArgLang($attr)
  {
    if (empty($attr['string']))
      return;

    $args = array();
    foreach ($attr as $name => $value)
    {
      if (preg_match('/^arg([1-9][0-9]*)$/', $name, $matches))
      {
        if (strpos($value, '%u') !== false)
        {
          $parts = explode('%u', $value);
          $url = 'rtrim($core->blog->url,\'/\')';
          $args[(int) $matches[1] - 1] = var_export($parts[0], true).'.'.$url;
          if (isset($parts[1]))
            $args[(int) $matches[1] - 1] .= '.'.var_export($parts[1], true);
        }
        else
        {
          $args[(int) $matches[1] - 1] = var_export($value, true);
        }
      }
    }

    if (!empty($args))
    {
      ksort($args);
      $arguments = 'array('.implode(',', $args).')';
      $output = 'vsprintf(__('.var_export($attr['string'], true).'),'.$arguments.')';
    }
    else
    {
      $output = '__('.var_export($attr['string'], true).')';
    }

    return '<?php global $core; echo '.$output.'; ?>';
  }
}

?>
