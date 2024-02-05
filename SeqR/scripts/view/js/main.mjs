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
import { readFLS } from './file_reader.mjs';
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
  UpdateSettingsTextPreview,
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

  (function($loadingScreen) {
    $loadingScreen.addClass('hide');
    setTimeout(() => $loadingScreen?.memRmv(), parseTransition($loadingScreen).max());
  })(body.qs('body > .loading_screen'));
}

function WaitForLoad() {
  if (page.loaded.v_every(v => v === true) && Promise.allSettled(global.pagePromises))
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
      (options, i) => $.qs(`.content > .data[datum-index='${i}'] > .paste.button`)?.setClass('disabled',
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
  if (page.paintDisk instanceof Disk)
    page.paintDisk.wipe();

  page.paintDisk = new Disk();

  body.qs('body > .top > .draw').addClass('cancel');

  const $notif = body.appendChild('notification');
  $notif.innerText = 'Loading Data...';

  body.qs('body > .content > .easel').icon('loading', true); // maybe center on page instead of centering on easel

  let settings = e;
  const currentRun = ++global.drawRun;
  await new Promise(async r_paint => {
    global.drawReject = function(reason = 'cancel') {
      global.drawRun++;
      r_paint(reason);
    };

    if (!global.data?._len() || !global.groups?.length) {
      $notif.innerText = '<b style="color: red">ERROR:</b> No data or groups loaded!';

      return setTimeout(() => {
        $notif.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
        page.events.add($notif, 'notification');
      }, 3000);
    }

    const settingsObjCheck = function([ k, v ]) {
      return [ k, (function(v) {
        if (v instanceof Array)
          return (arr => arr.length ? arr : undefined)(v.filter(v => v !== undefined));
        else if (v instanceof Object)
          return (obj => obj._len() ? obj : {})(Object.fromEntries(v._map(settingsObjCheck).filter(([ , v ]) => v !== undefined)));
        else
          return v;
      })(v) ];
    };

    settings = {
      draw: {
        d: {}, // data
        r: {}, // range
        o: {}, // draw options
        l: {}, // chunk location
        y: {}, // y-coordinates
        g: {}, // groups
      },
      ...Object.deepMerge(
        {
          range: {
            min: global.dataRange[0],
            max: global.dataRange[1],
          },
          text: { // add position modifier
            align: 'center',
            character: {
              bold: false,
              italic: false,
              outline: false,
              decoration: '',
            },
            font: {
              size: 16,
              family: 'arial',
            },
            color: 'white',
          },
          padding: {
            page: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            group: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          background: 'none',
        },
        Object.fromEntries(global.draw._map(settingsObjCheck).filter(([ , v ]) => v !== undefined))
      ),
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
      overrideGroupColors: true,
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
    $svg.style.background = global.draw.background;

    const w_svg = settings.range.max - settings.range.min +
      settings.padding.page.left + settings.padding.page.right +
      settings.padding.group.left + settings.padding.group.right;

    let h_svg = settings.padding.page.top + settings.text.font.size;

    let cali_i = 0;

    let writingPromises = [];

    let typeOffset = 0;
    const { min, max } = settings.range;
    for (const group_i in global.groups) { // sorting by lines and calibrating height
      if (currentRun != global.drawRun)
        throw 'cancel';

      const group = global.groups[group_i];

      let hasData = false;

      settings.draw.d[group_i] = {};
      settings.draw.r[group_i] = { s: Infinity, e: -Infinity };
      settings.draw.l[group_i] = [];
      settings.draw.y[group_i] = {};

      for (let type_i in group.d) {
        if (currentRun != global.drawRun)
          throw 'cancel';

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
          if (currentRun != global.drawRun)
            throw 'cancel';

          Lines(file, type, strand, min, max).then(async gen => {
            if (currentRun != global.drawRun)
              throw 'cancel';

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
                for (const { line, start, end, group } of lines) {
                  if (start > max || end < min)
                    continue;

                  settings.draw.d[group_i][line] = type_i + typeOffset; // [ global index, local index ]
                  settings.draw.r[group_i] = { s: Math.min(start, settings.draw.r[group_i].s), e: Math.max(end, settings.draw.r[group_i].e) };
                  if (group == '')
                    settings.draw.y[group_i][line] = height;
                  else {
                    if (settings.draw.g[group]) {
                      const groupObj = settings.draw.g[group];
                      groupObj.max_h = Math.max(groupObj.max_h, height);

                      settings.draw.y[group_i][line] = [ group ];
                    } else {
                      settings.draw.g[group] = {
                        group_i,
                        max_h: height,
                      };

                      settings.draw.y[group_i][line] = group;
                    }
                  }

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
          }).catch(err => { throw err; });
        }).catch(err => { throw err; });
      }

      typeOffset += group.d.length;
      if (hasData)
        h_svg += settings.padding.group.top + settings.padding.group.bottom;

      const dataFile = page.paintDisk.new(`${group_i}_data.json`, true);
      writingPromises.push(dataFile.write(settings.draw.d[group_i]));
      settings.draw.d[group_i] = dataFile;

      const locationFile = page.paintDisk.new(`${group_i}_location.json`, true);
      writingPromises.push(locationFile.write(settings.draw.l[group_i]));
      settings.draw.l[group_i] = locationFile;
    }

    await Promise.all(writingPromises);
    writingPromises = null;

    $notif.innerText = `Calibrating Line Positions...`;
    await new Promise(r_wait => requestAnimationFrame(r_wait));

    (function() {
      let y = 0;
      const temp = {};
      settings.draw.y = settings.draw.y.v_forEach(lines =>
        lines._forEach(([ l, h ]) => {
          if (currentRun != global.drawRun)
            throw 'cancel';

          switch (typeof h) {
            case 'number': {
              temp[l] = y;
              y += h;
              break;
            } case 'string': {
              const group = settings.draw.g[h];
              temp[l] = [ y, h ];
              group.y = y;

              y += group.max_h;
              break;
            } case 'object': {
              temp[l] = settings.draw.g[h[0]].y;
              break;
            }
          }
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

    let y = settings.padding.page.top + settings.text.font.size;
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

    let imageMergeId = 0;
    let imageMergePromise = [];

    const dh_min = 1 / settings.resolution;
    for (const [ group_i, dataFile ] of settings.draw.d._ens()) {
      if (currentRun != global.drawRun)
        throw 'cancel';

      const data = await dataFile.read();
      if (data._len() == 0)
        continue;

      (function($text, name) {
        $text.style.font = `${settings.text.font.size}px`;
        $text.style.fontFamily = settings.text.font.family;

        $text.style.fontWeight = settings.text.character.bold ? 'bold' : 'normal';
        $text.style.fontStyle = settings.text.character.italic ? 'italic' : 'normal';
        $text.style.textDecoration = settings.text.character.decoration;

        $text.style.outline = settings.text.character.outline ? '1px solid currentColor' : 'none';

        switch (settings.text.align) {
          case 'left': {
            $text.setAttr('text-anchor', 'start');
            $text.setAttr('x', `${(settings.padding.page.left + settings.padding.group.left) / w_svg * 100}%`);
            break;
          } default:
          case 'center': {
            $text.setAttr('text-anchor', 'middle');
            $text.setAttr('x', `${(settings.padding.page.left + settings.padding.group.left + w_svg -
              settings.padding.page.right - settings.padding.group.right) / w_svg * 50}%`);
            break;
          } case 'right': {
            $text.setAttr('text-anchor', 'end');
            $text.setAttr('x', `${(w_svg - settings.padding.page.right - settings.padding.group.right) / w_svg * 100}%`);
            break;
          }
        }

        $text.setAttr('y', `${y / h_svg * 100}%`);
        $text.setAttr('fill', settings.text.color);

        $text.innerText = name;
      })($svg.template('text'), global.groups[group_i].n);

      y += settings.padding.group.top;

      const range = settings.draw.r[group_i];
      const chunkLocs = await settings.draw.l[group_i].read();
      await new Promise(r_read => {
        if (currentRun != global.drawRun)
          throw 'cancel';

        Lines(chunkLocs, null, null, range.s, range.e, data._ks()).then(async gen => {
          if (currentRun != global.drawRun)
            throw 'cancel';

          gen = gen();
          let lines;
          while (lines != 'done') {
            if (currentRun != global.drawRun)
              throw 'cancel';

            await new Promise(
              r_gen => gen.next().then(({ value }) => {
                lines = value;
                r_gen();
              })
            );

            if (currentRun != global.drawRun)
              throw 'cancel';

            if (lines != 'done') {
              for (const { line, starts, ends, color } of lines) {
                {
                  const group = settings.draw.y[line];
                  if (typeof group != 'number')
                    switch (typeof group) {
                      case 'string': {
                        settings.draw.y[line] = settings.draw.g[group].y;
                        break;
                      } case 'object': {
                        settings.draw.g[group[1]].y = settings.draw.y[line] + y;
                        settings.draw.y[line] = group[0];
                        break;
                      }
                    }
                }

                const dy = (settings.draw.y[line] + y) / h_svg * settings.resolution;
                console.log(line)
                delete settings.draw.y[line];

                const drawLine = async function(s, e, option, c) {
                  const dx_1 = (s - min + settings.padding.page.left + settings.padding.group.left) / w_svg * settings.resolution;
                  const dx_2 = (e - min + settings.padding.page.left + settings.padding.group.left) / w_svg * settings.resolution;

                  const dh = Math.max(option.l.h / h_svg, dh_min) * settings.resolution;

                  const $path = $svg.template('path');
                  $path.setAttr('fill', settings.overrideGroupColors ? (c || option.c) : option.c);
                  $path.setAttr('d', `${DrawSvgLine(option, dx_1, dy, dx_2, dy + dh).join(' ')} Z`);

                  if (++count.rect >= 2500) { // copilot wants to try 10000 - not sure if this is a good idea - will try later
                    draw_i += count.rect;
                    CreateSvgImage.call($svg, h_svg, settings.resolution, imageMergeId);

                    count.rect = 0;
                    if (++count.image >= 20) { // copilot wants to try 100 and 1000 - not sure if this is a good idea - will try later
                      await Promise.all(imageMergePromise);

                      imageMergePromise = [ new Promise(r_merge => {
                        MergeSvgImages.call($svg, settings.resolution, r_merge, imageMergeId++);
                        $notif.innerText = `Drawing... (${(draw_i)} lines)`;
                      }) ];

                      count.image = 0;
                    }
                  }
                };

                starts.forEach((s, i) => {
                  const option = settings.draw.o[data[line]];
                  const e = ends[i];
                  console.log(s, e, option, color);

                  drawLine(s, e, option, color);
                });
              }

              lines = null;
            }
          }

          gen.return('done');
          gen = null;

          r_read();
        }).catch(err => { throw err; });
      }).catch(err => { throw err; });

      settings.draw.d[group_i].delete();
      delete settings.draw.d[group_i];

      settings.draw.l[group_i].delete();
      delete settings.draw.l[group_i];

      (delete settings.draw.r[group_i]), (delete settings.draw.o[group_i]);

      y += settings.padding.group.bottom;
    }
    await Promise.all(imageMergePromise);

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
      CreateSvgImage.call($svg, h_svg, settings.resolution);

    await new Promise(r_merge => MergeSvgImages.call($svg, settings.resolution, r_merge));

    $svg.qsa('image:not(.template)').forEach($image => $image.style.display = '');

    requestIdleCallback(() => r_paint('done'));
  }).then(v =>
    v == 'cancel' ? body.qsa('body > .content > .easel > svg.paper:not(.template)')?.memRmv() : $notif.innerText = 'Done!'
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

  page.paintDisk.wipe();
  page.paintDisk = undefined;
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
  const check = new RegExp(`[^${lines?.join('')}]( \\S+){1,} (\\S+\\n|\\S+$)`, 'g');
  return async function*() {
    const loopAmnt = multiFiles ? file.length : 1;
    for (let i = 0;i < loopAmnt;i++) {
      const chunks = multiFiles ? GetChunks(...file[i]) : GetChunks(file, type, strand);
      console.log(chunks)
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
                line => readFLS(line)
              ).filter(({ start, end }) =>
                ((s <= end && s >= start) ||
                (e >= start && e <= end) ||
                (s <= start && e >= end))
              );
            else
              obj = fullChunk.replace(check, '').split('\n').map(line => readFLS(line));

            console.log(check, fullChunk, obj)

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
function CreateSvgImage(h, res, mergeId) { // poor code quality - contains parts might not necessary - fix
  this.qsa('text:not(.template)').forEach( // scale text
    $text =>  $text.style.fontSize = `${+($text.style.fontSize.replace('px') || '') / h * res}px`
  );

  const url = SvgURL(this);

  const $image = this.template('image', false);
  $image.setAttrs('x', 'y', 0); // set image position
  $image.setAttrs('width', 'height', '100%'); // set image size
  $image.setAttr('href', url); // set image href
  $image.addClass(`merge_${mergeId}`); // add merge id to image

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
async function MergeSvgImages(res, r_merge, mergeId = -1) {
  const imageSelector = `image:not(.template)${mergeId == -1 ? '' : `.merge_${mergeId}`}`;

  const $paper = document.createElement('canvas');
  const pen = $paper.getContext('2d');

  ($paper.width = res), ($paper.height = res); // set canvas size

  await Promise.all(this.qsa(imageSelector).map(function($image) {
    const img = new Image(res, res);
    img.src = $image.getAttr('href');
    return new Promise(r_img => {
      img.onload = () => {
        pen.drawImage(img, 0, 0, res, res);

        img.memRmv();
        img.onload = undefined;

        r_img();
      };
    });
  }));

  $paper.toBlob(blob => {
    const blobUrl = (URL || webkitURL || window).createObjectURL(blob, { type: 'image/svg+xml;charset=utf-8' });

    const $image = this.template('image', false);
    $image.setAttrs('x', 'y', 0); // set image position
    $image.setAttrs('width', 'height', '100%'); // set image size
    $image.setAttr('href', blobUrl); // set image href
    $image.addClass(`merge_${mergeId + 1}`); // add merge id to image

    $image.onload = () => {
      this.qsa(imageSelector).forEach($ => { // remove images and revoke object urls
        URL.revokeObjectURL($.getAttr('href'));
        $.memRmv();
      });

      this.appendChild($image); // add image to svg

      $paper.memRmv();

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

    setTimeout(() => $svg?.memRmv(), parseTransition($svg).max());

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
  return JSON.stringify({ data: global.data.v_$map(types =>
    (types ?? {}).v_$map(strands =>
      (strands ?? {})._ks().sort()
    )
  ), groups: global.groups });
}

function UpdateSettingsTextPreview() {
  (function($textStyle) {
    const align = $textStyle.qs('.style.align > .content > .button.selected').classList.filter(v => v != 'button' && v != 'selected')[0];
    const charStyles = $textStyle.qsa('.style.character > .content > .button.selected').map($ =>
      $.classList.filter(v => v != 'button' && v != 'selected')[0]
    );
    const fontStyles = Object.fromEntries($textStyle.qsa('.style.font > .content > .option > input').map($ =>
      [ $.id.replace('settings_text_', ''), $.value ]
    ));

    fontStyles.family = CSS.supports('font-family', fontStyles.family) ? fontStyles.family : 'arial';

    (function($preview) {
      $preview.style.fontWeight = 'normal';
      $preview.style.fontStyle = 'normal';
      $preview.style.outline = 'none';
      $preview.style.textDecoration = 'none';

      $preview.gen(-1).style.textAlign = align;
      $preview.style.fontFamily = fontStyles.family;

      (function(color) {
        $preview.style.color = color;
        $preview.gen(-1).style.background = InverseColorArrayShade(
          [ ...parseColor(color).replace('#', '').match(/.{2}/g).map(v => parseInt(v, 16)), 255 ],
          'var(--shade_d-3)',
          'var(--shade_1-0)',
        );
      })(fontStyles.color);

      const textDecoration = [];
      charStyles.forEach(style => {
        switch (style) {
          case 'bold': {
            $preview.style.fontWeight = 'bold';
            break;
          } case 'italic': {
            $preview.style.fontStyle = 'italic';
            break;
          } case 'outline': {
            $preview.style.outline = '1px solid currentColor';
            break;
          } case 'underline': {
            textDecoration.push('underline');
            break;
          } case 'overline': {
            textDecoration.push('overline');
            break;
          } case 'strike': {
            textDecoration.push('line-through');
            break;
          }
        }
      });

      $preview.style.textDecoration = textDecoration.join(' ');
    })($textStyle.qs('.style.preview > span'));

    page.events.get.settings_background.input.call(body.qs('body > .settings > .background > input'));
  })(body.qs('body > .settings > .text_style > .content'));
}
setTimeout(UpdateSettingsTextPreview, 100);

function CreateFileName() {
  return `SeqR_${TimeString().replace(', ', '_')}`;
}