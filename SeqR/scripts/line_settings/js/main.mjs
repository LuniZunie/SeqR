/*
  Copyright 2024 Cedric Hotopp

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/**
 * @typedef { Events } Events
*/

import * as globalExports from '../../global/js/global.mjs';
Object.entries(globalExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

export {
  page,
  Update
};

const page = {
  loaded: {
    main: true,
    events: false,
  },
  settings: {
    c: [ 255, 255, 255, 255 ],
    l: {
      h: 5,
      b: 0,
      l: 0,
      r: 0,
    },
  },
  recentColors: (
    arr => (arr instanceof Array ? arr : []).toLength(32 - body.qsa('body > .color_spectrum > .recent > .color.preset').length, [ 0, 0, 0, 255 ], false)
  )(JSON.parse(localStorage.getItem('recentColors') || '[]')),
  spectrum_pen: body.qs('body > .color_spectrum > canvas.picker').getContext('2d', { willReadFrequently: true, alpha: false }),
};

window.addEventListener('message', function(e) {
  if (e.data.from == 'view') {
    page.settings = { c: e.data.c, l: e.data.l };
    body.style.setProperty('--page_bg', e.data.bg);

    Update();
  }
});

function Loaded() {
  page.events.add(window, 'window');
  html.qsa('[events]').forEach($ => {
    const evs = $.getAttr('events');
    if (evs !== null && evs !== undefined)
      page.events.add($, ...evs.split(/\s/));
  });

  UpdateRecentColors();
  LoadColorSpectrum();
  LoadBodySelectors();
  LoadHeadSelectors();
  Update();
}

function LoadColorSpectrum() {
  const $image = new Image();
  $image.src = '../../../assets/images/color_spectrum.png';
  $image.onload = function() {
    const $paper = body.qs('body > .color_spectrum > canvas.picker');

    $paper.width = $image.width;
    $paper.height = $image.height;

    page.spectrum_pen.drawImage($image, 0, 0);
  };

  body.style.opacity = 1;
}

function LoadHeadSelectors() {
  const $content = body.qs('body > .head_selector > .content');
  const columns = +getComputedStyle($content).columnCount;
  global.lineStyles.heads._$map(([ k ], i) => {
    const $head = $content.template('.head', 'append');

    const x = (i % columns) + 1;
    const y = (i / columns | 0) + 1;
    if (page.settings.l.l == i || page.settings.l.l == k) {
      $head.addClass('left');

      (function($code) {
        $code.qs('.name').innerText = global.lineStylesDisplayKey.heads[k];
        $code.qs('.x').innerText = x;
        $code.qs('.y').innerText = y;
      })(body.qs('body > .head_selector > p.selected > code.left'));
    }

    if (page.settings.l.r == i || page.settings.l.r == k) {
      $head.addClass('right');

      (function($code) {
        $code.qs('.name').innerText = global.lineStylesDisplayKey.heads[k];
        $code.qs('.x').innerText = x;
        $code.qs('.y').innerText = y;
      })(body.qs('body > .head_selector > p.selected > code.right'));
    }

    $head.setAttr('head', k);
    $head.setAttr('x', x);
    $head.setAttr('y', y);

    const { w, h } = $head.rect();

    const $g = $head.qs('g');
    $g.qsa('path:not(.template)')?.memRmv();

    const d = DrawSvgLine({ l: { l: k, r: k.replace(/(left|right)/g, v => v == 'left' ? 'right' : 'left') } }, w * 0.4, h * 0.4, w * 0.6, h * 0.6, 'head');
    if (d.length > 1)
      d.join(' ').split(/Z /).forEach(
        path => $g.template('path').setAttr('d', `${path.replace(/Z$/i, '').trim()} Z`)
      );

    return [ k, $head ];
  })._$sort(
    ([ , $a_head ], [ , $b_head ]) => +$a_head.getAttr('x') - +$b_head.getAttr('x') || +$a_head.getAttr('y') - +$b_head.getAttr('y')
  ).v_forEach(
    ($head, i) => $content.appendChild($head, i)
  );

  LoadEvents($content);
}

function LoadBodySelectors() {
  const $content = body.qs('body > .body_selector > .content');
  const columns = +getComputedStyle($content).columnCount;
  global.lineStyles.bodies._$map(([ k ], i) => {
    const $body = $content.template('.body', 'append');

    const x = (i % columns) + 1;
    const y = (i / columns | 0) + 1;
    if (page.settings.l.b == i || page.settings.l.b == k) {
      $body.addClass('selected');

      (function($code) {
        $code.qs('.name').innerText = global.lineStylesDisplayKey.bodies[k];
        $code.qs('.x').innerText = x;
        $code.qs('.y').innerText = y;
      })(body.qs('body > .body_selector > p.selected > code.text'));
    }

    $body.setAttr('body', k);
    $body.setAttr('x', x);
    $body.setAttr('y', y);

    const { w, h } = $body.rect();

    const $g = $body.qs('g');
    $g.qsa('path:not(.template)')?.memRmv();

    const d = DrawSvgLine({ l: { b: k } }, w * 0.1, h * 0.4, w * 0.9, h * 0.6, 'body');
    if (d.length > 1)
      d.join(' ').split(/Z /).forEach(
        path => $g.template('path').setAttr('d', `${path.replace(/Z$/i, '').trim()} Z`)
      );

    return [ k, $body ];
  })._$sort(
    ([ , $a_body ], [ , $b_body ]) => +$a_body.getAttr('x') - +$b_body.getAttr('x') || +$a_body.getAttr('y') - +$b_body.getAttr('y')
  ).v_forEach(
    ($body, i) => $content.appendChild($body, i)
  );

  LoadEvents($content);
}

function WaitForLoad() {
  if (page.loaded.v_every(v => v === true))
    return Loaded();

  requestIdleCallback(WaitForLoad);
}

WaitForLoad();

function UpdateRecentColors() {
  const $recent = body.qs('body > .color_spectrum > .recent');
  $recent.style.setProperty('--columns', $recent.qsa('.color.preset').findIndex(
    ($, i, arr) => $.rect().y != arr[0].rect().y
  ));

  $recent.qs('.preset.divider').style.setProperty('--blocks', $recent.qsa('.color.preset').length);
  $recent.qs('.shade.divider').style.setProperty('--blocks', $recent.qsa('.color.preset').filter(
    $ => $.getAttr('color').split(',').splice(0, 3).every((v, i, arr) => v == arr[0])
  ).length);

  page.recentColors.forEach(
    (c, i) => (function($) {
      $.setAttr('color', c.join(','));
      $.style.setProperty('--color_s', ColorArrayToColor(c, true));

      LoadEvents($);
    })($recent.qsa('.color:not(.preset, .template)')[i] ?? $recent.template('.color', 'preprend_template'))
  );

  $recent.qsa('.color.preset:not([style*="--color_s"])').forEach(
    $ => $.style.setProperty('--color_s', ColorArrayToColor(($.getAttr('color') || '0,0,0').split(',').map(v => +v).toLength(4, 255, false), true))
  );
}

function LoadEvents($) {
  $.qsa('[events]').concat($).forEach($ => {
    const evs = $.getAttr('events');
    if (evs !== null && evs !== undefined)
      page.events.add($, ...evs.split(/\s/));
  });

  return $;
}

function Update() {
  body.style.setProperty('--brightness', `${page.settings.c[3] / 2.55}%`);

  body.style.setProperty('--color', ColorArrayToColor(page.settings.c, false));
  body.style.setProperty('--color_i', ColorArrayToColor(page.settings.c, false, true));

  body.style.setProperty('--color_s', ColorArrayToColor(page.settings.c, true));
  body.style.setProperty('--color_si', ColorArrayToColor(page.settings.c, true, true));

  body.style.setProperty('--color_bg', InverseColorArrayShade(page.settings.c));

  body.qs('body > .brightness > .number > .input').innerText = (page.settings.c[3] / 2.55).round();

  ColorArrayToColor(page.settings.c, true).replace(/[^0-9,]/g, '').split(',').forEach(
    (v, i) => (function($) {
      if ($.innerText != v) {
        $.innerText = v;

        if (document.activeElement === $)
          $.cursorPosition(v.length);
      }
    })(body.qs(`body > .color_spectrum > .rgb > .${[ 'r', 'g', 'b' ][i]} > .input`))
  );

  Paint();
}

function Paint() {
  const $svg = body.qs('body > .preview > svg.easel');
  const { w, h } = $svg.rect();

  $svg.qsa('path:not(.template)')?.memRmv();

  const $path = $svg.template('path');
  $path.setAttr('fill', ColorArrayToColor(page.settings.c));
  $path.setAttr('d', `${DrawSvgLine(page.settings, w * 0.05, h * 0.4, w * 0.95, h * 0.6).join(' ')} Z`);
}