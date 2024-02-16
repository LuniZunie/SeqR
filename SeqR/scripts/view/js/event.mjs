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

import * as fileReaderExports from './file_reader.mjs';
Object.entries(fileReaderExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

import * as mainExports from './main.mjs';
Object.entries(mainExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

page.events = new Events({
  window: {
    message: function(e) {
      const $lineSettings = body.qs('body > iframe.line_settings');
      if (e.data?.from != 'line_settings')
        return;
      else if (e.data.event == 'save' && e.data.settings) {
        const i_group = $lineSettings.getAttr('group-index');
        const i_data = $lineSettings.getAttr('datum-index');
        if (i_data === null)
          global.groups[i_group].o = repeat(structuredClone(e.data.settings), global.groups[i_group].o.length);
        else
          global.groups[i_group].o[i_data] = structuredClone(e.data.settings);
      }

      (function($) {
        $.addClass('hide');

        $.removeEventListener('load', events.get.line_settings.load[0]);
        $.removeEventListener('load', events.get.line_settings.load[1]);

        setTimeout(() => $.src = 'about:blank', parseTransition($).max());
      })(body.qs('body > iframe.line_settings'));

      body.qs('body > .cover').addClass('hide');

      this.removeEventListener('message', events.get.window.message);
    },
    mousedown: function(e) {
      page.mouseDownOver = e.target;
      if (e.target) {
        const cs = getComputedStyle(e.target);
        if (cs.webkitUserSelect != 'none' || cs.userSelect != 'none')
          return;
      }

      body.cursorPosition(0);
    },
    resize: function(e) {
      const id = FixedUpdate(() => body.qsa('body > .previews > svg.preview:not(.template)').forEach(
        $ => LinePreview(body.qs(`#${$.getAttr('target')} > .content`), true)
      ));

      setTimeout(
        () => requestAnimationFrame( // function
          () => DeleteFixedUpdate(id)
        ),
        body.qs( // time
          'body > .side > .content > .groups > .group:not(.template) > .content > .data:not(.template) > .content'
        )?.gen(-Infinity, 0).flat(Infinity).map(
          $ => $ instanceof Element ? parseTransition($).max() : 0
        ).max() ?? 0
      );
    },
    mouseup: [
      [
        function(e) {
          [
            { selector: 'body > .top > .delete_data.button > .confirm', hideOnClick: true },
            { selector: 'body > .top > .export.extensions' },
            { selector: 'body > .top > .export.name' },
            { selector: 'body > .data_select', includeSelf: true },
            { selector: 'body > .line_settings:not(.hide)', extra: 'line_setttings' },
            { selector: 'body > .cover', checks: [ 'body > .data_select', 'body > .line_settings:not(.hide)', { selector: 'body > .settings', hide: true } ], hideOnClick: true, capture: true },
          ].forEach(
            ({ selector, $class, checks, hideOnClick, includeSelf, capture, extra }) => (function($) {
              $class ??= 'hide';
              checks ??= [];
              if (!$ || $.hasClass($class))
                return;

              const $e = e.target || e.srcElement || $;
              if (!page.mouseDownOver.childOf($e, true) && !$e.childOf(page.mouseDownOver, true))
                return;

              if ((hideOnClick || !$e.childOf($, includeSelf)) && checks.every(selector => !$e.childOf(body.qs(selector.selector ?? selector), true))) {
                if (capture)
                  e?.stopPropagation();

                if (!$.hasClass($class))
                  requestAnimationFrame(() => $.addClass($class));

                $.addClass($class);
                checks.forEach(check => {
                  if (check instanceof Object) {
                    if (check.hide)
                      body.qs(check.selector).addClass('hide');
                  }
                });

                switch (extra) {
                  case 'line_setttings': {
                    $.removeEventListener('load', events.get.line_settings.load[0]);
                    $.removeEventListener('load', events.get.line_settings.load[1]);

                    setTimeout(() => $.src = 'about:blank', parseTransition($).max());

                    break;
                  };
                }
              }
            })(body.qs(selector))
          );
        },
        { capture: true },
      ],
    ],
    drop: function(e) {
      e.preventDefault();
      body.qs('body > icon[type=upload]:not(.template)')?.memRmv();
      page.events.get.file_picker.change.call(body.qs('body > .top > .file_picker'), { files: e.dataTransfer.files });
    },
    dragover: function(e) {
      e.preventDefault();
      body.qs('body > icon[type=upload]')?.memRmv();
      body.icon('upload');
    },
    dragleave: function(e) {
      body.qs('body > icon[type=upload]')?.memRmv();
    },
    copy: function(e) {
      global.clipboard = {};
    },
  },
  radio: {
    click:
    function(e) {
      this.gen(-1).qsa(`.selected[radio-group='${this.getAttr('radio-group')}']`).forEach(
        $ => $.rmvClass('selected')
      );

      this.addClass('selected');
    },
  },
  notification: {
    animationend: function(e) {
      this.memRmv();
    },
  },
  announcement_close: {
    click: function(e) {
      const version = this.getAttr('version');

      sessionStorage.announcmentShown = version;
      localStorage.announcmentShown = version;

      body.qs('announcment').addClass('hidden'); // rewrite this
    },
  },
  file_picker: {
    click: function(e) {
      this.value = '';
    },
    change: function(e) {
      FileReader.call(this, e);
    },
  },
  file: {
    click: function(e) {
      const $ = this;
      (function($fileData) {
        $fileData.qs('.raw.name').innerText = $.getAttr('raw-name');
        $fileData.qs('.raw.extension').innerText = $.getAttr('raw-extension');

        $fileData.qs('.process.name').innerText = $.getAttr('process-name');
        $fileData.qs('.process.extension').innerText = $.getAttr('process-extension');

        let maxMetadataWidth = -Infinity;
        JSON.parse($.getAttr('metadata')).forEach(
          datum => (function ($datum) {
            datum.forEach((v, i) => {
              if (v instanceof Object)
                switch (v.type) {
                  case 'link': {
                    (function($a) {
                      $a.innerText = v.text ?? v.link;
                      $a.href = v.link;
                      $a.target = '_blank';
                    })($datum.appendChild('a'));
                    break;
                  } default:
                    break;
                }
              else
                $datum.appendChild('span').innerText = v;

              if (i < datum.length - 1)
                $datum.appendChild('span').innerText = ' ';
            });

            maxMetadataWidth = max(maxMetadataWidth, $datum.scrollWidth);
          })($fileData.qs('.metadata').template('.datum', 'append'))
        );

        $fileData.qs('.metadata').style.setProperty('--text-width', `${max(
          $fileData.qs('.raw.name').scrollWidth + $fileData.qs('.raw.extension').scrollWidth + vmin(0.5),
          $fileData.qs('.process.name').scrollWidth + $fileData.qs('.process.extension').scrollWidth + vmin(0.5),
          maxMetadataWidth + vmin(2)
        )}px`);
      })(body.qs('body > .file_data_list').template('.file_data', 'append'));
    },
  },
  delete_data: {
    click: function(e) {
      body.qs('body > .top > .delete_data.button > .confirm').rmvClass('hide');
    },
  },
  delete_data_confirm: {
    click: function(e) {
      if (global.drawReject)
        global.drawReject('cancel');

      global.dataRange = [ Infinity, -Infinity ];

      global.data = {};

      global.groups.forEach(
        ({ $ }) => $.memRmv()
      );
      global.groups = [];

      global.colors = {
        strands: {},
        taken: [
          [ 255, 0, 0, 255 ],
          [ 0, 255, 0, 255 ],
          [ 0, 0, 255, 255 ],
        ],
      };

      body.qsa('body > .top > .files > .file:not(.template)')?.memRmv();

      body.qsa('body > .side > .groups > .group:not(.template)')?.memRmv();

      body.qs('body > .content > .easel > svg.paper:not(.template)')?.memRmv();
    },
  },
  groups: {
    wheel: function(e) {
      if (this.qsa('.group:not(.template) > .content > .data:not(.template) > .content[over="true"]').some($ => $.clientWidth < $.scrollWidth))
        e.preventDefault();
    }
  },
  add_group: {
    click: function(e) {
      CreateGroup();
    },
  },
  auto_group: {
    mouseenter: function(e) {
      const { x, b, w } = this.rect();
      new Tooltip('help', global.settings.tips.help.autoGroup, x + w / 2, b + 5, 'center', 'top', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e, bypass) {
      if ((!global.data?._len() || page.currentAutoGroup == GetAutoGroup()) && !bypass)
        this.addClass('disabled');

      events.get.remove_all_groups.click.call(body.qs('body > .top > .remove_all_groups'), e, true);

      const $groups = {};
      global.data._forEach(
        ([ file, types ]) => (types ?? {})._forEach(([ type, strands ]) => {
          $groups[type] ??= CreateGroup(type);
          const i_group = $groups[type].$.getAttr('group-index');
          (strands ?? {})._$sort().k_forEach(
            strand => AddDataToGroup(i_group, file, type, strand)
          );
        })
      );

      page.currentAutoGroup = GetAutoGroup();
    },
  },
  clean_groups: {
    mouseenter: function(e) {
      const { x, b, w } = this.rect();
      new Tooltip('help', global.settings.tips.help.cleanGroups, x + w / 2, b + 5, 'center', 'top', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e, bypass) {
      if (!global.groups && !bypass)
        return this.addClass('disabled');

      AreGroupsClean().forEach(i_group => {
        const { $ } = global.groups.splice(i_group, 1)[0];
        $.memRmv();
        global.groups.forEach(
          ({ $ }, i) => $.setAttr('group-index', i)
        );
      });
    }
  },
  remove_all_groups: {
    click: function(e, bypass) {
      if (!global.groups && !bypass)
        return this.addClass('disabled');

      global.groups.forEach(
        ({ $ }) => $.memRmv()
      );

      global.groups = [];
    },
  },
  group_name: {
    mouseenter: function(e) {
      const { x, y, h } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupTitle, x - 5, y + h / 2, 'right', 'center', 0, { leave: this, time: { min: 100 } }).create();
    },
    input: function(e) {
      global.groups[this.gen(-2).getAttr('group-index')].n = this.innerHTML;
    },
  },
  group_edit: {
    mouseenter: function(e) {
      const { x, y, h } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupAddData, x - 5, y + h / 2, 'right', 'center', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e) { // holy shit bro this code is cool as fuck - lowkey a lot of fun writing it!
      if (!global.data._len()) {
        this.addClass('disabled');

        const { x, b, w } = this.rect();
        return new Tooltip('error', global.settings.tips.error.groupAddData, x + w / 2, b + 5, 'center', 'top', 0, { time: { min: 2500 } }).create();
      }

      const sortByHeight = function($s, $parent, secondaryCompare) {
        const sort = (a, b) => b.rect().h - a.rect().h ||
          new Function('a', 'b', `return ${secondaryCompare}`)(a, b);

        return $s.sort(sort).reduce(
          ([ f, e ], $) => f.h <= e.h ?
            [ { $s: f.$s.concat($), h: f.h + $.rect().h }, e ] :
            [ f, { $s: e.$s.concat($), h: e.h + $.rect().h } ], [
              { $s: [], h: 0 },
              { $s: [], h: 0 },
            ]
        ).reduce(
          (arr, v) => arr.concat(v.$s.sort(sort)), []
        ).map(
          ($, i) => $parent.appendChild($).setAttr('i', i)
        );
      }

      const i_group = this.gen(-2).getAttr('group-index');
      const group = global.groups[i_group];

      const $dataSelect = body.qs('body > .data_select > .content');
      $dataSelect.qsa('.file.section:not(.template)')?.memRmv();
      $dataSelect.setAttr('group-index', i_group);

      sortByHeight((global.data ?? {})._map(([ file, types ]) => {
        const $file = $dataSelect.template('.file.section', 'append');
        $file.qs('p.label').innerHTML = file;
        $file.setAttr('file', file);

        sortByHeight((types ?? {})._map(([ type, strands ]) => {
          const $type = $file.template('.type.section', 'append');
          $type.qs('p.label > span.text').innerHTML = type;
          $type.setAttr('type', type);

          (strands ?? {})._$sort().k_forEach(strand => {
            const $strand = events.add($type.template('.strand.button', 'append'), 'data_select_strand');
            $strand.innerHTML = strand;

            $strand.setClass('selected', group.d.some(datum => datum.f == file && datum.t == type && datum.s == strand));
            $strand.setAttr('strand', strand);
          });

          return $type;
        }), $file,
          'b.qsa(".strand.button:not(.template)").length - a.qsa(".strand.button:not(.template)").length || a.getAttr("type").localeCompare(b.getAttr("type"))'
        );

        return $file;
      }), $dataSelect,
        'a.getAttr("file").localeCompare(b.getAttr("file"))'
      );

      body.qs('body > .cover').rmvClass('hide');
      body.qs('body > .data_select').rmvClass('hide');

      LoadEvents(body.qs('body > .data_select > .content'), false);
    },
    disabledClick: function(e) {
      const { x, b, w } = this.rect();
      new Tooltip('error', global.settings.tips.error.groupAddData, x + w / 2, b + 5, 'center', 'top', 0, { time: { min: 2500 } }).create();
    },
  },
  data_select: {
    wheel: function(e) {
      if (this.qsa('.file.section > .type.section > p.label > span.text[over="true"]').some($ => $.clientWidth < $.scrollWidth))
        e.preventDefault();
    }
  },
  data_select_type_label: {
    mouseenter: function(e) {
      this.setAttr('over', true);
    },
    wheel: function(e) {
      this.scrollBy(e.deltaY.sgn(20), 0);
    },
    mouseleave: function(e) {
      this.setAttr('over', false);
    },
  },
  data_select_strand: {
    click: function(e) {
      this.tglClass('selected');

      const [ strand, type, file, i_group ] = [ 'strand', 'type', 'file', 'group-index' ].map((k, i) => this.gen(-i).getAttr(k));

      if (this.hasClass('selected'))
        AddDataToGroup(i_group, file, type, strand);
      else {
        const i_data = global.groups[i_group].d.findIndex(datum => datum.f == file && datum.t == type && datum.s == strand);
        global.groups[i_group].d.splice(i_data, 1)[0].$.memRmv();
        global.groups[i_group].o.splice(i_data, 1);
      }
    }
  },
  group_data: {
    mouseenter: function(e) {
      this.setAttr('over', true);

      const i = (+this.getAttr('over-index') + 1) % 100 || 0;
      this.setAttr('over-index', i);

      setTimeout(() => {
        if (this.getAttr('over') === 'true' && this.getAttr('over-index') == i)
          LinePreview(this);
      }, 250);

      const { x, y, h } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupData, x - 5, y + h / 2, 'right', 'center', 0, { leave: this, time: { min: 100 } }).create();
    },
    mouseleave: function(e) {
      this.setAttr('over', false);
    },
    click: function(e) {
      const $lineSettings = body.qs('body > iframe.line_settings');
      events.add(body.qs('body > iframe.line_settings'), 'line_settings.load[1]');
      $lineSettings.rmvClass('hide');

      $lineSettings.setAttr('group-index', this.gen(-3).getAttr('group-index'));
      $lineSettings.setAttr('datum-index', this.gen(-1).getAttr('datum-index'));

      $lineSettings.src = '../../line_settings/html';

      body.qs('body > .cover').rmvClass('hide');
    },
    wheel: function(e) {
      this.scrollBy(e.deltaY.sgn(20), 0);
    },
  },
  group_data_file: {
    mouseenter: function(e, animate = true) {
      this.setAttr('over', true);

      const { x, b, w } = this.rect();
      const x_mx = this.gen(-1).rect().right;
      if (x + +this.getCS('padding-left').replace(/[^0-9\.e\+-]/g, '') > x_mx)
        return this.setAttr('animate', true);
      else
        this.setAttr('animate', false);

      const text = this.getAttr('file');
      const center = (x + w / 2 + text.width(this.getCS('font')) / 2 + vmin()) < x_mx;

      const tooltip = new Tooltip('tip',
        text,
        center ? x + w / 2 : x_mx,
        b + 5,
        center ? 'center' : 'right',
        'top',
        100,
        { leave: this, time: { min: 100 } },
        undefined,
        'file_name',
        undefined,
        animate
      );

      page.tooltips.fileNames.push(tooltip);
      tooltip.create().style.zIndex = 3;
    },
    mouseout: function(e) {
      this.setAttr('over', false);
    },
    wheel: function(e) {
      requestAnimationFrame(() => {
        const over = this.getAttr('over') === 'true';
        page.tooltips.fileNames = page.tooltips.fileNames.filter(tooltip => tooltip.destroy(!over));
        if (over)
          events.get.group_data_file.mouseenter.call(this, e, this.getAttr('animate') === 'true');
      });
    },
  },
  line_settings: {
    load: [
      function(e) {
        this.contentWindow.postMessage({
          from: 'view',
          ...global.groups[this.getAttr('group-index')].o.reduce((majority, draw) => {
            return (
              count => count > majority.count ? { count, o: draw, counts: majority.counts } : majority
            )((
              id => majority.counts[id] = ++majority.counts[id] || 1
            )(JSON.stringify(draw)));
          }, { count: -Infinity, o: { c: PrandomColorArray(), l: { h: 1, b: 0, l: 0, r: 0 } }, counts: {} }).o,
          bg: global.draw.bg,
        }, '*');

        events.add(window, 'window.message');
      },
      function(e) {
        const i_group = this.getAttr('group-index');
        const i_data = this.getAttr('datum-index');
        this.contentWindow.postMessage({
          from: 'view',
          ...global.groups[i_group].o[i_data],
          bg: global.draw.bg,
        }, '*');

        events.add(window, 'window.message');
      }
    ],
    animationend: function(e) {
      this.memRmv();
    },
  },
  group_data_copy: {
    mouseenter: function(e) {
      const { x, y, w } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupDataCopy, x + w / 2, y - 5, 'center', 'bottom', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e) {
      const i_group = +this.gen(-3).getAttr('group-index');
      const i_data = +this.gen(-1).getAttr('datum-index');

      global.clipboard = { type: 'line_style', data: structuredClone(global.groups[i_group].o[i_data]) };

      body.qsa('body > :is(.clipboard_copy, .clipboard_paste)')?.memRmv();

      const $notif = body.appendChild('notification');
      $notif.addClass('clipboard_copy');
      $notif.innerHTML = 'Line style copied to clipboard!';
      setTimeout(() => {
        $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
        events.add($notif, 'notification');
      }, 5000);
    },
  },
  group_data_paste: {
    mouseenter: function(e) {
      const { x, y, w } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupDataPaste, x + w / 2, y - 5, 'center', 'bottom', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e) {
      const i_group = +this.gen(-3).getAttr('group-index');
      const i_data = +this.gen(-1).getAttr('datum-index');

      global.groups[i_group].o[i_data] = structuredClone(global.clipboard.data);

      body.qsa('body > :is(.clipboard_copy, .clipboard_paste)')?.memRmv();

      const $notif = body.appendChild('notification');
      $notif.addClass('clipboard_paste');
      $notif.innerHTML = 'Line style pasted!';
      setTimeout(() => {
        $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
        events.add($notif, 'notification');
      }, 5000);
    },
  },
  group_format: {
    mouseenter: function(e) {
      const { x, y, w } = this.rect();
      new Tooltip('tip', global.settings.tips.help.groupFormat, x + w / 2, y - 5, 'center', 'bottom', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e) {
      const $lineSettings = body.qs('body > iframe.line_settings');
      events.add(body.qs('body > iframe.line_settings'), 'line_settings.load[0]');
      $lineSettings.rmvClass('hide');

      $lineSettings.setAttr('group-index', this.gen(-2).getAttr('group-index'));

      $lineSettings.src = '../../line_settings/html';

      body.qs('body > .cover').rmvClass('hide');
    },
  },
  group_remove: {
    mouseenter: function(e) {
      const { x, y, w } = this.rect();
      new Tooltip('help', global.settings.tips.help.groupRemove, x + w / 2, y - 5, 'center', 'bottom', 0, { leave: this, time: { min: 100 } }).create();
    },
    click: function(e) {
      const { $ } = global.groups.splice(this.gen(-2).getAttr('group-index'), 1)[0];
      $.memRmv();
      global.groups.forEach(
        ({ $ }, i) => $.setAttr('group-index', i)
      );
    },
  },
  draw: {
    click: function(e) {
      if (this.hasClass('cancel')) {
        if (global.drawReject)
          global.drawReject('cancel');
        else
          this.rmvClass('cancel');
      } else {
        (function($settings) {
          (function($selection) {
            $selection.qs('.range > .min').innerText = global.dataRange[0];
            $selection.qs('.range > .max').innerText = global.dataRange[1];

            (function([ $min, $max ]) {
              $min.value = global.draw.range.min ?? global.dataRange[0];
              $max.value = global.draw.range.max ?? global.dataRange[1];

              const div = v => ((v - global.dataRange[0]) / (global.dataRange[1] - global.dataRange[0]));
              const min = div((+$min.value).clamp(...global.dataRange));
              const max = div((+$max.value).clamp(...global.dataRange));

              $selection.qs('.range > .shading').style.left = `${(min * 100)}%`;
              $selection.qs('.range > .shading').style.width = `${((max - min) * 100)}%`;
            })($selection.qsa('.inputs > input:is(.min, .max)').array());
          })($settings.qs('.selection'));

          (function($textStyle) {
            events.get.radio.click.call($textStyle.qs(`.style.align > .content > .button.${global.draw.text.align ?? 'center'}`));

            (function($character) {
              $character.qs('.button.bold').setClass('selected', global.draw.text.character.bold);
              $character.qs('.button.italic').setClass('selected', global.draw.text.character.italic);
              $character.qs('.button.outline').setClass('selected', global.draw.text.character.outline);

              $character.qs('.button.underline').setClass('selected', global.draw.text.character.decoration?.includes('underline'));
              $character.qs('.button.overline').setClass('selected', global.draw.text.character.decoration?.includes('overline'));
              $character.qs('.button.strike').setClass('selected', global.draw.text.character.decoration?.includes('strike'));
            })($textStyle.qs('.style.character > .content'));

            (function($font) {
              $font.qs('.option.size > input').value = global.draw.text.font.size ?? '';
              $font.qs('.option.color > input').value = global.draw.text.color ?? '#ffffff';
              $font.qs('.option.family > input').value = global.draw.text.font.family ?? '';
            })($textStyle.qs('.style.font > .content'));
          })($settings.qs('.text_style > .content'));

          (function($padding) {
            global.draw.padding.page._forEach(([ k, v ]) =>
              $padding.qs(`.page > .content > .option.${k} > input`).value = v ?? ''
            );
            global.draw.padding.group._forEach(([ k, v ]) =>
              $padding.qs(`.group > .content > .option.${k} > input`).value = v ?? ''
            );
          })($settings.qs('.padding'));

          $settings.qs('.background > .preview').style.background = global.draw.background ?? '';

          $settings.rmvClass('hide');
          $settings.scrollTo(0, 0);
        })(body.qs('body > .settings'));

        body.qs('body > .cover').rmvClass('hide');
      }
    },
  },
  settings_select_range: {
    mousedown: function(e) {
      const $shading = this.qs('.shading');

      const x = (e.clientX - this.rect().x) / this.clientWidth;
      const selectX_1 = ($shading.rect().x - this.rect().x) / this.clientWidth;
      const selectX_2 = selectX_1 + $shading.clientWidth / this.clientWidth;

      let d_1 = (x - selectX_1).abs();
      let d_2 = (x - selectX_2).abs();

      if (selectX_1 == selectX_2) {
        if (x < selectX_1)
          d_1 = -1;
        else
          d_2 = -1;
      }

      if (d_1 < d_2) {
        this.setAttr('closest', 'min');
        this.gen(-1).setAttr('lastChange', 'min');
      } else {
        this.setAttr('closest', 'max');
        this.gen(-1).setAttr('lastChange', 'max');
      }
    },
    mousemove: function(e) {
      if (e?.buttons)
        events.get.settings_select_range.mouseup.call(this, e);
    },
    mouseout: 'this.mousemove',
    mouseup: function(e) {
      const $shading = this.qs('.shading');

      const { x: this_x, w: this_w } = this.rect();
      const { x: shading_x } = $shading.rect();

      const x = ((e.clientX - this_x) / this_w).clamp(0, 1);
      let min = ((shading_x - this_x) / this_w).clamp(0, 1);
      let max = (min + $shading.clientWidth / this.clientWidth).clamp(0, 1);

      if (this.getAttr('closest') == 'min')
        min = x;
      else
        max = x;

      if (min > max) {
        const oppopsite = this.getAttr('closest') == 'min' ? 'max' : 'min';
        this.setAttr('closest', oppopsite);
        this.gen(-1).setAttr('lastChange', oppopsite);
      }

      (function($inputs) {
        const mult = v => (v * (global.dataRange[1] - global.dataRange[0]) + global.dataRange[0]).rnd();
        $inputs.qs('input[type=number].min').value = mult(min);
        $inputs.qs('input[type=number].max').value = mult(max);
      })(body.qs('body > .settings.prompt > .selection > .inputs'));

      $shading.style.left = `${(min * 100)}%`;
      $shading.style.width = `${((max - min) * 100)}%`;
    },
  },
  settings_select_min: {
    focus: function(e) {
      this.gen(-2).setAttr('focus', true);
    },
    input: function(e) {
      this.gen(-2).setAttr('lastChange', 'min');

      const $selection = this.gen(-3);
      (function([ $min, $max ]) {
        const div = v => ((v - global.dataRange[0]) / (global.dataRange[1] - global.dataRange[0]));
        const min = div((+$min.value).clamp(...global.dataRange));
        const max = div((+$max.value).clamp(...global.dataRange));

        $selection.qs('.range > .shading').style.left = `${(min * 100)}%`;
        $selection.qs('.range > .shading').style.width = `${((max - min) * 100)}%`;
      })($selection.qsa('.inputs > input:is(.min, .max)').array());
    },
    blur: function(e) {
      this.gen(-2).setAttr('focus', false);
    },
  },
  settings_select_max: {
    focus: '_this.settings_select_min.focus',
    input: function(e) {
      this.gen(-2).setAttr('lastChange', 'max');

      const $selection = this.gen(-3);
      (function([ $min, $max ]) {
        const div = v => ((v - global.dataRange[0]) / (global.dataRange[1] - global.dataRange[0]));
        const min = div((+$min.value).clamp(...global.dataRange));
        const max = div((+$max.value).clamp(...global.dataRange));

        $selection.qs('.range > .shading').style.left = `${(min * 100)}%`;
        $selection.qs('.range > .shading').style.width = `${((max - min) * 100)}%`;
      })($selection.qsa('.inputs > input:is(.min, .max)').array());
    },
    blur: '_this.settings_select_min.blur',
  },
  settings_character_style: {
    click: function(e) {
      this.tglClass('selected');
      UpdateSettingsTextPreview();
    },
  },
  settings_text_align: {
    click: UpdateSettingsTextPreview,
  },
  settings_text_family: {
    input: UpdateSettingsTextPreview,
  },
  settings_background: {
    input: function(e) {
      const color = (color =>
        color.toLowerCase().replace(/\s/g, '') == 'currentcolor' ?
          body.qs('body > .settings > .text_style > .content > .style.font > .content > .option.color > input[type="color"]').value :
          color
      )(this.value || this.placeholder || 'none');

      body.qs('body > .settings > .background > .preview').style.background = CSS.supports('background', color) ?
        color :
        (color =>
          CSS.supports('background', color) ? color : ''
        )(color.replace(/\s/g, ''));
    },
  },
  settings_save: {
    click: function(e) {
      (function($settings) {
        const settingify = setting => setting === '' || (typeof setting == 'number' && Number.isNaN(setting)) ? undefined : setting;

        global.draw = {
          range: {
            min: settingify((+$settings.qs('.selection > .inputs > input.min').value).clamp(...global.dataRange)),
            max: settingify((+$settings.qs('.selection > .inputs > input.max').value).clamp(...global.dataRange)),
          },
          text: { // add position modifier
            align: settingify($settings.qs('.text_style > .content > .style.align > .content > .button.selected').classList.filter(v =>
              v != 'selected' && v != 'button'
            )[0]),
            character: {
              bold: $settings.qs('.text_style > .content > .style.character > .content > .button.bold').hasClass('selected'),
              italic: $settings.qs('.text_style > .content > .style.character > .content > .button.italic').hasClass('selected'),
              outline: $settings.qs('.text_style > .content > .style.character > .content > .button.outline').hasClass('selected'),
              decoration: $settings.qsa('.text_style > .content > .style.character > .content > .button:is(.underline, .overline, .strike).selected').map($ =>
                $.classList.filter(v => v != 'selected' && v != 'button')[0]
              ).join(' '),
            },
            font: {
              size: settingify($settings.qs('.text_style > .content > .style.font > .content > .option.size > input').value),
              family: settingify($settings.qs('.text_style > .content > .style.font > .content > .option.family > input').value),
            },
            color: settingify($settings.qs('.text_style > .content > .style.font > .content > .option.color > input').value),
          },
          padding: {
            page: Object.assign(
              { top: 0, right: 0, bottom: 0, left: 0 },
              Object.fromEntries($settings.qsa('.padding > .page > .content > .option > input').map($ =>
                [ $.id.replace('settings_padding_page_', ''), settingify((+$.value).clamp(0)) ]
              ))
            ),
            group: Object.assign(
              { top: 0, right: 0, bottom: 0, left: 0 },
              Object.fromEntries($settings.qsa('.padding > .group > .content > .option > input').map($ =>
                [ $.id.replace('settings_padding_group_', ''), settingify((+$.value).clamp(0)) ]
              ))
            ),
          },
          background: settingify($settings.qs('.background > .preview').style.background),
        };

        $settings.addClass('hide');
      })(body.qs('body > .settings'));

      body.qs('body > .cover').addClass('hide');

      Paint();
    },
  },
  settings_cancel: {
    click: function(e) {
      body.qs('body > .settings').addClass('hide');
      body.qs('body > .cover').addClass('hide');
    },
  },
  export: {
    click: function(e) {
      /* if (!body.qs('body > .content > .easel > svg.paper:not(.template)'))
        return this.addClass('disabled'); */

      body.qs('body > .top > .export.extensions').rmvClass('hide');
    },
  },
  export_extensions: {
    click: function(e) {
      if (e.target?.hasClass('extension')) {
        (function($, name) {
          $.value = '';
          $.placeholder = name;
        })(body.qs('body > .top > .export.name > input[type="text"][name="export_file_name"]'), CreateFileName());

        body.qs('body > .top > .export.extensions').addClass('hide');
        body.qs('body > .top > .export.name').rmvClass('hide');
      }
    },
  },
  export_name: {
    keyup: async function(e) {
      if (e.key == 'Enter') {
        body.qs('body > .top > .export.name').addClass('hide');
        if (body.qs('body > .content > .easel > svg.paper:not(.disabled, .template) > image:not(.template)') instanceof SVGImageElement) {
          const $icon = body.icon('loading', true);

          await new Promise(r_wait => requestAnimationFrame(r_wait));

          Download(
            ...(function(extension) { // parameter 1
              switch (extension) {
                case 'image/svg+xml':
                  return [ URL.newObjectURL(new Blob([ body.qs('body > .content > .easel > svg.paper:not(.disabled, .template)').outerHTML ])), null ];
                default:
                  return [ body.qs('body > .content > .easel > svg.paper:not(.disabled, .template) > image:not(.template)').href.baseVal, extension ];
              };
            })(body.qs('body > .top > .export.extensions > .extension.selected').getAttr('extension')),
            (function($) { // parameter 2
              return $.value || $.placeholder || CreateFileName();
            })(body.qs('body > .top > .export.name > input[type="text"][name="export_file_name"]')),
            () => $icon.memRmv() // parameter 3
          );
        } else {
          const $notif = body.appendChild('notification');
          $notif.addClass('error');
          $notif.innerHTML = 'No Image to Export';

          setTimeout(() => {
            $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
            events.add($notif, 'notification');
          }, 3000);
        }
      }
    },
  },
  export_name_sub_text: {
    mouseenter: function(e) {
      const { x, b, w } = this.rect();
      const $tooltip = new Tooltip('tooltip', this.innerHTML, x + w / 2, b + 5, 'center', 'top', 300, { leave: this, time: { min: 100 } }).create();

      $tooltip.style.color = '#ccd';
      $tooltip.style.fontSize = '1.25em';

      $tooltip.style.background = getComputedStyle(this.gen(-Infinity, 0, true).flat(Infinity).reverse().find(
        $ => $ instanceof Element && getComputedStyle($).backgroundColor != 'rgba(0, 0, 0, 0)'
      )).backgroundColor;
    },
  },
});
var events = page.events;

page.loaded.events = true;