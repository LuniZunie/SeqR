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
  LoadEvents,
  Paint,
  CreateGroup,
  AddDataToGroup,
  LinePreview,
  AreGroupsClean,
  GetAutoGroup,
  CreateFileName,
};

const page = {
  loaded: {
    main: true,
    events: false,
  },
  tooltips: {
    fileNames: [],
  },
  currentAutoGroup: '',
};

LooseUpdate(function(e) {
  const rect = body.qs('body > .top > .import').rect();
  [ 'left', 'top', 'width', 'height' ].forEach(
    k => body.qs('body > .top').style.setProperty(`--file_picker_${k}`, `${rect[k]}px`)
  );

  body.qs('body > .top > .extensions').style.setProperty('--extensions', body.qsa('body > .top > .extensions > .extension').length);
});

function Loaded() {
  page.events.add(window, 'window');
  doc.qsa('[events]').forEach($ => {
    const evs = $.getAttr('events');
    if (evs !== null && evs !== undefined)
      page.events.add($, ...evs.split(/\s/));
  });

  return;
  page.events.get.auto_group.click();
  page.events.get.settings_save.click.call(body.qs('body > .top > .draw.button'));
  return;
  page.events.get.group_edit.click.call(body.qs('body > .side > .content > .groups > .group:not(.template) > .content > .edit'));
  return;
  page.events.get.group_data.click.call(body.qs('body > .side > .content > .groups > .group > .content > .data:not(.template) > .content'));
}

function WaitForLoad() {
  if (page.loaded.v_every(v => v === true))
    return Loaded();

  requestIdleCallback(WaitForLoad);
}

WaitForLoad();

function LoadEvents($, includeSelf = true) {
  (arr => includeSelf ? arr.concat($) : arr)($.qsa('[events]')).forEach($ => {
    const evs = $.getAttr('events');
    if (evs !== null && evs !== undefined)
      page.events.add($, ...evs.split(/\s/));
  });

  return $;
}

FixedUpdate(function(e) {
  body.qs('body > .top > .delete_data').setClass('disabled', !global.data?._len());
  body.qs('body > .top > .draw').setClass('disabled', global.groups.length <= AreGroupsClean().length);
  body.qs('body > .top > .export').setClass('disabled', !body.qs('body > .content > .easel > svg.paper:not(.template)'));

  body.qs('body > .side > .content > .auto.button').setClass('disabled', !global.data._len() || page.currentAutoGroup == GetAutoGroup());
  body.qs('body > .side > .content > .clean.button').setClass('disabled', !AreGroupsClean().length);
  body.qs('body > .side > .content > .remove_all.button').setClass('disabled', !global.groups.length);

  const clip = JSON.stringify(global.clipboard?.data);
  (global.groups ?? []).forEach(
    ({ $, o }) => o.forEach(
      (options, i) => $.qs(`.content > .data[datum-index='${i}'] > .paste.button`).setClass('disabled',
        !(global.clipboard?.type == 'line_style' && global.clipboard?.data?._len() && JSON.stringify(options) != clip)
      )
    )
  );
});

/**
 * Asynchronous function that performs the painting operation.
 * @returns {Promise<void>} A promise that resolves when the painting is complete.
 */
async function Paint(e) {
  body.qs('body > .top > .draw').addClass('cancel');

  const $notif = body.appendChild('notification');
  $notif.innerText = 'Loading Data...';

  body.qs('body > .content > .easel').icon('loading', true); // maybe center on page instead of centering on easel

  let settings = e;
  await new Promise(async r_paint => {
    global.drawReject = r_paint;
    if (!global.data?._len() || !global.groups?.length) {
      $notif.innerText = '<b style="color: red">ERROR:</b> No data or groups loaded!';

      return setTimeout(() => {
        $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
        page.events.add($notif, 'notification');
      }, 3000);
    }

    const settingify = (setting, placeholder) => setting === '' ? placeholder : setting;
    settings = {
      draw: {
        d: {}, // data
        r: {}, // range
        o: {}, // draw options
        l: {}, // chunk location
        y: {}, // y-coordinates
      },
      range: {
        min: +settingify(global.draw.range.min, global.dataRange[0]),
        max: +settingify(global.draw.range.max, global.dataRange[1]),
      },
      text: { // add position modifier
        align: settingify(global.draw.text.align, 'center'),
        size: +settingify(global.draw.text.size, 16),
        color: settingify(global.draw.text.color, 'white'),
        font: settingify(global.draw.text.font, 'arial'),
      },
      padding: {
        page: {
          top: +settingify(global.draw.padding.page.top, 0),
          right: +settingify(global.draw.padding.page.right, 0),
          bottom: +settingify(global.draw.padding.page.bottom, 0),
          left: +settingify(global.draw.padding.page.left, 0),
        },
        group: {
          top: +settingify(global.draw.padding.group.top, 0),
          right: +settingify(global.draw.padding.group.right, 0),
          bottom: +settingify(global.draw.padding.group.bottom, 0),
          left: +settingify(global.draw.padding.group.left, 0),
        },
      },
      key: { // make customizable
        enabled: true,
        intervals: 10,
        position: 'top',
        abbreviation: 'standard',
        sizes: {
          height: {
            v: (3) / 100,
            u: '%',
          },
          padding: {
            v: (1) / 100,
            u: '%',
          },
          text: {
            v: (2) / 100,
            u: '%',
          },
        }
      },
      resolution: 2048, // make customizable
    };

    if (global.groups._len() === 0) {
      $notif.innerText = '<b style="color: red">ERROR:</b> No valid data types found!';
      return setTimeout(() => {
        $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
        page.events.add($notif, 'notification');
      }, 3000);
    }

    await new Promise(r_wait => requestIdleCallback(r_wait));
    global.update.pause.loose = true;
    global.update.pause.fixed = true;

    body.qsa('body > .content > .easel > svg.paper:not(.template)')?.memRmv();

    const $svg = body.qs('body > .content > .easel').template('svg.paper');
    $svg.style.background = global.draw.bg;

    const w_svg = settings.range.max - settings.range.min +
      settings.padding.page.left + settings.padding.page.right +
      settings.padding.group.left + settings.padding.group.right;

    let h_svg = settings.padding.page.top + settings.text.size;

    let cali_i = 0;

    let typeOffset = 0;
    const { min, max } = settings.range;
    for (const group_i in global.groups) { // sorting by lines and calibrating height
      const group = global.groups[group_i];

      let hasData = false;

      settings.draw.d[group_i] = {};
      settings.draw.r[group_i] = { s: Infinity, e: -Infinity };
      settings.draw.l[group_i] = [];
      settings.draw.y[group_i] = {};

      for (let type_i in group.d) {
        type_i = +type_i;

        const options = group.o[type_i];
        settings.draw.o[type_i + typeOffset] = { c: ColorArrayToColor(options.c), l: options.l };

        const { f: file, t: type, s: strand } = group.d[type_i];
        if (settings.draw.l[group_i].every(
          ([ f, t, s ]) => !(f == file && t == type && s == strand))
        )
          settings.draw.l[group_i].push([ file, type, strand ]);

        const height = options.l.h;
        await new Promise(r_read => {
          Lines(file, type, strand, min, max).then(async gen => {
            gen = gen();
            let lines;
            while (lines != 'done') {
              await new Promise(
                r_gen => gen.next().then(({ value }) => {
                  lines = value;
                  r_gen();
                })
              );

              if (lines != 'done') {
                for (const [ line, s, e ] of lines) {
                  if (s > max || e < min)
                    continue;

                  settings.draw.d[group_i][line] = type_i + typeOffset; // [ global index, local index ]
                  settings.draw.r[group_i] = { s: settings.draw.r[group_i].s.min(s), e: settings.draw.r[group_i].e.max(e) };
                  settings.draw.y[group_i][line] = height;

                  hasData = true;

                  h_svg += height;
                }

                cali_i += lines.length;
                $notif.innerText = `Sorting Lines & Calibrating Height... (${cali_i} lines)`;

                lines = null;
              }
            }

            gen.return('done');
            gen = undefined;

            r_read();
          });
        });
      }

      typeOffset += group.d.length;
      if (hasData)
        h_svg += settings.padding.group.top + settings.padding.group.bottom;
    }

    $notif.innerText = `Calibrating Line Positions...`;
    await new Promise(r_wait => requestAnimationFrame(r_wait));

    (function() {
      let y = 0;
      const temp = {};
      settings.draw.y = settings.draw.y.v_forEach(lines =>
        lines._forEach(([ l, h ]) => {
          temp[l] = y;
          y += h;
        })
      );

      settings.draw.y = temp;
    })();

    h_svg += settings.padding.page.bottom;

    if (settings.key.enabled) {
      let percent = 0.005; // dont know why this is set to 0.005 and not 0.0 - added a 0.005 padding ??? - fix
      let pixels = 0;
      settings.key.sizes.v_forEach(v => {
        if (v.u == '%')
          percent += v.v;
        else if (v.u == 'px')
          pixels += v.v;
      });

      h_svg = (h_svg + pixels) * (((percent / (1 - percent)) || 0) + 1);
    }

    settings.key.sizes = settings.key.sizes.v_$map(v => {
      return { ...v, true: v.unit == '%' ? h_svg * v.v : v.v };
    });

    $svg.setAttrs('width', 'height', settings.resolution); // set svg size
    const count = { rect: 0, image: 0 };
    let draw_i = 0;

    console.time('draw'); // temporary (for debug) - remove later
    console.profile('draw'); // temporary (for debug) - remove later

    let y = settings.padding.page.top + settings.text.size;
    if (settings.key.enabled && settings.key.position == 'top') {
      y += settings.key.sizes.text.true;

      CreateKey.call(
        $svg,
        'top',
        y / h_svg,
        h_svg,
        settings.key.sizes.height.true / h_svg,
        settings.key.sizes.text.true,
        settings.key.abbreviation,
        settings.key.intervals,
        settings.range,
      );

      y += settings.key.sizes.height.true + settings.key.sizes.padding.true + h_svg * 0.005; // dont know why there is 0.005 padding added...
    }

    const dh_min = 1 / settings.resolution;
    for (const [ group_i, data ] of settings.draw.d._ens()) {
      if (data._len() == 0)
        continue;

      (function($text, name) {
        $text.style.font = `${settings.text.size}px ${settings.text.font}`;

        switch (settings.text.align) {
          case 'left': {
            $text.setAttr('text-anchor', 'start');
            $text.setAttr('x', `${(settings.padding.page.left + settings.padding.group.left) / w_svg * 100}%`);
            break;
          };
          default:
          case 'center': {
            $text.setAttr('text-anchor', 'middle');
            $text.setAttr('x', `${(settings.padding.page.left + settings.padding.group.left + w_svg -
              settings.padding.page.right - settings.padding.group.right) / w_svg * 50}%`);
            break;
          };
          case 'right': {
            $text.setAttr('text-anchor', 'end');
            $text.setAttr('x', `${(w_svg - settings.padding.page.right - settings.padding.group.right) / w_svg * 100}%`);
            break;
          };
        }

        $text.setAttr('y', `${y / h_svg * 100}%`);
        $text.setAttr('fill', settings.text.color);

        $text.innerText = name;
      })($svg.template('text'), global.groups[group_i].n);

      y += settings.padding.group.top;

      const range = settings.draw.r[group_i];
      await new Promise(r_read => {
        Lines(settings.draw.l[group_i], null, null, range.s, range.e, data._ks()).then(async gen => {
          gen = gen();
          let lines;
          while (lines != 'done') {
            await new Promise(
              r_gen => gen.next().then(({ value }) => {
                lines = value;
                r_gen();
              })
            );

            if (lines != 'done') {
              for (const [ line, s, e ] of lines) {
                const option = settings.draw.o[data[line]];

                const dx_1 = (s - min + settings.padding.page.left + settings.padding.group.left) / w_svg * settings.resolution;
                const dx_2 = (e - min + settings.padding.page.left + settings.padding.group.left) / w_svg * settings.resolution;

                const dy = (settings.draw.y[line] + y) / h_svg * settings.resolution;
                const dh = Math.max(option.l.h / h_svg, dh_min) * settings.resolution;

                delete settings.draw.y[line];

                const $path = $svg.template('path');
                $path.setAttr('fill', option.c);
                $path.setAttr('d', `${DrawSvgLine(option, dx_1, dy, dx_2, dy + dh).join(' ')} Z`);

                if (++count.rect >= 1000) { // copilot wants to try 10000 - not sure if this is a good idea - will try later
                  draw_i += count.rect;
                  CreateSvgImage.call($svg, w_svg, h_svg, settings.resolution);
                  $notif.innerText = `Drawing... (${(draw_i + prandom() * 999 - 499 | 0).clamp(0)} lines)`;

                  count.rect = 0;
                  if (++count.image >= 25) { // copilot wants to try 100 and 1000 - not sure if this is a good idea - will try later
                    $svg.qsa('image:not(.template)').forEach(
                      $image => $image.style.display = ''
                    );

                    await new Promise(r_merge => {
                      MergeSvgImages.call($svg, settings.resolution, r_merge);
                      $notif.innerText = `Drawing... (${(draw_i + prandom() * 3999 - 1999 | 0).clamp(0)} lines)`;
                    });

                    count.image = 1;
                  }
                }
              }

              lines = null;
            }
          }

          gen.return('done');
          gen = null;

          r_read();
        });
      });

      (delete settings.draw.d[group_i]),(delete settings.draw.r[group_i]), (delete settings.draw.o[group_i]), (delete settings.draw.l[group_i]);

      y += settings.padding.group.bottom;
    }

    $notif.innerText = `Drawing... (${draw_i} lines)`;

    if (settings.key.enabled && settings.key.position == 'bottom') {
      y += settings.key.sizes.padding.true;

      CreateKey.call(
        $svg,
        'bottom',
        y / h_svg,
        h_svg,
        settings.key.sizes.height.true / h_svg,
        settings.key.sizes.text.true,
        settings.key.abbreviation,
        settings.key.intervals,
        settings.range,
      );

      y += settings.key.sizes.height.true + settings.key.sizes.text.true + h_svg * 0.005; // dont know why there is 0.005 padding added...
    }

    if ($svg.qs(':is(path, text):not(.template)'))
      CreateSvgImage.call($svg, w_svg, h_svg, settings.resolution);

    await new Promise(r_merge => MergeSvgImages.call($svg, settings.resolution, r_merge, true));

    $svg.qsa('image:not(.template)').forEach($image => $image.style.display = '');

    requestIdleCallback(() => r_paint('done'));
  }).then(
    v => v == 'cancel' ? body.qsa('body > .content > .easel > svg.paper:not(.template)')?.memRmv() : $notif.innerText = 'Done!'
  );

  console.timeEnd('draw'); // temporary (for debug) - remove later
  console.profileEnd('draw'); // temporary (for debug) - remove later

  body.qs('body > .content > .easel > icon[type=loading]').memRmv();

  $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
  page.events.add($notif, 'notification');

  body.qs('body > .top > .draw').rmvClass('cancel');

  global.drawReject = undefined;

  global.update.pause.loose = false;
  global.update.pause.fixed = false;
}

/**
 * Retrieves lines from a file based on the specified criteria.
 * @param {string} file - The file to retrieve lines from.
 * @param {string} type - The type of lines to retrieve.
 * @param {string} strand - The strand of lines to retrieve.
 * @param {number} s - The starting position of the lines.
 * @param {number} e - The ending position of the lines.
 * @param {Array<number>} [lines] - Optional array of specific line numbers to retrieve.
 * @returns {AsyncGenerator<Array<Object>|string>} - An async generator that yields arrays of line objects or the string 'done'.
 */
async function Lines(file, type, strand, s, e, lines) {
  function GetChunks(file, type, strand) {
    return global.data[file][type][strand].filter(
      ({ r: [ s_range, e_range ] }) => (s <= e_range && s >= s_range) || (e >= s_range && e <= e_range) || (s <= s_range && e >= e_range)
    );
  };

  const multiFiles = file instanceof Array;
  const check = new RegExp(`[^${lines?.join('')}]\\s\\d+\\s(\\d+\\n|\\d+$)`, 'g');
  return async function*() {
    const loopAmnt = multiFiles ? file.length : 1;
    for (let i = 0;i < loopAmnt;i++) {
      const chunks = multiFiles ? GetChunks(...file[i]) : GetChunks(file, type, strand);
      for (const { u } of chunks) {
        let obj;
        let fullChunk = '';
        const decoder = new TextDecoder();
        const write = new WritableStream({
          write(chunk) {
            fullChunk += decoder.decode(chunk);
          },
          close() {
            if (lines === undefined)
              obj = fullChunk.split('\n').map(
                line => line.split(' ')
              ).filter(([ , s_line, e_line ]) =>
                ((s <= e_line && s >= s_line) ||
                (e >= s_line && e <= e_line) ||
                (s <= s_line && e >= e_line))
              );
            else
              obj = fullChunk.replace(check, '').split('\n').map(line => line.split(' '));

            return;
          },
          abort(err) {
            console.error(err);
          },
        });

        const blob = await fetch(`blob:${u}`, { cache: 'no-store' }).then(r => r.blob());

        const stream = blob.stream();
        await stream.pipeTo(write);

        if (obj.length == 0)
          continue;

        yield obj;
      }
    }

    while (true)
      yield 'done';
  };
}

/**
 * Creates a key with labels and paths based on the provided parameters.
 *
 * @param {string} anchor - The anchor position of the key ('top' or 'bottom').
 * @param {number} y - The y-coordinate of the key.
 * @param {number} h_svg - The height of the SVG element.
 * @param {number} h - The height of the key.
 * @param {number} h_text - The font size of the key labels.
 * @param {string} abbr - The abbreviation style for the labels ('none', 'standard', 'scientific', 'exponential').
 * @param {number} intr - The number of intervals in the key.
 * @param {object} options - The options object containing 'min' and 'max' values.
 */
function CreateKey(anchor, y, h_svg, h, h_text, abbr, intr, { min, max }) {
  const w = 0.005;

  const mods = {
    h: 0.1,
    center: 1/15,
    superscript: 0.75,
  };

  const gap = (1 - w) / (intr - 1);
  const range = (max - min) / intr;
  for (let i = 0; i < intr; i++) {
    const x = i * gap;
    const label = (function(text) { // abbreviate text
      switch (abbr) {
        case 'none':
          return text.toString();
        default:
        case 'standard':
          return text.toShortString();
        case 'scientific':
          return text.toScientific();
        case 'exponential':
          return text.toExponential();
      }
    })((range * x + min).rnd());

    const $text = this.template('text');
    $text.style.font = `${h_text}px arial`; // try sans-serif

    if (i == 0)
      $text.setAttr('text-anchor', 'start');
    else if (i == intr - 1)
      $text.setAttr('text-anchor', 'end');
    else
      $text.setAttr('text-anchor', 'middle');

    $text.setAttr('x', `${(x - (i == 0 || i == intr - 1 ? 0 : (x - 0.5) * mods.center)) * 100}%`);
    $text.setAttr('y', `${(y + (anchor == 'top' ? 0 : h + 0.005)) * 100}%`);

    $text.setAttr('dominant-baseline', anchor == 'top' ? 'text-top' : 'hanging');

    const w_cap = (gap - w) * 2/3;
    if (label.width(`${h_text / h_svg}px arial`) > w_cap) // try sans-serif
      $text.setAttr('textLength', `${w_cap * 100}%`);

    $text.setAttr('fill', 'white'); // make customizable

    $text.innerText = `${label.replace('*', '&times;').replace(/\^.*/,
      match => `<tspan font-size='${mods.superscript}em' dy='-${mods.superscript * (anchor == 'top' ? 0.5 : 0.125)}em'>${match.slice(1)}</tspan>`
    )}`;

    if (anchor == 'top')
      y += 0.005;

    const $path = this.template({ qs: 'path' });
    $path.setAttr('d', `${Array.from({ length: intr }, (_, i) => {
      const x = i * gap;
      const x_next = x + gap;

      return `M ${x + w} ${y + h / 2} ` +
        `L ${x + w} ${y + h} ` +
        `L ${x} ${y + h} ` +
        `L ${x} ${y} ` +
        `L ${x + w} ${y} ` +
        `L ${x + w} ${y + h * (0.5 + mods.h)} ` +
        `L ${x_next} ${y + h * (0.5 + mods.h)} ` +
        `L ${x_next} ${y + h * (0.5 - mods.h)} ` +
        `L ${x + w} ${y + h * (0.5 - mods.h)} `;
    }).join('')}Z`);
    $path.style.fill = 'pink'; // temporary color - make customizable
  }
}

/**
 * Creates an SVG image with scaled paths and text.
 * @param {number} w - The width of the image.
 * @param {number} h - The height of the image.
 * @param {number} res - The scaling factor for paths and text.
 */
function CreateSvgImage(w /* not sure if will need this */, h /* dont know why this is used */, res) { // poor code quality - contains parts might not necessary - fix
  this.qsa('text:not(.template)').forEach( // scale text
    $text =>  $text.style.fontSize = `${+($text.style.fontSize.replace('px') || '') / h * res}px`
  );

  const $image = this.template('image', false);
  $image.setAttrs('x', 'y', 0); // set image position
  $image.setAttrs('width', 'height', res); // set image size
  $image.setAttr('href', SvgURL(this)); // set image href

  this.qsa(':is(path, text, g):not(.template)')?.memRmv(); // remove paths and text

  this.appendChild($image); // add image to svg
}

/**
 * Merges multiple SVG images into a single canvas.
 *
 * @param {number} res - The resolution of the canvas.
 * @param {Function} r_merge - The callback function to be called after merging the images.
 * @param {boolean} [final=false] - Indicates whether the merged image is the final image.
 * @returns {Promise<void>} - A promise that resolves when the merging is complete.
 */
async function MergeSvgImages(res, r_merge, final = false) {
  const $paper = document.createElement('canvas');
  const pen = $paper.getContext('2d');

  ($paper.width = res), ($paper.height = res); // set canvas size

  let loaded = 0;
  let $images = this.qsa('image:not(.template)').array();
  await new Promise(r_$images => {
    for (let $image of $images) {
      const img = new Image(res, res);
      img.src = $image.getAttr('href');
      img.onload = () => {
        pen.drawImage(img, 0, 0, res, res);

        img.memRmv();
        img.onload = undefined;

        if (++loaded == $images.length)
          r_$images();
      };
    }
  });

  $paper.toBlob(blob => {
    const $image = this.template('image', false);
    $image.setAttrs('x', 'y', 0); // set image position
    $image.setAttrs('width', 'height', final ? '100%' : res); // set image size
    $image.setAttr('href', URL.createObjectURL(blob, { type: 'image/svg+xml;charset=utf-8' })); // set image href

    $image.onload = () => {
      this.qsa('image:not(.template)').forEach($ => { // remove images and revoke object urls
        URL.revokeObjectURL($.getAttr('href'));
        $.memRmv();
      });

      this.appendChild($image); // add image to svg

      $paper.memRmv();
      $paper.toblob = undefined;

      $image.onload = undefined;

      r_merge();
    };
  });
}

/**
 * Creates a URL for the given SVG element.
 * @param {Element} $svg - The SVG element.
 * @returns {string} The URL for the SVG element.
 */
function SvgURL($svg) {
  return (URL || webkitURL || window).createObjectURL(new Blob([ (new XMLSerializer()).serializeToString($svg) ], { type: 'image/svg+xml;charset=utf-8' }));
}

/**
 * Creates a group with the given name.
 * If no name is provided, a default name will be assigned.
 *
 * @param {string} name - The name of the group.
 */
function CreateGroup(name) {
  global.groups ??= [];
  name ??= `Group ${global.groups.length + 1}`;

  const $group = page.events.add(body.qs('body > .side > .content > .groups').template('.group', 'append'), 'group');
  $group.setAttr('group-index', global.groups.length);

  $group.qs('.content > .name').innerText = name;
  if (global.data._len())
    $group.qs('.content > .edit').rmvClass('disabled');

  $group.qsa('.backdrop').forEach(
    $ => $.style.animation = `CycleBackground 7s linear -${Date.now() % 10000}ms infinite`
  );

  LoadEvents($group);

  global.groups.push({
    n: name, // name
    $: $group, // outer group element
    d: [], // data
    o: [], // draw options
  });

  return global.groups.last();
}

/**
 * Adds data to a group.
 *
 * @param {number} group_i - The index of the group.
 * @param {string} file - The file name.
 * @param {string} type - The type of data.
 * @param {string} strand - The strand of the data.
 */
function AddDataToGroup(group_i, file, type, strand) {
  if (file == '*')
    return global.data._forEach(
      ([ file, types ]) => types._forEach(
        ([ type_2, strands ]) => strands._forEach(
          ([ strand_2 ]) => strand == strand_2 && type_2 == type ? AddDataToGroup(group_i, file, type, strand) : void(0)
        )
      )
    );

  const seed = parseSeed(type + strand);

  const group = global.groups[group_i];
  const $group = group.$;

  const $data = $group.qs('.content').template('.data', 'append');
  $data.setAttr('datum-index', group.d.length);

  let id = 0;
  while (body.qs(`#group_data_${++id}`))
    continue;

  $data.id = `group_data_${id}`;

  $data.qs('.content > .strand').innerText = strand;
  $data.qs('.content > .strand').style.setProperty('--length', strand.length);

  $data.qs('.content > .type').innerText = type;
  $data.qs('.content > .type').style.setProperty('--length', type.length);

  (function($) {
    let [ , name, ext ] = file.split(/([\s\S]*)\./);
    if (name.length > 9) {
      name = `${name.slice(0, 3)}...${name.slice(-3)}`;

      $.setAttr('file', file);
      $.setAttr('events', 'group_data_file');
    }

    $.innerText = `${name}.${ext}`;
    $.style.setProperty('--length', name.length + ext.length + 1);
  })($data.qs('.content > .file'));

  LoadEvents($data);

  const optionsObj = {
    c: PrandomColorArray(parseSeed(Math.random() * 1000), 0), // color - //CHANGE TO PrandomColorArray(seed, 0)
    l: { // line
      h: 5, // line height
      b: 0, // line body
      l: 0, // line head left
      r: 0, // line head right
    },
  };

  global.colors.strands ??= {};
  switch (strand) {
    case '+': {
      optionsObj.c = [ 0, 255, 0, 255 ];

      switch (type.toLowerCase()) {
        case 'pseudogene': {
          optionsObj.l.b = 'double';
          optionsObj.l.l = 'solid';
          optionsObj.l.r = 'right';

          break;
        };
        default: {
          optionsObj.l.b = 'solid';
          optionsObj.l.l = 'none';
          optionsObj.l.r = 'block_right';

          break;
        };
      }

      break;
    };
    case '-': {
      optionsObj.c = [ 255, 0, 0, 255 ];

      switch (type.toLowerCase()) {
        case 'pseudogene': {
          optionsObj.l.b = 'double';
          optionsObj.l.l = 'left';
          optionsObj.l.r = 'solid';

          break;
        };
        default: {
          optionsObj.l.b = 'solid';
          optionsObj.l.l = 'block_left';
          optionsObj.l.r = 'none';

          break;
        };
      }

      break;
    };
    default: {
      const cache = (global.colors.cache[type] ??= {})[strand] ??= undefined;
      if (cache)
        optionsObj.c = structuredClone(cache); // might not need to clone
      else {
        const d_min = (200 - global.colors.taken.length * 15).clamp(0, 200);
        for (let i = 0; global.colors.taken.some(color => color.dist(optionsObj.c) < d_min) && i < 1000;)
          optionsObj.c = PrandomColorArray(seed, ++i);

        const color = structuredClone(optionsObj.c); // might not need to clone
        global.colors.cache[type] ??= {};
        global.colors.cache[type][strand] = color;
        global.colors.taken.push(color);
      }

      break;
    };
  }

  group.o.push({
    c: optionsObj.c,
    l: optionsObj.l._$map(([ k, v ]) => {
      switch (k) {
        case 'b':
          return [ k, typeof v == 'string' ? global.lineStyles.bodies._findIndex(
            ([ k ]) => v == k
          ).clamp(0) : v ];
        case 'l':
        case 'r':
          return [ k, typeof v == 'string' ? global.lineStyles.heads._findIndex(
            ([ k ]) => v == k
          ).clamp(0) : v ];
        default:
          return [ k, v ];
      }
    }),
  });

  group.d.push({ $: $data, f: file, t: type, s: strand });

  if (global.clipboard?.type == 'line_style' && global.clipboard?.data?._len() && JSON.stringify(group.o.last()) != JSON.stringify(global.clipboard?.data))
    (function($) {
      $.rmvClass('disabled');
      $.style.transition = 'none';

      requestAnimationFrame(() => $.style.transition = '');
    })($data.qs('.paste.button'));

  AreGroupsClean();
}

function LinePreview($, keep = false) {
  const w = Function(`return ${global.settings.linePreviewWidth};`)();
  const margin = Function(`return ${global.settings.linePreviewMargin};`)();

  const { h, y } = $.rect();

  const group = global.groups[$.gen(-3).getAttr('group-index')];
  const { l, r } = group.$.rect();

  const options = group.o[$.gen(-1).getAttr('datum-index')];

  const id = $.gen(-1).id;
  const $svg = (function() {
    const $svgs = body.qsa(`body > .previews > svg.preview.${id}`);
    if (keep && $svgs.length)
      return $svgs.filter(($, i) => {
        if (i == 0)
          return true;

        $.memRmv();
      })[0];

    $svgs?.memRmv();
    return body.qs('body > .previews').template('svg.preview');
  })();

  $svg.addClass(id);
  $svg.setAttr('target', id);

  $svg.style.left = `${(l => l < 0 ? r + margin : l)(l - w - margin)}px`;
  $svg.style.top = `${y - 2}px`;
  $svg.style.width = `${w}px`;
  $svg.style.height = `${h}px`;

  $svg.style.borderRadius = `${w.min(h) / 3}px`;

  requestAnimationFrame(() => {
    $svg.style.opacity = 1;
    $svg.style.transform = 'scale(1)';
  });

  $svg.qsa('path:not(.template)')?.memRmv();

  const $path = $svg.template('path');
  $path.setAttr('fill', ColorArrayToColor(options.c));
  $path.setAttr('d', `${DrawSvgLine(options, w * 0.05, h * 0.4, w * 0.95, h * 0.6).join(' ')} Z`);

  const mouseEvent = function(e) {
    if (!$svg) {
      removeEventListener('mouseout', mouseEvent);
      return $.gen(-2).removeEventListener('mouseover', mouseEvent);
    } else if (e.toElement.childOf($, true))
      return;

    $svg.style.transform = 'scale(0)';
    $svg.style.opacity = 0;

    setTimeout(() => {
      $svg?.memRmv();
    }, getComputedStyle($svg).transitionDuration.split(/,\s/).map(
      v => +new Function(`return ${v.replace(/ms/g, '').replace(/s/g, '* 1000')};`)()
    ).max());

    removeEventListener('mouseout', mouseEvent);
    $.gen(-2).removeEventListener('mouseover', mouseEvent);
  };

  addEventListener('mouseout', mouseEvent);
  $.gen(-2).addEventListener('mouseover', mouseEvent);
}

/**
 * Checks if the groups are clean.
 * @returns {Array} An array of indices representing the groups that are not clean.
 */
function AreGroupsClean() {
  if (global.groups) {
    const groups = {
      empty: [],
      dups: {},
    };

    global.groups.forEach(({ d: data }, i) => {
      if (!data.length)
        return groups.empty.push(i);

      (function(id) {
        groups.dups[id] ??= [];
        groups.dups[id].push(i);
      })(JSON.stringify(Object.assign({}, data)));
    });

    groups.dups = groups.dups._map(
      ([ , v ]) => v.length > 1 ? v : null
    ).filter(
      v => v !== null
    );

    const bad = groups.empty.concat(groups.dups.map(
      group => group.filter(
        (_, i) => i
      ).flat()
    ).filter(
      group => group.toString().length
    ).sort(
      (a, b) => b - a
    )); //descending order because of array shifting

    return bad;
  }
}


/**
 * Retrieves the auto group data.
 * @returns {string} The auto group data in JSON format.
 */
function GetAutoGroup() {
  return JSON.stringify({ data: global.data.v_$map(
    types => (types ?? {}).v_$map(
      strands => (strands ?? {})._ks().sort()
    )
  ), groups: global.groups });
}

function CreateFileName() {
  return `SeqR_${TimeString().replace(', ', '_')}`;
}