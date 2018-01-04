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

// --- List files in a folder matching a given pattern ---

/*
 * <tpl:ListFiles folder="../test" pattern="/^china_.*.tar.gz/" prefix="china_"
 * suffix=".tar.gz"}}><tpl:ListFiles>
 * where "folder" is the path to the folder to inspect, "pattern" a regular expression
 * that the file names have to meet, "prefix" and "suffix" parts of the file name that
 * have to be removed to be added to the result.
 * Return results are an <ul> list, where each item is named "Version XX" ("XX"
 * corresponding to the name of the file removing the prefix and suffix) and is a link
 * pointing to the original file.
 */

$core->tpl->addBlock('ListFiles',array('tplListFilesTpl','ListFiles'));

class tplListFilesTpl
{
  public static function ListFiles($attr, $content)
  {
    // Get the current directory
    $folder       = $attr['folder'];
    $dir          = getcwd() . "/" . $folder;
    $pattern      = $attr['pattern'];
    $resultPrefix = "<ul>";
    $resultSuffix = "</ul>";
    $result       = "";
    $prefix       = $attr['prefix'];
    $suffix       = $attr['suffix'];

    // List the files
    $files = scandir($dir);

    // Filter to keep the theme files
    $filtered_files = preg_grep($pattern, $files);

    // Print the list
    foreach ($filtered_files as $value)
    {
      $version = $value;

      if (substr($value, 0, strlen($prefix)) == $prefix) {
	$version = substr($version, strlen($prefix));
      }
      $version = substr($version, 0, -strlen($suffix));

      $result .= "<li><a href='" . $folder . "/" . $value . "'>Version $version</a></li>";
    }

    // Concat result
    return $resultPrefix . $result . $resultSuffix;
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

?>
