/*!
 * @instructions To create players, use code like the following one in the Dotclear XHTML editor:
 * 		   <div class="player">/dotclear/public/Test_sons/nihao.ogg</div>
 * 		 ... for a full HTML 5 player
 * 		   <div class="miniplayer">/dotclear/public/Test_sons/nihao.ogg</div>
 * 		 ... for a small player (reduced to a play button)
 * This script will then prepare the players.
 * @important The media file shall have an "ogg" or "mp3" extension
 */

/*!
 * @abstract Function to configure the players on the page
 * @discussion To be called when the document is ready
 */
function prepareAudioPlayers() {
  function parseSources(text) {
    return text
      .split(",")
      .map(function (value) {
        return $.trim(value);
      })
      .filter(function (value) {
        return value.length > 0;
      });
  }

  function guessMimeType(source) {
    var ext = source.split(".").pop().toLowerCase();
    if (ext == "mp3") return "audio/mpeg";
    if (ext == "m4a") return "audio/mp4";
    return "audio/ogg";
  }

  $(".player").each(function (index) {
    // Create a player for the media
    var src = parseSources($(this).text());
    $(this)
      .contents()
      .replaceWith(function () {
        var result =
          '<audio class="audioPlayer" controls>' +
          "Your browser does not support the audio tag.";
        for (var i = 0; i < src.length; i++) {
          var source = src[i];
          var type = guessMimeType(source);

          // Create the source
          result += '<source src="' + source + '" type="' + type + '"/>';
        }
        result += "</audio>";
        return result;
      });
  });

  $(".miniplayer").each(function (index) {
    // Create a player for the media
    var src = parseSources($(this).text());
    $(this)
      .contents()
      .replaceWith(function () {
        var result =
          '<audio class="audioPlayer" preload="auto">' +
          "Your browser does not support the audio tag.";
        for (var i = 0; i < src.length; i++) {
          var source = src[i];
          var type = guessMimeType(source);

          // Create the source
          result += '<source src="' + source + '" type="' + type + '"/>';
        }
        result += "</audio>";
        return result;
      });

    // Add a play button
    var audioPlayer = $(this).children(".audioPlayer")[0];
    $(this).append('<i class="playButton ph ph-play-circle"></i>');
    var playButton = $(this).children(".playButton");
    playButton.click(function () {
      if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  });
}
