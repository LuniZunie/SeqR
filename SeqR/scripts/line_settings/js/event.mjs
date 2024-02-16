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

import * as mainExports from './main.mjs';
Object.entries(mainExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

page.events = new Events({
  window: {
    mousedown: function(e) {
      if (e.target) {
        const cs = getComputedStyle(e.target);
        if (cs.webkitUserSelect != 'none' || cs.userSelect != 'none')
          return;
      }

      body.cursorPosition(0);
    },
    mouseup: function(e) {
      [ 'body > .brightness > .slider', 'body > .color_spectrum > canvas.picker' ].forEach(selector =>
        body.qs(selector).setAttr('mousedown', false)
      );

      Update();
    },
    resize: function(e) {
      const id = FixedUpdate(() => Update());

      setTimeout(
        () => requestAnimationFrame( // function
          () => DeleteFixedUpdate(id)
        ),
        body.qs('body > .preview > svg.easel').gen(-Infinity, 0).flat(Infinity).map(
          $ => $ instanceof Element ? parseTransition($).max() : 0
        ).max()
      );
    },
  },
  head: {
    mousedown: function(e) {
      const $ = this;
      const $selector = body.qs('body > .head_selector');
      switch (e.button) {
        case 0: {
          $selector.qsa('.content > .head.left').forEach($ => $.rmvClass('left'));
          $.addClass('left');

          (function(v) {
            page.settings.l.l = v;

            (function($code) {
              $code.qs('.name').innerText = global.lineStylesDisplayKey.heads[v];
              $code.qs('.x').innerText = $.getAttr('x');
              $code.qs('.y').innerText = $.getAttr('y');
            })($selector.qs('p.selected > code.left'));
          })($.getAttr('head'));

          break;
        } case 1: {
          body.qsa('body > .head_selector > .content > .head:is(.left, .right)').forEach($ => $.rmvClass('left', 'right'));
          this.addClass('left', 'right');

          (function(v) {
            page.settings.l.l = v;
            page.settings.l.r = v.replace(/(left|right)/g, v => v == 'left' ? 'right' : 'left');

            [ 'left', 'right' ].forEach(
              dir => (function($code) {
                $code.qs('.name').innerText = global.lineStylesDisplayKey.heads[v];
                $code.qs('.x').innerText = $.getAttr('x');
                $code.qs('.y').innerText = $.getAttr('y');
              })($selector.qs(`p.selected > code.${dir}`))
            );
          })($.getAttr('head'));
          break;
        } case 2: {
          $selector.qsa('.content > .head.right').forEach($ => $.rmvClass('right'));
          $.addClass('right');

          (function(v) {
            page.settings.l.r = v.replace(/(left|right)/g, v => v == 'left' ? 'right' : 'left');

            (function($code) {
              $code.qs('.name').innerText = global.lineStylesDisplayKey.heads[v];
              $code.qs('.x').innerText = $.getAttr('x');
              $code.qs('.y').innerText = $.getAttr('y');
            })($selector.qs('p.selected > code.right'));

          })($.getAttr('head'));
          break;
        }
      }

      Update();
    },
    contextmenu: e => e.preventDefault(),
  },
  body: {
    mousedown: function(e) {
      const $ = this;
      const $selector = body.qs('body > .body_selector');

      $selector.qsa('.content > .body.selected').forEach($ => $.rmvClass('selected'));
      $.addClass('selected');
      (function(v) {
        page.settings.l.b = v;

        (function($code) {
          $code.qs('.name').innerText = global.lineStylesDisplayKey.bodies[v];
          $code.qs('.x').innerText = $.getAttr('x');
          $code.qs('.y').innerText = $.getAttr('y');
        })($selector.qs('p.selected > code.text'));
      })($.getAttr('body'));

      Update();
    },
  },
  brightness_slider: {
    mousedown: function(e) {
      body.qs('body > .brightness > .slider').setAttr('mousedown', true);
      events.get.brightness_slider.mousemove.call(this, e);
    },
    mousemove: function(e) {
      const $ = body.qs('body > .brightness > .slider');
      if ($.getAttr('mousedown') === 'true') {
        const dy = (100 - (e.clientY - $.rect().y) / $.rect().h * 100).clamp(0, 100);
        page.settings.c[3] = 255 * (dy / 100);

        Update();
      }
    },
    mouseleave: 'this.mousemove',
    wheel: function(e) {
      page.settings.c[3] = (page.settings.c[3] - e.deltaY.sgn(2.55)).clamp(0, 255);
      Update();
    },
  },
  brightness_input: {
    input: function(e) {
      const v = e.target.innerText.replace(/[^0-9]/g, '');
      if (v != e.target.innerText)
        return e.target.innerText = v;

      const dy = (+v).clamp(0, 100);
      page.settings.c[3] = 255 * (dy / 100);

      Update();
    },
  },
  color_spectrum_picker: {
    mousedown: function(e) {
      this.setAttr('mousedown', true);
      events.get.color_spectrum_picker.mousemove.call(this, e);
    },
    mousemove: function(e) {
      if (this.getAttr('mousedown') === 'true') {
        const $paper = body.qs('body > .color_spectrum > canvas.picker');

        const dx = (e.offsetX / $paper.rect().w).clamp(0, 1) * ($paper.width - 1);
        const dy = (e.offsetY / $paper.rect().h).clamp(0, 1) * ($paper.height - 1);

        const data = page.spectrum_pen.getImageData(dx, dy, 1, 1).data;
        page.settings.c = [ data[0], data[1], data[2], page.settings.c[3] ];

        Update();
      }
    },
    mouseleave: 'this.mousemove',
  },
  color_spectrum_input: {
    input: function(e) {
      const v = e.target.innerText.replace(/[^0-9]/g, '');
      if (v != e.target.innerText)
        return e.target.innerText = v;

      page.settings.c[3] |= 0;
      const colors = body.qsa('body > .color_spectrum > .rgb > .number > .input').map($ => +$.innerText);
      while (!colors.map(v => v / (page.settings.c[3] / 255)).every(v => v <= 255 && v >= 0) && page.settings.c[3] < 255)
        page.settings.c[3] = page.settings.c[3] + 1 | 0;

      page.settings.c = [ ...colors.map(v => v / (page.settings.c[3] / 255)), page.settings.c[3] ];

      Update();
    },
  },
  recent_color: {
    click: function(e) {
      page.settings.c = (this.getAttr('color') || '0,0,0').split(',').map(v => +v).toLength(4, 255, false);

      Update();
    },
  },
  cancel: {
    click: function(e) {
      parent.postMessage({ from: 'line_settings', event: 'cancel' }, '*');
    },
  },
  save: {
    click: function(e) {
      const targetLength = 32 - body.qsa('body > .color_spectrum > .recent > .color.preset').length;

      page.recentColors = [ page.settings.c, ...page.recentColors ].map(
        v => JSON.stringify(v)
      ).unique().map(
        v => JSON.parse(v)
      ).slice(0, targetLength).toLength(targetLength, [ 0, 0, 0, 255 ], false);

      localStorage.setItem('recentColors', JSON.stringify(page.recentColors));
      parent.postMessage({ from: 'line_settings', event: 'save', settings: page.settings }, '*');
    },
  },
});
var events = page.events;

page.loaded.events = true;