# Entries markup

The theme defines a certain number of markup elements that can be used in the content of the posts. Here is a list of the most important ones.

## Chinese text and pinyin

- `<ch>...</ch>` / `<chb>...</chb>`: marks Chinese text so it is automatically enlarged for legibility (this actually happens for any run of Chinese characters found in the page, tagged or not). `<chb>` renders in bold. An optional `pinyin` attribute adds a tooltip with the corresponding pinyin, shown on hover:

  ```html
  <ch pinyin="ni3hao3">你好</ch>
  ```

- `<py>...</py>` / `<pyb>...</pyb>`: marks pinyin text. `<pyb>` renders in bold. Numbered-tone syntax (e.g. `ni3hao3`) is automatically converted to accented pinyin (e.g. "nǐhǎo") on page load:

  ```html
  <py>Xi1you2ji4</py>
  ```

- `<char>...</char>`: marks a single character being taught/introduced (used in beginner lesson posts), excluded from the automatic Chinese-text-enlarging behavior described above.

## Callout boxes

- `.information` / `.hint` / `.warning` / `.error`: inline callout boxes for informational asides, tips, warnings, and errors, each with a matching icon. Apply the class to a `<p>`, `<div>`, `<ul>`, or `<ol>`:

  ```html
  <p class="information">This is an informational note.</p>
  ```

- `.callout`: a plain highlighted box (background + padding, no icon) for setting a block of content apart, e.g. a tip or a usage example:

  ```html
  <div class="callout">
    <p><strong>Using a Chinese dictionary</strong></p>
    <ol>
      <li>...</li>
    </ol>
  </div>
  ```

- `.retro-comment` (+ `.retro-comment-title` / `.retro-comment-body`): a titled aside box, used for retrospective comments added to older travel diary entries:

  ```html
  <div class="retro-comment">
    <div class="retro-comment-title">
      Commentaires rétrospectifs (17/02/2014)
    </div>
    <div class="retro-comment-body">
      <p>...</p>
    </div>
  </div>
  ```

## Vocabulary lists

Use `.vocabulary` on a `<div>` wrapping one `<p>` per term (term, then a line break, then its translation). The list automatically flows into 2 columns on tablets and 3 columns on desktop:

```html
<div class="vocabulary">
  <p><ch>中国</ch> <py>Zhong1guo2</py><br />China</p>
  <p><ch>中国人</ch> <py>Zhong1guo2ren2</py><br />Chinese (person)</p>
</div>
```

## Exercises

Use an ordered list with `.exercice` list items, each containing a `.question` and an `.answer` block. The answer is hidden by default and can be expanded by the reader:

```html
<ol>
  <li class="exercice">
    <div class="question">Text of the question</div>
    <div class="answer">Text of the answer</div>
  </li>
</ol>
```

## Audio players

`.player` (full player) or `.miniplayer` (single play button) on a `<div>` whose text content is a comma-separated list of audio source URLs (provide multiple formats, e.g. both `.mp3` and `.ogg`, for browser compatibility):

```html
<div class="player">/public/sounds/nihao.mp3,/public/sounds/nihao.ogg</div>
<div class="miniplayer">/public/sounds/nihao.mp3,/public/sounds/nihao.ogg</div>
```

## Images

- Use `<figure>`/`<figcaption>` to caption an image, optionally wrapping it in a link to a larger version:

  ```html
  <figure>
    <a href="/path/to/large.jpg"
      ><img src="/path/to/thumbnail.jpg" alt="..."
    /></a>
    <figcaption>Caption text</figcaption>
  </figure>
  ```

- Use `.img-fluid` on an `<img>` so it scales down to fit its container on narrow screens.

- For a side-by-side image gallery, use a Bootstrap grid `.row` with `.col-sm-6` (or another column width) children, each typically wrapping a `<figure>`:

  ```html
  <div class="row">
    <div class="col-sm-6">
      <figure>
        <img src="..." alt="..." />
      </figure>
    </div>
    <div class="col-sm-6">
      <figure>
        <img src="..." alt="..." />
      </figure>
    </div>
  </div>
  ```

See [post-img.md](post-img.md) for how to associate a thumbnail/large image with a post so it appears in post lists and on the home page.

## Tables

Wrap tables in `.table-responsive` so they scroll horizontally on narrow screens, and use Bootstrap's `.table`/`.table-striped`/`.table-bordered` on the `<table>` itself:

```html
<div class="table-responsive">
  <table class="table table-striped">
    <tbody>
      <tr>
        <th>Header</th>
        <td>Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Video embeds

Use Bootstrap's `.ratio` helper to keep an embedded video's aspect ratio responsive, with `.ratio-4x3` or `.ratio-16x9` depending on the source video:

```html
<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
</div>
```

## Footnotes

Use the class `footnote` to style footnotes. For example:

```html
<p>This is a paragraph with a footnote.<sup>1</sup></p>
...
<div class="footnote">
  <p>
    <sup>1</sup> This is a footnote. It can contain <a href="#">links</a> and
    other HTML elements.
  </p>
</div>
```

## Media display

In some cases, one may want to display a small image on the left and text on the right.

Here is how to do it:

```html
<div class="d-flex">
  <div class="flex-shrink-0">
    <p>
      <img
        alt="Brumes de l'aube"
        class="flex-shrink-0"
        src="/blogs/voyage-est/public/articles/Wallpapers_2016/.Brumes_de_l_aube_s.jpg"
      />
    </p>
  </div>
  <div class="flex-grow-1 ms-3">
    <p>
      Cette photo a été prise lors d'un séjour à 黄山 <py>Huang2shan1</py>, la
      Montagne Jaune, en avril 2015. Après avoir passé une journée à crapahuter
      dans les escaliers et une mauvaise nuit au sommet dans un hôtel à
      l'isolation phonique inexistante, nous nous étions levés à 4h45 et
      assister au lever du soleil&nbsp;!
    </p>
  </div>
</div>
```
