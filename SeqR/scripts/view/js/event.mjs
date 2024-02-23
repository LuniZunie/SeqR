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
 * @typedef { Tooltip } Tooltip
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

import { default as tips } from '../../global/js/tips.mjs';

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
          'body > .side > .content > .groups > .group:not(.template) > .data:not(.template) > .content'
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
            { selector: 'body > .file_data_list > .delete.button > .confirm', hideOnClick: true },
            { selector: 'body > .data_select', includeSelf: true },
            { selector: 'body > .line_settings:not(.hide)', extra: 'line_setttings' },
            { selector: 'body > .cover', checks: [
              'body > .data_select', 'body > .line_settings:not(.hide)',
              { selector: 'body > .settings', hide: true },
            ], hideOnClick: true, capture: true },
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
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.top.import)
        .setOrigin('center', 'top')
        .requestAnchor('center', 'bottom', body.qs('body > .top > .import.button'))
        .requestOffset(0, 5)
        .newOffset(null, null, this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      this.value = '';
    },
    change: function(e) {
      FileReader.call(this, e);
    },
  },
  file: {
    click: function(e) {
      body.qsa('body > .file_data_list > .file_data:not(.template)')?.memRmv();

      const $ = this;
      (function($fileData) {
        $fileData.qs('.raw.name').innerText = $.getAttr('raw-name');
        $fileData.qs('.raw.extension').innerText = $.getAttr('raw-extension');

        $fileData.qs('.process.name').innerText = $.getAttr('process-name');
        $fileData.qs('.process.extension').innerText = $.getAttr('process-extension');

        (function($metadata) {
          const gridColums = +$metadata.getCS('--columns');
          JSON.parse($.getAttr('metadata')).map(
            datum => (function ($datum) {
              (function($label) {
                $label.innerText = datum.label;
              })($datum.qs('.label'));

              (function($value) {
                datum.segments.forEach((v, i) => {
                  if (v instanceof Object)
                    switch (v.type) {
                      case 'link': {
                        (function($a) {
                          $a.innerText = v.text ?? v.link;
                          $a.href = v.link;
                          $a.target = '_blank';
                        })($value.appendChild('a.select'));
                        break;
                      } default:
                        break;
                    }
                  else
                    $value.appendChild('span.select').innerText = v;
                });
              })($datum.qs('.value'));

              const span = ($datum.scrollWidth * gridColums / ($metadata.clientWidth - vmin(2)) + 1).ceil(2).clamp(1, gridColums); // 2vmin padding (1vmin on each side)
              $datum.style.gridColumn = `auto / span ${span}`;

              return span;
            })($metadata.template('.datum', 'append'))
          ).reduce((rows, span) => {
            const lastRow = rows.last();
            if (lastRow.sum() + span > gridColums)
              rows.push([ span ]);
            else
              lastRow.push(span);

            return rows;
          }, [[]]).reduce((i, row) => {
            const emptySpan = (gridColums - row.sum()) / 2; // / row.length;
            if (emptySpan == 0)
              return i + row.length;

            /* row.forEach(span =>
              $metadata.qs(`.datum:nth-of-type(${i++ + 1})`).style.gridColumn = `auto / span ${Math.round(span + emptySpan)}`
            ); */

            $metadata.prependChild('div.centerer', $metadata.qs(`.datum:nth-of-type(${i + 1})`)).setCSS({
              'grid-column': `auto / span ${emptySpan}`,
              'width': '100%',
            });

            i += row.length;

            $metadata.appendChild('div.centerer', $metadata.qs(`.datum:nth-of-type(${i})`)).setCSS({
              'grid-column': `auto / span ${emptySpan}`,
              'width': '100%',
            });

            return i;
          }, 1);
        })($fileData.qs('.metadata'))

        $fileData.style.left = `${($fileData.rect().x - $fileData.rect().w / 2).round(2)}px`;
        $fileData.style.top = `${($fileData.rect().y - $fileData.rect().h / 2).round(2)}px`;

        (function($delete) {
          $delete.setAttr('file', $.getAttr('raw-name'));

          $delete.style.left = `${$fileData.rect().x + $fileData.rect().w - $delete.rect().w}px`;
          $delete.style.top = `${$fileData.rect().y + $fileData.rect().h}px`;
          $delete.rmvClass('hide');
        })(body.qs('body > .file_data_list > .button.delete'));

        $fileData.style.transition = 'all 250ms';
        $fileData.rmvClass('hide');
      })(body.qs('body > .file_data_list').template('.file_data', 'append'));

      const $cover = body.appendChild('div.cover.hide.file_data');
      $cover.rmvClass('hide');

      $cover.addEventListener('click', function(e) {
        $cover.addClass('hide');
        setTimeout(() => $cover.memRmv(), parseTransition($cover).max());

        (function($fileData) {
          $fileData.addClass('hide');
          setTimeout(() => $fileData.memRmv(), parseTransition($fileData).max());
        })(body.qs('body > .file_data_list > .file_data:not(.template)'));

        body.qs('body > .file_data_list > .button.delete').addClass('hide');
      });
    },
  },
  delete_file_data: {
    mouseenter: function(e) {
      if (!this.qs('.confirm').hasClass('hide'))
        return;

      new Tooltip('div.tooltip.helptip', body, tips.help.content.file_data.delete_file_data)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      this.qs('.confirm').rmvClass('hide');
    },
  },
  delete_file_data_confirm: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip.confirm_delete_file_data', body, tips.help.content.file_data.confirm_delete_file_data)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      body.qs('body > .cover.file_data').click();

      (function(file) {
        delete global.data[file];
        body.qs(`body > .top > .files > .file[raw-name='${file}']`)?.memRmv();
      })(this.gen(-1).getAttr('file'));

      body.qs('body > .side > .content > .auto.button')?.click();
    },
  },
  delete_data: {
    mouseenter: function(e) {
      if (!body.qs('body > .top > .delete_data.button > .confirm').hasClass('hide'))
        return;

      new Tooltip('div.tooltip.helptip', body, tips.help.top.delete_data)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      body.qs('body > .top > .delete_data.button > .confirm').rmvClass('hide');
    },
  },
  delete_data_confirm: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip.confirm_delete_data', body, tips.help.top.confirm_delete_data)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
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
        cache: {},
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
      if (this.qsa('.group:not(.template) > .data:not(.template) > .content[over="true"]').some($ => $.clientWidth < $.scrollWidth))
        e.preventDefault();
    },
  },
  add_group: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.bottom.add_group)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      CreateGroup();
    },
  },
  auto_group: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.bottom.auto_group)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
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
      new Tooltip('div.tooltip.helptip', body, tips.help.side.bottom.clean_groups)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
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
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.bottom.remove_all_groups)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
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
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.title)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
            'keypress': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    input: function(e) {
      global.groups[this.gen(-1).getAttr('group-index')].n = this.innerHTML;
    },
  },
  group_edit: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.edit)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) { // holy shit bro this code is cool as fuck - lowkey a lot of fun writing it!
      if (!global.data._len())
        return this.addClass('disabled');

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

      const i_group = this.gen(-1).getAttr('group-index');
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
  },
  data_select: {
    wheel: function(e) {
      if (this.qsa('.file.section > .type.section > p.label > span.text[over="true"]').some($ => $.clientWidth < $.scrollWidth))
        e.preventDefault();
    },
  },
  data_select_type_label: {
    mouseenter: function(e) {
      this.setAttr('over', true);
    },
    wheel: [
      [
        function(e) {
          this.scrollBy(e.deltaY.sgn(20), 0);
        },
        { passive: true },
      ]
    ],
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

        global.groups[i_group].$.qsa('.data:not(.template)')?.forEach(($, i) => $.setAttr('datum-index', i));
      }
    }
  },
  group_data: {
    mouseenter: [
      function(e) {
        new Tooltip('div.tooltip.helptip', body, tips.help.side.group.data.content)
          .setOrigin('center', 'bottom')
          .newAnchor('mouse', 'top', this)
            .setDestructionEvents({
              'mouseleave': null,
              'click': null,
            }, 250)
            .tooltip
          .requestOffset(0, -5)
          .setBoundingBox('left', undefined, 'right', undefined, this)
          .moveAbove(this)
          .create(500, 500)
          .follow(true, 0.1);
      },
      function(e) {
        this.setAttr('over', true);

        const i = (+this.getAttr('over-index') + 1) % 100 || 0;
        this.setAttr('over-index', i);

        setTimeout(() => {
          if (this.getAttr('over') === 'true' && this.getAttr('over-index') == i)
            LinePreview(this);
        }, 250);
      },
    ],
    mouseleave: function(e) {
      this.setAttr('over', false);
    },
    click: function(e) {
      const $lineSettings = body.qs('body > iframe.line_settings');
      events.add(body.qs('body > iframe.line_settings'), 'line_settings.load[1]');
      $lineSettings.rmvClass('hide');

      $lineSettings.setAttr('group-index', this.gen(-2).getAttr('group-index'));
      $lineSettings.setAttr('datum-index', this.gen(-1).getAttr('datum-index'));

      $lineSettings.src = '../../line_settings/html';

      body.qs('body > .cover').rmvClass('hide');
    },
    wheel: [
      [
        function(e) {
          this.scrollBy(e.deltaY.sgn(20), 0);
        },
        { passive: true },
      ],
    ],
  },
  group_data_file: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, this.gen(-2).getAttr('file'))
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500)
        .follow(true, 0.1);
    },
  },
  line_settings: {
    load: [
      function(e) {
        this.contentWindow.postMessage({
          from: 'view',
          ...global.groups[this.getAttr('group-index')].o.reduce((majority, draw) => {
            return (count =>
              count > majority.count ? { count, o: draw, counts: majority.counts } : majority
            )((id =>
              majority.counts[id] = ++majority.counts[id] || 1
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
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.data.copy)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      const i_group = +this.gen(-2).getAttr('group-index');
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
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.data.paste)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      const i_group = +this.gen(-2).getAttr('group-index');
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
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.format)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      const $lineSettings = body.qs('body > iframe.line_settings');
      events.add(body.qs('body > iframe.line_settings'), 'line_settings.load[0]');
      $lineSettings.rmvClass('hide');

      $lineSettings.setAttr('group-index', this.gen(-1).getAttr('group-index'));

      $lineSettings.src = '../../line_settings/html';

      body.qs('body > .cover').rmvClass('hide');
    },
  },
  group_remove: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.group.remove)
        .setOrigin('center', 'bottom')
        .newAnchor('center', 'top', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, -5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
    click: function(e) {
      const { $ } = global.groups.splice(this.gen(-1).getAttr('group-index'), 1)[0];
      $.memRmv();
      global.groups.forEach(
        ({ $ }, i) => $.setAttr('group-index', i)
      );
    },
  },
  draw: {
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.draw)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
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
              $padding.qs(`.group > .option.${k} > input`).value = v ?? ''
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
              Object.fromEntries($settings.qsa('.padding > .group > .option > input').map($ =>
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
    mouseenter: function(e) {
      new Tooltip('div.tooltip.helptip', body, tips.help.side.export)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
            'click': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .create(500, 500);
    },
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
      new Tooltip('div.tooltip.helptip', body, this.innerHTML)
        .setOrigin('center', 'top')
        .newAnchor('center', 'bottom', this)
          .setDestructionEvents({
            'mouseleave': null,
          }, 250)
          .tooltip
        .requestOffset(0, 5)
        .setBoundingBox('left', 'top', 'right', 'bottom')
        .moveAbove(this)
        .addCSS({
          color: this.getParsedCS('color'),
          'font-size': '1.25em',
          background: this.getParsedCS('background-color', 'rgba(0, 0, 0, 0)'),
        })
        .create(500, 500);
    },
  },
});
var events = page.events;

page.loaded.events = true;