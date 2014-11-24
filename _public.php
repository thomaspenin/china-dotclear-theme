<?php

# -- BEGIN LICENSE BLOCK ----------------------------------
#
# "China" theme for Dotclear
# --------------------------
# Author: Thomas PENIN
# Website: http://www.voyage-est.com
# License: GNU/GPL
# -- END LICENSE BLOCK ------------------------------------

if (!defined('DC_RC_PATH')) { return; }

# Language additions
l10n::set(dirname(__FILE__).'/locales/'.$_lang.'/public');

# Display tags by letters
$core->tpl->addBlock('TagsIfFirstLetter',array('TagsFL','TagsIfFirstLetter'));
$core->tpl->addValue('TagsFirstLetter',array('TagsFL','TagsFirstLetter'));

class TagsFL
{
	# <tpl:TagsIfFirstLetter> ... </tpl:TagsIfFirstLetter>
	public static function TagsIfFirstLetter($attr,$content)
	{
		return
		'<?php '.
		'if (mb_strlen($_ctx->TagsFirstLetter) == 0) {$_ctx->TagsFirstLetter = null;}'.
		'$_ctx->TagsFirstLetter = mb_strtoupper(text::cutString($_ctx->meta->meta_id,1));'.
		'if ($_ctx->TagsFirstLetter != $_ctx->TagsFirstLetter_next) : '.
		'?>'.
		$content.
		'<?php endif;'.
		'$_ctx->TagsFirstLetter_next = $_ctx->TagsFirstLetter;'.
		' ?>';
	}
	
	# {{tpl:TagsFirstLetter}}
	public static function TagsFirstLetter($attr)
	{
		$f = $GLOBALS['core']->tpl->getFilters($attr);
		
		return
		'<?php echo($_ctx->TagsFirstLetter); ?>';
	}
}

# Display total entries per tag
$core->tpl->addValue('CountTagEntries', array('tplMyThemeAdditions', 'CountTagEntries'));

class tplMyThemeAdditions {
	public static function CountTagEntries($attr)
	{
		return
		'<?php '.
		'if ($_ctx->meta->count==1) { echo sprintf("%d article",$_ctx->meta->count); }'.
		'else { echo sprintf("%d articles",$_ctx->meta->count); }'.
		' ?>';
	}
}

# Add new pagination
$core->tpl->addValue('PaginationLinks', array('tplMyPagination', 'PaginationLinks'));
class tplMyPagination {
	public static function PaginationLinks($attr)
	{
		$p = '<?php
		
		function makePageLink($pageNumber, $linkText) {
			if (isset($GLOBALS["_page_number"])) {
				$current = $GLOBALS["_page_number"];
			} else {
				$current = 1;
			}
			if ($pageNumber != $current) {
				$args = $_SERVER["URL_REQUEST_PART"];
				$args = preg_replace("#(^|/)page/([0-9]+)$#","",$args);
				$url = $GLOBALS["core"]->blog->url.$args;
				if ($pageNumber > 1) {
					$url = preg_replace("#/$#","",$url);
					$url .= "/page/".$pageNumber;
				}
				if (!empty($_GET["q"])) {
					$s = strpos($url,"?") !== false ? "&amp;" : "?";
					$url .= $s."q=".$_GET["q"];
				}
				$linkDesc = "Page &nbsp;".$linkText;
				return "<span><a href=\"".$url."\" title=\"".$linkDesc."\">".$linkText."</a></span>";
			} else {
				return "<span class=\"this\">".$linkText."</span>";
			}
		}
		
		if (isset($GLOBALS["_page_number"])) {
			$current = $GLOBALS["_page_number"];
		} else {
			$current = 1;
		}
		if ($_ctx->exists("pagination")) {
			$nb_posts = $_ctx->pagination->f(0);
		}
		
		/* Variables to tweak the pagination system */
		$nb_per_page = $_ctx->post_params["limit"][1];
		$nb_pages = ceil($nb_posts/$nb_per_page);
		$nb_sequence = 2 * 3 + 1;
		
		?>';
		
		if (!isset($attr['max'])) { $p .= '<?php $nb_page_max = 0; ?>'; } else { $p .= '<?php $nb_page_max = '.$attr['max'].'; ?>'; }
		$p .= '<?php
		
		if ($nb_page_max == 0 || $nb_pages <= $nb_page_max) {
			for ($i = 1; $i <= $nb_pages; $i++) {
				echo makePageLink($i,$i);
			}
		} else {
			echo makePageLink(1,1);
			$min_page = max($current - ($nb_sequence - 1) / 2, 2);
			$max_page = min($current + ($nb_sequence - 1) / 2, $nb_pages - 1);
			if ($min_page > 2) { echo "<span class=\"etc\">...</span>"; }
			for ($i = $min_page; $i <= $max_page ; $i++) {
				echo makePageLink($i,$i);
			}
			if ($max_page < $nb_pages - 1) { echo "<span class=\"etc\">...</span>"; }
			echo makePageLink($nb_pages,$nb_pages);
		}
		
		?>';
		
		return $p;
	}
}

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

?>