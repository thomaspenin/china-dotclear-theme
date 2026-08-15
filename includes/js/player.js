/**
 * @instructions To create players, use code like the following one in the Dotclear XHTML editor:
 *            <div class="player">/dotclear/public/Test_sons/nihao.ogg</div>
 *          ... for a full HTML 5 player
 *            <div class="miniplayer">/dotclear/public/Test_sons/nihao.ogg</div>
 *          ... for a small player (reduced to a play button)
 * This script will then prepare the players.
 * @important The media file shall have an "ogg" or "mp3" extension
 */

/**
 * @abstract Function to configure the players on the page
 * @discussion To be called when the document is ready
 */
function prepareAudioPlayers() {
  function parseSources(text) {
    return text
      .split(",")
      .map(function (value) {
        return value.trim();
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

  function createAudioPlayer(sources, controls) {
    var audio = document.createElement("audio");
    audio.className = "audioPlayer";

    if (controls) {
      audio.controls = true;
    } else {
      audio.preload = "auto";
    }

    audio.appendChild(
      document.createTextNode("Your browser does not support the audio tag."),
    );

    sources.forEach(function (source) {
      var sourceElement = document.createElement("source");
      sourceElement.src = source;
      sourceElement.type = guessMimeType(source);
      audio.appendChild(sourceElement);
    });

    return audio;
  }

  document.querySelectorAll(".player").forEach(function (player) {
    var sources = parseSources(player.textContent);
    player.replaceChildren(createAudioPlayer(sources, true));
  });

  document.querySelectorAll(".miniplayer").forEach(function (player) {
    var sources = parseSources(player.textContent);
    var audioPlayer = createAudioPlayer(sources, false);
    var playButton = document.createElement("i");

    playButton.className = "playButton ph ph-play-circle";
    playButton.addEventListener("click", function () {
      if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });

    player.replaceChildren(audioPlayer, playButton);
  });
}
