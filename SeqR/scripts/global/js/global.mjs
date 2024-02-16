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

export {
  doc,
  html,
  head,
  body,
  root,
  rootStyle,
  global,
  min,
  max,
  avg,
  vmin,
  vmax,
  vw,
  vh,
  cm,
  cm_x,
  cm_y,
  mm,
  mm_x,
  mm_y,
  in_,
  in_x,
  in_y,
  pt,
  pt_x,
  pt_y,
  pc,
  pc_x,
  pc_y,
  parseCSSPosition,
  bool,
  repeat,
  prandom,
  parseSeed,
  Prandom,
  PrandomGenerator,
  IsValidURL,
  parseColor,
  parseTransition,
  timedFetch,
  GetAttributesObject,
  ColorArrayToColor,
  PrandomColorArray,
  InverseColorArrayShade,
  TimeString,
  Download,
  DrawSvgLine,
  LooseUpdate,
  DeleteLooseUpdate,
  FixedUpdate,
  DeleteFixedUpdate,
  Events,
  Tooltip,
  Disk,
};

const doc = document;

const html = document.documentElement;
const body = document.body;
const head = document.head;

const root = document.querySelector(':root');
const rootStyle = getComputedStyle(root);

const update = {
  fixed: {},
  loose: {},
};

const global = {
  mouse_x: 0,
  mouse_y: 0,
  lineStyles: {
    bodies: {
      'solid': 'solid',
      'dashed': 'dashed',
      'short_dash': 'short_dash',
      'dotted': 'dotted',
      'double': 'double',
    },
    heads: {
      'none': 'none',
      'left': { l: 'out', r: 'in' },
      'right': { l: 'in', r: 'out' },
      'block_left': { l: 'block_out', r: 'block_in' },
      'block_right': { l: 'block_in', r: 'block_out' },
      'embedded_left': { l: 'embedded_out', r: 'embedded_in' },
      'embedded_right': { l: 'embedded_in', r: 'embedded_out' },
      'solid': 'solid',
      'dashed': 'dashed',
      'circle': 'circle',
      'dotted': 'dotted',
      'double': 'double',
    },
  },
  lineStylesDisplayKey: { // make it so we don't need this at some point - TEMPORARY
    bodies: {
      '0': 'Solid',
      'solid': 'Solid',
      '1': 'Dashed',
      'dashed': 'Dashed',
      '2': 'Ticked',
      'short_dash': 'Ticked',
      '3': 'Dotted',
      'dotted': 'Dotted',
      '4': 'Double',
      'double': 'Double',
    },
    heads: {
      '0': 'None',
      'none': 'None',
      '1': 'Arrow Out',
      'left': 'Arrow Out',
      '2': 'Arrow In',
      'right': 'Arrow In',
      '3': 'Block Out',
      'block_left': 'Block Out',
      '4': 'Block In',
      'block_right': 'Block In',
      '5': 'Point Out',
      'embedded_left': 'Point Out',
      '6': 'Point In',
      'embedded_right': 'Point In',
      '7': 'Solid',
      'solid': 'Solid',
      '8': 'Dashed',
      'dashed': 'Dashed',
      '9': 'Circle',
      'circle': 'Circle',
      '10': 'Dotted',
      'dotted': 'Dotted',
      '11': 'Double',
      'double': 'Double',
    },
  },
  settings: {
    linePreviewMargin: 'innerWidth / 100',
    linePreviewWidth: 'innerWidth / 5',
    readerCacheMax: 1000000,
    readerCacheMin: 500000,
    tips: {
      helpEnabled: true,
      help: {
        autoGroup: '<span style="font-size: 18px;">Automatically add every strand type sorted into their respective types</span>',
        cleanGroups: '<span style="font-size: 18px">Automatically remove all duplicate and empty groups.<span style="font-size: 16px"><br><br>Group names and line styles are <b style="color: #c83333;">NOT</b> accounted for when checking duplicates!</span></span>',
        groupTitle: 'Rename group',
        groupFormat: 'Group line options',
        groupRemove: 'Remove group',
        groupAddData: 'Add data',
        groupData: 'Line options',
        groupDataCopy: 'Copy style',
        groupDataPaste: 'Paste style',
      },
      error: {
        groupAddData: '<span style="font-size: 20px;color: red">Please load a file before adding data!</span>',
      },
    },
  },
  draw: {
    range: {
      min: undefined,
      max: undefined,
    },
    text: { // add position modifier
      align: undefined,
      character: {
        bold: undefined,
        italic: undefined,
        outline: undefined,
        decoration: undefined,
      },
      font: {
        size: undefined,
        family: undefined,
      },
      color: undefined,
    },
    padding: {
      page: {
        top: undefined,
        right: undefined,
        bottom: undefined,
        left: undefined,
      },
      group: {
        top: undefined,
        right: undefined,
        bottom: undefined,
        left: undefined,
      },
    },
    background: undefined,
  },
  data: {
    /* 'temp_file1.gff': {
      temp_type: {
        '+a': [],
      },
    },
    'temp_file2.gff': {
      temp_type: {
        '-a': [],
      },
    },
    'temp_file3.gff': {
      temp_type: {
        '=a': [],
      },
    },
    'temp_file4.gff': {
      temp_type: {
        '.a': [],
      },
    },
    'temp_file5.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file6.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file7.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file8.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file9.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file10.gff': {
      temp_type: {
        temp_type: [],
      },
    },
    'temp_file11.gff': {
      temp_type: {
        temp_type: [],
      },
    }, */
  },
  groups: [
  /* FORMAT:
    {
      n: '', // name
      $: HTMLDivElement, // outer group element
      d: [ // data
        {
          f: '', // file
          t: '', // type
          s: '', // strand
        }
      ],
      o: [ // draw options
        {
          c: [], // color
          l: { // line
            h: '', // line height
            b: '', // line body
            l: '', // line left head
            r: '', // line right head
          },
        },
      ],
    }
  */
  ],
  extensions: {
    gff: {},
  },
  colors: {
    cache: {
      /*
        [type]: {
          [strand]: [ColorArray]
        }
      */
    },
    taken: [
      [ 255, 0, 0, 255] ,
      [ 0, 255, 0, 255 ],
      [ 0, 0, 255, 255 ],
    ],
  },
  drawReject: undefined,
  drawRun: 0,
  dataRange: [ Infinity, -Infinity ],
  clipboard: {
    type: undefined,
    data: undefined,
  },
  prandom: {
    seed: 0x2F6E2B1,
    seedMod: 0xFFFFFF2F,
    seedMult: 0x10003,
    iMod: 0xFFFFFFA7F,
    iMult: 0x10001,
    generator: undefined,
    color_i: 0,
  },
  update: {
    tick: {
      fixed: 0,
      loose: 0,
    },
    pause: {
      fixed: false,
      loose: false,
    }
  },
  disk: null,
  pagePromises: [],
  dpi: {
    x: 96,
    y: 96,
  },
};
global.prandom.generator = PrandomGenerator(global.prandom.seed);

Object.defineProperty(URL, 'newObjectURL', {
  enumerable: false,
  value: function(...args) {
    const url = URL.createObjectURL(...args);
    sessionStorage.setItem('objectUrls', (sessionStorage.getItem('objectUrls') ?? '').split(',').concat(url));

    return url;
  },
});

Object.defineProperty(URL, 'deleteObjectURL', {
  enumerable: false,
  value: function(url, ...args) {
    URL.revokeObjectURL(url, ...args);
    sessionStorage.setItem('objectUrls', (sessionStorage.getItem('objectUrls') ?? '').split(',').filter(u => u != url));
  },
});

async function LoadInsertedDocuments() {
  let loadedDocs = {};
  async function loadDoc(src) {
    if (loadedDocs[src])
      return await new Promise(r => // stop glitchy loading
        requestAnimationFrame(() =>
          r(loadedDocs[src])
        )
      );

    return await fetch(src).then(r =>
      r.text()
    ).then(t =>
      loadedDocs[src] = t.replace(/<!--[\s\S]*?-->/g, '')
    );
  }

  console.time('LoadInsertedDocuments');
  let $inserts;
  while (($inserts = document.qsa('insert')).length)
    for (const $ of $inserts.array())
      switch ($.getAttr('type')) {
        case 'text/html': {
          await loadDoc($.getAttr('src')).then(t => {
            const $div = document.createElement('div');
            $div.innerHTML = t;
            $div.childNodes.forEach($child => $.parentNode.prependChild($child, $));

            $.memRmv();
            $div.memRmv();
          });
          break;
        } case 'text/plain': {
          await loadDoc($.getAttr('src')).then(t => {
            $.parentNode.prependChild(document.createTextNode(t), $);
            $.memRmv();
          });
          break;
        } case 'dictionary/html': {
          await loadDoc($.getAttr('src')).then(t => {
            const $div = document.createElement('div');
            $div.innerHTML = t;

            const obj = Object.fromEntries($div.childNodes.filter($ =>
              $.tagName == 'ENTRY'
            ).map($ =>
              [ $.qs('key:last-of-type').innerText, $.qs('value:last-of-type').innerHTML ]
            ));

            $.getAttr('key').split(',').forEach(k => {
              const $div = document.createElement('div');
              $div.innerHTML = obj[k];

              $div.childNodes.forEach($child => $.parentNode.prependChild($child, $));
              $div.memRmv();
            });

            $.memRmv();
            $div.memRmv();
          });
          break;
        } case 'dictionary/plain': {
          await loadDoc($.getAttr('src')).then(t => {
            const $div = document.createElement('div');
            $div.innerHTML = t;

            const obj = Object.fromEntries($div.childNodes.filter($ =>
              $.tagName == 'ENTRY'
            ).map($ =>
              [ $.qs('key:last-of-type').innerText, $.qs('value:last-of-type').innerText ]
            ));

            $.getAttr('key').split(',').forEach(k =>
              $.parentNode.prependChild(document.createTextNode(obj[k]), $)
            );

            $.memRmv();
            $div.memRmv();
          });
          break;
        }
      }

  loadDoc = null;
  console.timeEnd('LoadInsertedDocuments');
}

async function RemoveObjectUrls() {
  sessionStorage.removeItem('objectUrls');
}

async function GetDPI() {
  const { dpi_x, dpi_y } = await new Promise(r =>
    requestAnimationFrame(() =>
      r(body.appendChild('div').setCSS({
        width: '1in',
        height: '1in',
        position: 'absolute',
        top: '-100%',
        left: '-100%',
      }))
    )
  ).then($div => {
    const dpi_x = $div.offsetWidth;
    const dpi_y = $div.offsetHeight;

    $div.memRmv();

    return { dpi_x, dpi_y };
  });

  global.dpi.x = dpi_x;
  global.dpi.y = dpi_y;
}

requestAnimationFrame(() => {
  global.pagePromises.push(RemoveObjectUrls());
  global.pagePromises.push(LoadInsertedDocuments());
  global.pagePromises.push(GetDPI());
});

Object.defineProperty(global.extensions.gff, 'evalEscChars', {
  enumerable: false,
  writable: false,
  value: function(str, group) {
    /**
     * Object containing escape characters and their corresponding values.
     * @type {Object<string, string>}
     */
    let escChars = {
      '%25': '%',
      '%7F': String.fromCharCode(127),
      ...Object.fromEntries(Array.from({ length: 32 }, (_, i) => {
        const hex = i.toString(16);
        return [`%${hex.length == 1 ? `0${hex}` : hex}`, String.fromCharCode(i)];
      })),
    };

    if (group)
      escChars = {
        '%3B': ';',
        '%3D': '=',
        '%26': '&',
        '%2C': ',',
        ...escChars,
      };

    return escChars._reduce((str, [ encode, decode ]) =>
      str.replace(new RegExp(encode, 'gi'), decode), str
    );
  },
});

addEventListener('mousemove', e => {
  global.mouse_x = e.pageX;
  global.mouse_y = e.pageY;
});

function min(...paras) {
  return Math.min(...paras);
}

function max(...paras) {
  return Math.max(...paras);
}

function avg(...paras) {
  return Math.avg(...paras);
}

function vmin(mod = 1) {
  return min(innerWidth, innerHeight) / 100 * mod;
}

function vmax(mod = 1) {
  return max(innerWidth, innerHeight) / 100 * mod;
}

function vw(mod = 1) {
  return innerWidth / 100 * mod;
}

function vh(mod = 1) {
  return innerHeight / 100 * mod;
}

function cm(mod = 1) {
  return mod * (global.dpi.x + global.dpi.y) / 1.27;
}

function cm_x(mod = 1) {
  return mod * global.dpi.x / 2.54;
}

function cm_y(mod = 1) {
  return mod * global.dpi.y / 2.54;
}

function mm(mod = 1) {
  return mod * (global.dpi.x + global.dpi.y) / 12.7;
}

function mm_x(mod = 1) {
  return mod * global.dpi.x / 25.4;
}

function mm_y(mod = 1) {
  return mod * global.dpi.y / 25.4;
}

function in_(mod = 1) {
  return mod * (global.dpi.x + global.dpi.y) / 2;
}

function in_x(mod = 1) {
  return mod * global.dpi.x;
}

function in_y(mod = 1) {
  return mod * global.dpi.y;
}

function pt(mod = 1) {
  return mod * (global.dpi.x + global.dpi.y) / 72;
}

function pt_x(mod = 1) {
  return mod * global.dpi.x / 72;
}

function pt_y(mod = 1) {
  return mod * global.dpi.y / 72;
}

function pc(mod = 1) {
  return mod * (global.dpi.x + global.dpi.y) / 6;
}

function pc_x(mod = 1) {
  return mod * global.dpi.x / 6;
}

function pc_y(mod = 1) {
  return mod * global.dpi.y / 6;
}

function parseCSSPosition(pos, $ = html, dir = 'x') {
  if (pos.endsWith('px'))
    return +pos.slice(0, -2);
  else if (pos.endsWith('%'))
    return ($ instanceof Window ?
      (dir == 'x' ? $.innerWidth : $.innerHeight) :
      (dir == 'x' ? $.clientWidth : $.clientHeight)) * +pos.slice(0, -1) / 100;
  else if (pos.endsWith('vw'))
    return vw(+pos.slice(0, -2));
  else if (pos.endsWith('vh'))
    return vh(+pos.slice(0, -2));
  else if (pos.endsWith('vmin'))
    return vmin(+pos.slice(0, -4));
  else if (pos.endsWith('vmax'))
    return vmax(+pos.slice(0, -4));
  else if (pos.endsWith('rem'))
    return +doc.getCS('font-size').replace('px', '') * +pos.slice(0, -3);
  else if (pos.endsWith('em'))
    return +doc.getCS('font-size').replace('px', '') * +pos.slice(0, -2);
  else if (pos.endsWith('ex'))
    return '0'.ex($ instanceof Window ? html : $) * +pos.slice(0, -2);
  else if (pos.endsWith('ch'))
    return '0'.width(doc.getCS('font')) * +pos.slice(0, -2);
  else if (pos.endsWith('mm'))
    return dir == 'x' ?
      mm_x(+pos.slice(0, -2)) :
      mm_y(+pos.slice(0, -2));
  else if (pos.endsWith('cm'))
    return dir == 'x' ?
      cm_x(+pos.slice(0, -2)) :
      cm_y(+pos.slice(0, -2));
  else if (pos.endsWith('in'))
    return dir == 'x' ?
      in_x(+pos.slice(0, -2)) :
      in_y(+pos.slice(0, -2));
  else if (pos.endsWith('pt'))
    return dir == 'x' ?
      pt_x(+pos.slice(0, -2)) :
      pt_y(+pos.slice(0, -2));
  else if (pos.endsWith('pc'))
    return dir == 'x' ?
      pc_x(+pos.slice(0, -2)) :
      pc_y(+pos.slice(0, -2));
  else
    throw new Error(`Invalid position: ${pos}`);
}

function bool(v) {
  return Boolean(v);
}

function repeat(v, n) {
  return Array.from({ length: n }, () => v);
}

function prandom() {
  return global.prandom.generator.next().value;
}

function parseSeed(seed) {
  if (Number.isNaN(+seed)) {
    seed = parseInt(seed, 36) % 200000000 - 100000000;
    if (Number.isNaN(seed))
      seed = 0;
  } else
    seed = +seed % 100000000;

  return seed;
}

function Prandom(seed = global.prandom.seed, i) {
  const prandom = ((
    seed * global.prandom.seedMult % global.prandom.seedMod + // seed factor
    i * global.prandom.iMult % global.prandom.iMod // index factor
  ) << i % 4.7) % 10e+5;
  const prandomSign = prandom >> 31;

  return ((prandom ^ prandomSign) - prandomSign) / 10e+5;
}

function* PrandomGenerator(seed = global.prandom.seed) {
  const factor_seed = seed * global.prandom.seedMult % global.prandom.seedMod;
  for (let i = 0, factor_i = 0; true; factor_i = i * global.prandom.iMult % global.prandom.iMod) {
    const prandom = (factor_seed + factor_i << i++ % 4.7) % 10e+5;
    const prandomSign = prandom >> 31;

    yield ((prandom ^ prandomSign) - prandomSign) / 10e+5;
  }
}

function IsValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

function parseColor(color) {
  const pen = document.createElement('canvas').getContext('2d');
  pen.fillStyle = color;
  color = pen.fillStyle;

  pen.canvas.memRmv();

  return color;
}

function parseTransition($) {
  return getComputedStyle($).transitionDuration.split(/,\s/).map(v =>
    +new Function(`return ${v.replace(/ms/g, '').replace(/s/g, '* 1000')};`)()
  );
}

function timedFetch(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    ),
  ]);
}

/**
 * Converts a string of attributes into an object.
 *
 * @param {string} attrs - The string of attributes.
 * @returns {Object} - The attributes object.
 */
function GetAttributesObject(attrs) {
  const obj = {};
  const attrsObj = attrs.split(';').map(kv => {
    let [ k, v ] = kv.split(/=([\s\S]*)/);
    return [ [ k ], v ];
  });

  let len = attrsObj.length;
  for (let i = 0; i < len; i++) {
    let [ path, v ] = attrsObj[i];
    if ((path.includes('Dbxref') || path.includes('Ontologyterm')) && path.length < 3) {
      switch (path.length) {
        case 1: {
          v.split(',').forEach((kv, i) => {
            if (kv.includes(':')) {
              const [ k, v ] = kv.split(/:([\s\S]*)/);
				      attrsObj[len++] = [ path.concat(`=${i}`), `database_tag:${k},id:${v}` ];
            } else
              attrsObj[len++] = [ path.concat(`=${i}`), v ];
		    	});

          break;
        } case 2: {
          if (!v.includes(','))
            path.reduce((lastPath, newPath, i) =>
              lastPath[newPath] ??= i == path.length - 1 ? global.extensions.gff.evalEscapeChars(v, true) : {},
            obj);
          else
            v.split(',').forEach(kv => {
              const [ k, v ] = kv.split(/:([\s\S]*)/);
				      attrsObj[len++] = [ path.concat(k), v ];
		    	  });

          break;
        };
      }
    } else if (v.includes(','))
			attrsObj[len++] = [ path, v.split(',') ];
		else if (v instanceof Array)
      path.reduce((lastPath, newPath, i) =>
        lastPath[newPath] ??= i == path.length ?
          v.map(v => global.extensions.gff.evalEscapeChars(v, true)) :
          {},
      obj);
		else
			path.reduce((lastPath, newPath, i) =>
        lastPath[newPath] ??= i == path.length ? global.extensions.gff.evalEscapeChars(v, true) : {},
      obj);
  }

  return obj;
}

/**
 * Converts a color array to an RGB color string.
 * @param {number[]} colorArr - The color array to convert.
 * @param {boolean} shaded - Flag indicating whether to apply shading.
 * @param {boolean} inverseColor - Flag indicating whether to invert the color.
 * @param {boolean} inverseShade - Flag indicating whether to invert the shade.
 * @returns {string} The RGB color string.
 */
function ColorArrayToColor(color, shaded, inverse) {
  const shade = color[3];
  return `rgba(${color.slice(0, 3).map(v =>
    v.clamp(0, 255) * (shaded ? shade.clamp(0, 255) / 255 : 1) ^ (inverse ? 255 : 0)
  ).join(', ')})`
}

/**
 * Generates a pseudo random color array.
 * @returns {number[]} The generated color array.
 */
function PrandomColorArray(seed = global.prandom.seed, i = global.prandom.color_i++) {
  const color = [ 0, 0, 0, 255 ];
  const color_1 = Prandom(seed, i) * 3 | 0;
  const color_2 = ((color_1 + Prandom(seed, i) * 2 | 0) + 1) % 3;

  color[color_1] = [ 128, 192, 255 ].prandom(seed, i);
  color[color_2] = prandom(seed, i) * 256 | 0;

  return color;
}

/**
 * Calculates the inverse color shade based on the given array of colors.
 *
 * @param {Array} colors - The array of colors.
 * @returns {string} - The inverse color shade.
 */
function InverseColorArrayShade(
  color,
  color_1 = 'linear-gradient(45deg, var(--shade_c-0), var(--shade_e-0))',
  color_2 = 'linear-gradient(45deg, var(--shade_3-0), var(--shade_1-0))'
) {
  return ColorArrayToColor(color, true).replace(/[^0-9,]/g, '').split(',').map(v => +v).max() < 128 ? color_1 : color_2;
}

/**
 * Returns a formatted string representing the given time.
 * If no time is provided, the current time is used.
 *
 * @param {number} [time=Date.now()] - The time to format.
 * @returns {string} The formatted time string (DD-MMM-YYYY, HH:mm:ss).
 */
function TimeString(time = Date.now()) {
  const date = new Date(time);
  return `${date.getDate().toString().toLength(2, 0)}-${
    [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][date.getMonth()]
  }-${date.getFullYear()}, ${date.getHours().toString().toLength(2, 0)}:${date.getMinutes().toString().toLength(2, 0)}:${date.getSeconds().toString().toLength(2, 0)}`;
}

/**
 * Downloads a file from the specified URL.
 *
 * @param {string} url - The URL of the file to download.
 * @param {string} extension - The file extension.
 * @param {string} fileName - The name of the downloaded file.
 * @param {Function} resolve - Optional callback function to be called after the download is complete.
 */
function Download(url, extension, fileName, resolve) {
  fileName ??= url;

  if (extension) {
    const img = new Image(2048, 2048);

    img.src = url;
    return img.onload = () => {
      const $paper = document.createElement('canvas');
      $paper.width = img.width;
      $paper.height = img.height;

      const pen = $paper.getContext('2d');
      pen.drawImage(img, 0, 0, 2048, 2048);

      const file = $paper.toDataURL(extension);

      const $a = document.createElement('a');
      $a.href = file;
      $a.download = fileName ?? url;

      $a.click();

      $a.memRmv();

      if (resolve)
        requestIdleCallback(resolve);
    };
  } else {
    const $a = document.createElement('a');
    $a.href = url;
    $a.download = fileName ?? url;

    $a.click();

    $a.memRmv();
  }

  if (resolve)
    requestIdleCallback(resolve);
}

function DrawSvgLine(style, x_1, y_1, x_2, y_2, limit) {
  const format = (k, styles) => (v =>
    (([ v, cmd ]) =>
      cmd instanceof Object ? [ v, cmd[k] ] : [ v, cmd ]
    )(typeof v == 'string' ? [ v, global.lineStyles[styles][v] ] : global.lineStyles[styles]._en(v))
  )(style.l[k] || 0);

  const [ body, cmd_b ] = format('b', 'bodies');
  const [ left, cmd_l ] = format('l', 'heads');
  const [ right, cmd_r ] = format('r', 'heads');

  const w = x_2 - x_1;
  const h = y_2 - y_1;

  /**
   * Draws a body with the specified dimensions and style.
   *
   * @param {number} x - The x-coordinate of the body's top-left corner.
   * @param {number} y - The y-coordinate of the body's top-left corner.
   * @param {number} w - The width of the body.
   * @param {number} h - The height of the body.
   */
  const Body = function(x, y, w, h) {
    const points = (function(style) {
      switch (style) {
        default:
        case 'solid':
          return [
            'M', x, y,
            'L', x + w, y,
            'L', x + w, y + h,
            'L', x, y + h,
          ];
        case 'dashed': {
          let points = [];

          let left = (h * 4 - w % (h * 4)) / 2;
          for (let x_i = h - left; x_i < w; x_i += h * 4) {
            const x_1 = (x_i).clamp(0);
            const x_w = (x_i + h * 2).clamp(0, w) - x_1;
            points = points.concat([
              'M', x_1 + x, y,
              'h', x_w,
              'v', h ,
              'h', -x_w
            ]);
          }

          return points;
        } case 'short_dash': {
          let points = [];

          let left = (h * 2 - w % (h * 2)) / 2;
          for (let x_i = h / 2 - left; x_i < w; x_i += h * 2) {
            const x_1 = (x_i).clamp(0);
            const x_w = (x_i + h).clamp(0, w) - x_1;
            points = points.concat([
              'M', x_1 + x, y,
              'h', x_w,
              'v', h,
              'h', -x_w
            ]);
          }

          return points;
        } case 'dotted': { // rewrite
          let points = [];

          let left = (h * 2 - w % (h * 2)) / 2;
          for (let x_i = h / 2 - left; x_i < w; x_i += h * 2) {
            const x_1 = (x_i).clamp(0);
            const x_w = (x_i + h).clamp(0, w) - x_1;
            points = points.concat([
              'M', x_1 + x, y + h / 2,
              'Q', x_1 + x, y, x_1 + x_w / 2 + x, y,
              'Q', x_1 + x_w + x, y, x_1 + x_w + x, y + h / 2,
              'Q', x_1 + x_w + x, y + h, x_1 + x_w / 2 + x, y + h,
              'Q', x_1 + x, y + h, x_1 + x, y + h / 2
            ]);
          }

          return points;
        } case 'double':
          return [
            'M', x, y,
            'L', x + w, y,
            'L', x + w, y + h / 3,
            'L', x, y + h / 3,
            'M', x, y + h * 2/3,
            'L', x + w, y + h * 2/3,
            'L', x + w, y + h,
            'L', x, y + h,
          ];
      }
    })(this);

    return points;
  };

  /**
   * Represents a Head object.
   * @param {number} x - The x-coordinate of the Head.
   * @param {number} y - The y-coordinate of the Head.
   * @param {number} h - The height of the Head.
   * @param {boolean} [invert=false] - Whether to invert the Head.
   * @returns {Array<Array<string|number>>} - The points of the Head.
   */
  const Head = function(x, y, h, invert = false) {
    const w = invert ? -h : h;

    const m = (x_1, y_1) => [ 'M', x_1 * w + x, y_1 * h + y ];
    const l = (x_1, y_1) => [ 'L', x_1 * w + x, y_1 * h + y];
    const f = (x_1, y_1, x_2, y_2) => {
      if (invert) {
        const temp = x_1;
        x_1 = x_2;
        x_2 = temp;
      }

      return [
        'M', x_1 * w + x, y_1 * h + y,
        'L', x_2 * w + x, y_2 * h + y,
        'L', x_2 * w + x, y_2 * h + y,
        'L', x_1 * w + x, y_1 * h + y,
      ]
    };
    const q = (x_1, y_1, x_2, y_2) => {
      return [
        'Q', x_1 * w + x, y_1 * h + y, x_2 * w + x, y_2 * h + y,
      ]
    };

    const points = (function(style) {
      switch (style) {
        case 'none':
          return [];
        case 'in':
          return invert ? [
            'M', x, y,
            'L', x + w * 3/4, y + h / 2,
            'L', x, y + h,

            'L', x, y + h * 3/2,
            'L', x + w * 3/2, y + h / 2,
            'L', x, y - h / 2,
          ] : [
            'M', x, y - h / 2,
            'L', x + w * 3/2, y + h / 2,
            'L', x, y + h * 3/2,

            'L', x, y + h,
            'L', x + w * 3/4, y + h / 2,
            'L', x, y,
          ];
        case 'out':
          return invert ? [
            'M', x + w * 3/2, y - h / 2,
            'L', x, y + h / 2,
            'L', x + w * 3/2, y + h * 3/2,

            'L', x + w * 3/2, y + h,
            'L', x + w * 3/4, y + h / 2,
            'L', x + w * 3/2, y,
          ] : [
            'M', x + w * 3/2, y,
            'L', x + w * 3/4, y + h / 2,
            'L', x + w * 3/2, y + h,

            'L', x + w * 3/2, y + h * 3/2,
            'L', x, y + h / 2,
            'L', x + w * 3/2, y - h / 2,
          ];
        case 'block_in':
          return invert ? [
            'M', x, y + h * 3/2,
            'L', x + w * 3/2, y + h / 2,
            'L', x, y - h / 2,
          ] : [
            'M', x, y - h / 2,
            'L', x + w * 3/2, y + h / 2,
            'L', x, y + h * 3/2,
          ];
        case 'block_out':
          return [
            'M', x + w * 3/2, y - h / 2,
            'L', x, y + h / 2,
            'L', x + w * 3/2, y + h * 3/2,
          ];
        case 'embedded_in':
          return [
            'M', x, y,
            'L', x + w, y,
            'L', x + w, y + h,
            'L', x, y + h,
            'L', x + w / 2, y + h / 2,
          ];
        case 'embedded_out':
          return [
            'M', x + w, y,
            'L', x + w, y + h,
            'L', x, y + h / 2,
          ];
        case 'solid':
          return invert ? [ // might not need this
            'M', x + w / 2, y - h * 2/3,
            'L', x, y - h * 2/3,
            'L', x, y + h * 5/3,
            'L', x + w / 2, y + h * 5/3,
          ] : [
            'M', x, y - h * 2/3,
            'L', x + w / 2, y - h * 2/3,
            'L', x + w / 2, y + h * 5/3,
            'L', x, y + h * 5/3,
          ];
        case 'dashed':
          return invert ? [ // might not need this
            'M', x + w * 2/3, y - h * 2/3,
            'L', x + w * 2/3, y,
            'L', x, y,
            'L', x, y - h * 2/3,

            'M', x + w * 2/3, y + h,
            'L', x + w * 2/3, y + h * 5/3,
            'L', x, y + h * 5/3,
            'L', x, y + h,
          ] : [
            'M', x, y - h * 2/3,
            'L', x, y,
            'L', x + w * 2/3, y,
            'L', x + w * 2/3, y - h * 2/3,

            'M', x, y + h,
            'L', x, y + h * 5/3,
            'L', x + w * 2/3, y + h * 5/3,
            'L', x + w * 2/3, y + h,
          ];
        case 'circle':
          return invert ? [
            'M', x - w / 3, y + h / 2,
            'Q', x - w / 3, y + h * 4/3, x + w / 2, y + h * 4/3,
            'Q', x + w * 4/3, y + h * 4/3, x + w * 4/3, y + h / 2,
            'Q', x + w * 4/3, y - h / 3, x + w / 2, y - h / 3,
            'Q', x - w / 3, y - h / 3, x - w / 3, y + h / 2,
          ] : [
            'M', x + w / 2, y - h / 3,
            'Q', x + w * 4/3, y - h / 3, x + w * 4/3, y + h / 2,
            'Q', x + w * 4/3, y + h * 4/3, x + w / 2, y + h * 4/3,
            'Q', x - w / 3, y + h * 4/3, x - w / 3, y + h / 2,
            'Q', x - w / 3, y - h / 3, x + w / 2, y - h / 3,
          ];
        case 'dotted':
          return [
            'M', x, y - h / 3,
            'Q', x, y, x + w / 3, y,
            'Q', x + w * 2/3, y, x + w * 2/3, y - h / 3,
            'Q', x + w * 2/3, y - h * 2/3, x + w / 3, y - h * 2/3,
            'Q', x, y - h * 2/3, x, y - h / 3,

            'M', x, y + h * 4/3,
            'Q', x, y + h, x + w / 3, y + h,
            'Q', x + w * 2/3, y + h, x + w * 2/3, y + h * 4/3,
            'Q', x + w * 2/3, y + h * 5/3, x + w / 3, y + h * 5/3,
            'Q', x, y + h * 5/3, x, y + h * 4/3,
          ];
        case 'double':
          return invert ? [
            'M', x + w / 3, y - h * 2/3,
            'L', x + w / 3, y + h * 5/3,
            'L', x, y + h * 5/3,
            'L', x, y - h * 2/3,

            'M', x + w, y - h * 2/3,
            'L', x + w, y + h * 5/3,
            'L', x + w * 2/3, y + h * 5/3,
            'L', x + w * 2/3, y - h * 2/3,
          ] : [
            'M', x, y - h * 2/3,
            'L', x, y + h * 5/3,
            'L', x + w / 3, y + h * 5/3,
            'L', x + w / 3, y - h * 2/3,

            'M', x + w * 2/3, y - h * 2/3,
            'L', x + w * 2/3, y + h * 5/3,
            'L', x + w, y + h * 5/3,
            'L', x + w, y - h * 2/3,
          ];
      };
    })(this);

    return points;
  };

  switch (limit) {
    case 'body':
      return Body.call(cmd_b, x_1, y_1, w, h);
    case 'head': {
      const data = {
        none: { single: true, center: 0 },
        in: { single: false, center: -h / 4 },
        out: { single: false, center: -h / 4 },
        block_in: { single: false, center: -h / 4 },
        block_out: { single: false, center: -h / 4 },
        embedded_in: { single: false, center: 0 },
        embedded_out: { single: false, center: 0 },
        solid: { single: true, center: h / 4 },
        dashed: { single: true, center: h / 6 },
        circle: { single: true, center: 0 },
        dotted: { single: true, center: h / 6 },
        double: { single: true, center: 0 },
      };

      const center = {
        none: 0,
        in: -h / 4,
        out: -h / 4,
        block_in: -h / 4,
        block_out: -h / 4,
        embedded_in: 0,
        embedded_out: 0,
        solid: h / 4,
        dashed: h / 6,
        circle: 0,
        dotted: h / 6,
        double: 0,
      };

      return data[cmd_l].single || data[cmd_r].single ?
        Head.call(cmd_l, x_1 + center[cmd_l], y_1, h) :
        [
          ...Head.call(cmd_l, x_1 + center[cmd_l] - h - 2, y_1, h),
          'Z',
          ...Head.call(cmd_r, x_1 - center[cmd_r] + h * 2 - 2, y_1, h, true),
          'Z',
        ];
    }
  };

  if (w < h * 3)
    return Body.call(cmd_b, x_1, y_1, w, h);

  let s_body = x_1;
  let e_body = x_2;

  const bodyChanges = {
    none: 0,
    in: { default: h * 3/4, dashed: h * 3/2, short_dash: h * 3/2, dotted: h * 3/2 },
    out: { default: h * 3/2, double: h * 3/4 },
    block_in: h / 4,
    block_out: h * 3/2,
    embedded_in: h,
    embedded_out: h,
    solid: h / 2 - 1,
    dashed: h * 2/3,
    circle: h,
    dotted: h * 2/3,
    double: h,
  };

  bodyChanges._forEach(([ k, v ]) => {
    v = typeof v == 'number' ? v : v[cmd_b] ?? v.default;
    if (cmd_l == k)
      s_body += v;
    if (cmd_r == k)
      e_body -= v;
  });

  let points = Body.call(cmd_b, s_body, y_1, e_body - s_body, h);
  if (cmd_l != 'none')
    points = points.concat(Head.call(cmd_l, x_1, y_1, h));
  if (cmd_r != 'none')
    points = points.concat(Head.call(cmd_r, x_2, y_1, h, true));

  return points;
}

function LooseUpdate(fn, time = 1, scope) {
  let i = -1;
  while (update.loose[++i])
    continue;

  update.loose[i] = { fn, scope, time };

  return i;
}
function DeleteLooseUpdate(id) {
  delete update.loose[id];
}
function looseUpdate() {
  global.update.tick.loose++;
  if (!global.update.pause.loose)
    try {
      update.loose.v_forEach(({ fn, scope, time }) =>
        global.update.tick.loose % time ? void 0 : (scope === undefined ? fn() : fn.call(scope))
      );
    } catch (err) { console.error(err); }

  requestIdleCallback(looseUpdate);
}
requestIdleCallback(looseUpdate);

function FixedUpdate(fn, time = 1, scope) {
  let i = -1;
  while (update.fixed[++i])
    continue;

  update.fixed[i] = { fn, scope, time };

  return i;
}
function DeleteFixedUpdate(id) {
  delete update.fixed[id];
}
function fixedUpdate() {
  global.update.tick.fixed++;
  if (!global.update.pause.fixed)
    try {
      update.fixed.v_forEach(({ fn, scope, time }) =>
        global.update.tick.fixed % time ? void 0 : (scope === undefined ? fn() : fn.call(scope))
      );
    } catch (err) { console.error(err); }

  requestAnimationFrame(fixedUpdate);
}
requestAnimationFrame(fixedUpdate);

LooseUpdate(function() {
  body.qsa('canvas.line_preview').forEach($paper => {
    const target = $paper.getAttribute('target');
    if (!target)
      return $paper.memRmv();

    $paper.style.top = `${body.getById(target)?.rect()?.y}px`;
  });
});

FixedUpdate(function() {
  body.qsa('.auto_scroll').forEach(function($) {
    if ($.preDecAttr('scroll-wait-ticks') > 0 || $.scrollWidth <= $.clientWidth || document.activeElement == $) //prefix because it's decremented before the check
      return;

    let l = $[`${Dir_1}`];
    const speed = +$.nullSetAttr('scroll-speed', 1) + +$.nullSetAttr('scroll-round', 0);
    $.setAttr('scroll-round', speed % 1);

    $.scrollBy(+$.nullSetAttr('scroll-direction', 1) * speed | 0, 0);
    if (l == $[`${Dir_1}`]) {
      $.setAttr('scroll-direction', -$.getAttr('scroll-direction'));
      $.setAttr('scroll-wait-ticks', $.nullSetAttr('scroll-wait', 1) * 30);
    }
  });
});

LooseUpdate(function() {
  html.qsa('span[href]').forEach(span => {
    span.style.cursor = 'pointer';
    span.onclick = function() {
      window.open(this.getAttribute('href'), this.getAttribute('target'));
    }
  });
});

FixedUpdate(function() {
  html.qsa('[hash].false_hidden:not([false-hidden])').forEach($ =>
    $.setAttr('false-hidden', true)
  );

  html.qsa('[hash][false-hidden]:not(.false_hidden)').forEach($ =>
    $.rmvAttr('false-hidden')
  );

  const hash = html.qsa('[hash]:not(.hidden, .false_hidden)').map($ => {
    let id = $.getAttr('hash') || $.id;
    if (!id)
      for (let i = 0; i < 100000 && (!id || html.getById(id) instanceof Element); i++)
        id = `hash_${prandom() * 100000 << 0}`;

    $.setAttribute('hash', id)

    return id;
  }).join(',');

  try {
    location.hash = hash ?? ''
  } catch (err) {};
}, 5);

addEventListener('hashchange', function(ev) {
  const hashes = ev.newURL.replace(location.origin + location.pathname, '').replace('#', '').split(',');
  html.qsa('[hash]').forEach($ =>
    $.classList[hashes.includes($.getAttribute('hash')) ? 'remove' : 'add']($.getAttr('false-hidden') ? 'false_hidden' : 'hidden')
  );
});

class Events {
  #events;
  #sentEvents;

  #relatedElements = new Set();
  #memCheckUpdate = LooseUpdate(function() { // remove elements that have been removed from the DOM
    this.#relatedElements.forEach($ => {
      if ($.getAttr?.('memory-removed'))
        this.#relatedElements.delete($);
    });
  }, 30, this);
  constructor(events) {
    this.#sentEvents = events;

    let check = true;
    try {
      for (let i = 0; i < 100000 && check; i++) {
        check = false;
        events = events?.v_$map($v => {
          let thisLevels = [ events ];
          if (typeof $v == 'string') {
            check = true;

            const thisLevel = thisLevels[($v.match(/^_*(?=this)/) ?? [])[0]?.length];
            const obj = thisLevel === undefined ? undefined : Function('obj', `return ${$v.replace(/^_*this/, 'obj')}`)(thisLevel);

            return obj == $v ? undefined : obj;
          } else
            return $v?._$map(([ k_ev, v_ev ]) => {
              thisLevels = [ $v, events ];
              if (v_ev instanceof Function)
                v_ev = [ v_ev ];

              if (typeof v_ev == 'string') {
                check = true;

                const thisLevel = thisLevels[(v_ev.match(/^_*(?=this)/) ?? [])[0]?.length];
                const obj = thisLevel === undefined ? undefined : Function('obj', `return ${v_ev.replace(/^_*this/, 'obj')}`)(thisLevel);

                return [ k_ev, obj == v_ev ? undefined : obj ];
              } else
                return [ k_ev, v_ev?.map(fnObj => {
                  thisLevels = [ v_ev, $v, events ];
                  if (fnObj instanceof Function)
                    fnObj = [ fnObj, {} ];

                  if (typeof fnObj == 'string') {
                    check = true;

                    const thisLevel = thisLevels[(fnObj.match(/^_*(?=this)/) ?? [])[0]?.length];
                    const obj = thisLevel === undefined ? undefined : Function('obj', `return ${fnObj.replace(/^_*this/, 'obj')};`)(thisLevel);

                    return obj == fnObj ? undefined : obj;
                  } else
                    return fnObj?.filter((_, i) => i < 2)?.map(v_fn => {
                      thisLevels = [ fnObj, v_ev, $v, events ];
                      if (typeof v_fn == 'string') {
                        check = true;

                        const thisLevel = thisLevels[(v_fn.match(/^_*(?=this)/) ?? [])[0]?.length];
                        const obj = thisLevel === undefined ? undefined : Function('obj', `return ${v_fn.replace(/^_*this/, 'obj')};`)(thisLevel);

                        return obj == v_fn ? undefined : obj;
                      } else
                        return v_fn;
                    }).concat(fnObj.length == 1 ? [ {}, k_ev ] : [ k_ev ]) ?? undefined;
                }) ?? undefined ];
            }) ?? undefined;
        }) ?? undefined;
      }

      if (check)
        throw `(In constructor of Events) Ran out of check iterations. ${events}`;
    } catch (er) {
      events = {};
      console.error(er);
    }

    this.#events = events;
  }

  /**
   * Adds event listeners to the specified elements.
   *
   * @param {Element|string|Object} $s - The element(s) or selector(s) to add event listeners to.
   * @param {...string|Array|Object} events - The event(s) to listen for.
   * @returns {Element|Array} - The element(s) with the event listeners added.
   */
  addWithScope($s, ...events) {
    const scope = events?.pop();
    $s = [ $s ].flat(Infinity).filter(
      $ => $ !== null && $ !== undefined
    ).map($ => {
      if ($ instanceof Element || $ === window)
        return $;
      else if (typeof $ == 'string')
        return html.qsa($).array();
      else if ($ instanceof Object) {
        const $parent = $.parent instanceof Element ? $.parent : document;
        if ($.class)
          return $parent.getByClass($.class).array();
        else if ($.tag)
          $ = $parent.getByTag($.tag).array();
        else if ($.id)
          $ = $parent.getById($.id);
        else
          $ = parent.children.array();
      }
    }).flat(Infinity).filter($ =>
      $ instanceof Element || $ === window
    );

    if (!$s.length)
      return [];

    try {
      events = events.flat(Infinity).map(ev =>
        Function('events', `return events.${ev};`)(this.#events)
      );
    } catch (er) {
      events = undefined;
      console.error(er);
    }

    if (!events)
      return $s.length == 1 ? $s[0] : $s;

    let check = true;
    for (let i = 0; i < 100000 && check; i++) {
      check = false;
      let tempEvents = [];
      events.forEach(ev => {
        if (ev == null || ev == undefined)
          return;

        if (ev[0] instanceof Function)
          tempEvents.push(ev);
        else if (ev instanceof Object) { /* Array or Object */
          check = true;
          tempEvents = tempEvents.concat(ev._vs());
        }
      });

      events = tempEvents;
    }

    $s.forEach($ => {
      events.forEach(([ fn, options, ev ]) => {
        if (fn instanceof Function) {
          switch (ev) {
            case 'disableclick': {
              if ($ instanceof Element)
                $.setAttr('disableclick', fnObj[0]);

              break;
            } default: {
              $.addEventListener(ev, fn, options);
              break;
            };
          }
        }
      });

      this.#relatedElements.add($);
    });

    return $s.length == 1 ? $s[0] : $s;
  }
  add($s, ...events) {
    return this.addWithScope($s, ...events, undefined);
  }

  remove($s, ...events) {
    $s = [ $s ].flat(Infinity).filter(
      $ => $ !== null && $ !== undefined
    ).map($ => {
      if ($ instanceof Element || $ === window)
        return $;
      else if (typeof $ == 'string')
        return html.qsa($).array();
      else if ($ instanceof Object) {
        const $parent = $.parent instanceof Element ? $.parent : document;
        if ($.class)
          return $parent.getByClass($.class).array();
        else if ($.tag)
          $ = $parent.getByTag($.tag).array();
        else if ($.id)
          $ = $parent.getById($.id);
        else
          $ = parent.children.array();
      }
    }).flat(Infinity).filter($ =>
      $ instanceof Element || $ === window
    );

    if (!$s.length)
      return [];

    try {
      events = events.flat(Infinity).map(ev =>
        Function('events', `return events.${ev};`)(this.#events)
      );
    } catch (er) {
      events = undefined;
      console.error(er);
    }

    let check = true;
    for (let i = 0; i < 100000 && check; i++) {
      check = false;
      let tempEvents = [];
      events.forEach(ev => {
        if (ev == null || ev == undefined)
          return;

        if (ev[0] instanceof Function)
          tempEvents.push(ev);
        else if (ev instanceof Object) { /* Array or Object */
          check = true;
          tempEvents = tempEvents.concat(ev._vs());
        }
      });

      events = tempEvents;
    }

    $s.forEach($ => {
      events.forEach(([ fn, options, ev ]) => {
        if (fn instanceof Function) {
          switch (ev) {
            case 'disableclick': {
              if ($ instanceof Element)
                $.rmvAttr('disableclick');

              break;
            } default: {
              $.removeEventListener(ev, fn, options);
              break;
            };
          }
        }
      });
    });

    return $s.length == 1 ? $s[0] : $s;
  }
  removeEvents(...events) {
    events = events.flat(Infinity).map(ev =>
      Function('events', `return events.${ev};`)(this.#events)
    );

    let check = true;
    for (let i = 0; i < 100000 && check; i++) {
      check = false;
      let tempEvents = [];
      events.forEach(ev => {
        if (ev == null || ev == undefined)
          return;

        if (ev[0] instanceof Function)
          tempEvents.push(ev);
        else if (ev instanceof Object) { /* Array or Object */
          check = true;
          tempEvents = tempEvents.concat(ev._vs());
        }
      });

      events = tempEvents;
    }

    const relatedElements = this.#relatedElements;
    relatedElements.forEach($ => {
      events.forEach(([ fn, options, ev ]) => {
        if (fn instanceof Function) {
          switch (ev) {
            case 'disableclick': {
              if ($ instanceof Element)
                $.rmvAttr('disableclick');

              break;
            } default: {
              $.removeEventListener(ev, fn, options);
              break;
            };
          }
        }
      });
    });

    return relatedElements;
  }
  removeAll(...$s) {
    $s = $s.flat(Infinity).filter(
      $ => $ !== null && $ !== undefined
    ).map($ => {
      if ($ instanceof Element || $ === window)
        return $;
      else if (typeof $ == 'string')
        return html.qsa($).array();
      else if ($ instanceof Object) {
        const $parent = $.parent instanceof Element ? $.parent : document;
        if ($.class)
          return $parent.getByClass($.class).array();
        else if ($.tag)
          $ = $parent.getByTag($.tag).array();
        else if ($.id)
          $ = $parent.getById($.id);
        else
          $ = parent.children.array();
      }
    }).flat(Infinity).filter($ =>
      $ instanceof Element || $ === window
    );

    if (!$s.length)
      return [];

    const events = this.getFlat;
    $s.forEach($ => {
      events.forEach(([ fn, options, ev ]) => {
        if (fn instanceof Function) {
          switch (ev) {
            case 'disableclick': {
              if ($ instanceof Element)
                $.rmvAttr('disableclick');

              break;
            } default: {
              $.removeEventListener(ev, fn, options);
              break;
            };
          }
        }
      });

      this.#relatedElements.delete($);
    });


    return $s.length == 1 ? $s[0] : $s;
  }

  get get() {
    return this.#sentEvents;
  }
  get getFormatted() {
    return this.#events;
  }
  get getFlat() {
    return this.#events.v_reduce((arr, v) => arr.concat(v.v_flat()), []);
  }

  deconstruct() {
    this.removeAll(...this.#relatedElements);

    this.#events = undefined;
    this.#sentEvents = undefined;

    this.#relatedElements?.clear?.();
    this.#relatedElements = undefined;

    DeleteLooseUpdate(this.#memCheckUpdate);
    this.#memCheckUpdate = undefined;
  }
}

class Tooltip {
  #canceled = false;

  #$tooltip;

  #origin = { x: 'center', y: 'center' };
  #offset = { x: 0, y: 0 };

  #$anchor;
  #anchorPoints = { x: 'center', y: 'center' };

  #follow;

  #looseUpdates = [];
  #fixedUpdates = [];
  #intervals = [];

  #events = {
    tooltip: new Events({}),
    anchor: new Events({}),

    tooltipDeconstructors: new Events({}),
    anchorDeconstructors: new Events({}),
  };

  #memoryCheckUpdate = LooseUpdate(function() {
    if (this.$tooltip?.getAttr?.('memory-removed'))
      this.deconstruct?.();
    else if (this.anchor?.getAttr?.('memory-removed'))
      this.anchor = html;
  }, 30, this);

  constructor($tooltip = 'div', $anchor, text, addFunc = Element.prototype.appendChild) {
    this.#$tooltip = $tooltip instanceof Element ? $tooltip : document.createElementByQs($tooltip);
    this.#$anchor = $anchor instanceof Element ? $anchor : (function() {
      try {
        return document.createElementByQs($anchor);
      } catch (er) {
        return window;
      }
    })();

    this.#$tooltip.style.position = 'fixed';
    this.#$tooltip.setAttr('tooltip', true);
    this.#$tooltip.textContent = text;

    (addFunc instanceof Function ? addFunc : Element.prototype.appendChild).call(
      this.#$anchor instanceof Element ? this.#$anchor : body,
      this.#$tooltip,
      this
    );

    this.update = this.update.bind(this);
    this.update();
  }
  get $tooltip() {
    return this.#$tooltip;
  }

  setOrigin(x = this.#origin.x, y = this.#origin.y) {
    this.#origin = { x, y };
    return this.update();
  }
  setOriginX(x) {
    return this.setOrigin(x, this.#origin.y);
  }
  setOriginY(y) {
    return this.setOrigin(this.#origin.x, y);
  }
  get origin() {
    return this.#origin;
  }

  setOffset(x = this.#offset.x, y = this.#offset.y) {
    this.#offset = { x, y };
    return this.update();
  }
  setOffsetX(x) {
    return this.setOffset(x, this.#offset.y);
  }
  setOffsetY(y) {
    return this.setOffset(this.#offset.x, y);
  }
  get offset() {
    return this.#offset;
  }

  anchorTo(x = this.#anchorPoints.x, y = this.#anchorPoints.y, $anchor = this.#$anchor) {
    if (!($anchor instanceof Window || $anchor instanceof Node))
      throw new TypeError('The anchor must be a Window or Node.');

    const newAnchor = bool($anchor === this.#$anchor);
    this.#$anchor = $anchor;
    this.#anchorPoints = { x, y };

    if (newAnchor)
      this.setAnchorEvents(this.anchorEvents).setAnchorDeconstructors(this.anchorDeconstructors);

    return this.update();
  }
  anchorToX(x) {
    return this.anchorTo(x, this.#anchorPoints.y);
  }
  anchorToY(y) {
    return this.anchorTo(this.#anchorPoints.x, y);
  }
  setAnchor($anchor) {
    this.anchorTo(...this.#anchorPoints._vs(), $anchor);
    return $anchor;
  }
  set anchor($anchor) {
    return this.anchor = $anchor;
  }
  get anchor() {
    return this.#$anchor;
  }
  get anchorPoints() {
    return { ...this.#anchorPoints };
  }

  #updateEvents(type) {
    switch (type) {
      case 'tooltip':
      case 'tooltipDeconstructors': {
        this.#events[type].addWithScope(this.#$tooltip, 'events', this);
        break;
      } case 'anchor':
      case 'anchorDeconstructors': {
        this.#events[type].addWithScope(this.#$anchor, 'events', this);
        break;
      }
    }

    return this;
  }
  #addEvents(type, events) {
    const eventsObj = new Events({ events });
    events = eventsObj.getFormatted.v_$map(v =>
      v.v_$map(v =>
        v.map(v => [ v[0].bind(this), v[1], v[2] ])
      )
    );

    events = Object.deepMerge(this.#events[type].getFormatted, events);
    eventsObj.deconstruct();

    this.#events[type].deconstruct();
    this.#events[type] = new Events(events);

    return this.#updateEvents(type);
  }
  #setEvents(type, events) {
    const eventsObj = new Events({ events });
    events = eventsObj.getFormatted.v_$map(v =>
      v.v_$map(v =>
        v.map(v => [ v[0].bind(this), v[1], v[2] ])
      )
    );

    this.#events[type].deconstruct();
    this.#events[type] = new Events(events);

    eventsObj.deconstruct();

    return this.#updateEvents(type);
  }
  #removeEvents(type, ...events) {
    this.#events[type].removeEvents(...events.map(ev => `events.${ev}`));

    return this.#updateEvents(type);
  }

  addTooltipEvents(events) {
    return this.#addEvents('tooltip', events);
  }
  setTooltipEvents(events = this.#events.tooltip.get) {
    return this.#setEvents('tooltip', events);
  }
  removeTooltipEvents(...events) {
    return this.#removeEvents('tooltip', ...events);
  }
  get tooltipEvents() {
    return this.#events.tooltip.getFormatted.events;
  }
  get sentTooltipEvents() {
    return this.#events.tooltip.get.events;
  }

  addTooltipDeconstructors(events) {
    return this.#addEvents('tooltipDeconstructors', events);
  }
  setTooltipDeconstructors(events = this.#events.tooltipDeconstructors.get) {
    return this.#setEvents('tooltipDeconstructors', events);
  }
  removeTooltipDeconstructors(...events) {
    return this.#removeEvents('tooltipDeconstructors', ...events);
  }
  get tooltipDeconstructors() {
    return this.#events.tooltipDeconstructors.getFormatted.events;
  }
  get sentTooltipDeconstructors() {
    return this.#events.tooltipDeconstructors.get.events;
  }

  addAnchorEvents(events) {
    return this.#addEvents('anchor', events);
  }
  setAnchorEvents(events = this.#events.anchor.get) {
    return this.#setEvents('anchor', events);
  }
  removeAnchorEvents(...events) {
    return this.#removeEvents('anchor', ...events);
  }
  get anchorEvents() {
    return this.#events.anchor.getFormatted.events;
  }
  get sentAnchorEvents() {
    return this.#events.anchor.get.events;
  }

  addAnchorDeconstructors(events) {
    return this.#addEvents('anchorDeconstructors', events);
  }
  setAnchorDeconstructors(events = this.#events.anchorDeconstructors.get) {
    return this.#setEvents('anchorDeconstructors', events);
  }
  removeAnchorDeconstructors(...events) {
    return this.#removeEvents('anchorDeconstructors', ...events);
  }
  get anchorDeconstructors() {
    return this.#events.anchorDeconstructors.getFormatted.events;
  }
  get sentAnchorDeconstructors() {
    return this.#events.anchorDeconstructors.get.events;
  }

  addLooseUpdate(fn, time, scope = this) {
    const id = LooseUpdate(fn, time, scope);
    this.#looseUpdates.push(id);
    return id;
  }
  removeLooseUpdate(id) {
    DeleteLooseUpdate(id);
    this.#looseUpdates = this.#looseUpdates.filter(i => i != id);
  }
  get looseUpdates() {
    return { ...update.loose }._$filter(([ k ]) => this.#looseUpdates.contains(k))._reduce((obj, [ k, { fn, scope, time } ]) =>
      (obj[k] = { 'function': fn, scope, time }) && obj,
    {});
  }

  addFixedUpdate(fn, time, scope = this) {
    const id = FixedUpdate(fn, time, scope);
    this.#fixedUpdates.push(id);
    return id;
  }
  removeFixedUpdate(id) {
    DeleteFixedUpdate(id);
    this.#fixedUpdates = this.#fixedUpdates.filter(i => i != id);
  }
  get fixedUpdates() {
    return { ...update.fixed }._$filter(([ k ]) => this.#fixedUpdates.contains(k))._reduce((obj, [ k, { fn, scope, time } ]) =>
      (obj[k] = { 'function': fn, scope, time }) && obj,
    {});
  }

  addInterval(fn, time, scope = this) {
    const id = setInterval(fn.bind(scope), time);
    this.#intervals.push({ id: id, fn, scope, time });
    return id;
  }
  removeInterval(id) {
    clearInterval(id);
    this.#intervals = this.#intervals.filter(v => v.id != id);
  }
  get intervals() {
    return this.#intervals._reduce((obj, { id, fn, scope, time }) =>
      (obj[id] = { 'function': fn, scope, time }) && obj,
    {});
  }

  update() {
    if (this.#canceled)
      return this;

    function getAnchorPoint($anchor, { x, y }) {
      let parsePoint = function(v, dir) {
        const [ dir_1, Dir_1, dir_2, Dir_2, dir_scale, Dir_scale ] = dir == 'x' ?
          [ 'left', 'Left', 'right', 'Right', 'width', 'Width' ] :
          [ 'top', 'Top', 'bottom', 'Bottom', 'height', 'Height' ];

        if (typeof v == 'string')
          v = v.replace(new RegExp(`-${dir_scale}`), `-${dir_2}`);

        if ($anchor instanceof Window)
          switch (v) {
            case dir_1:
            case `outer-${dir_1}`:
            case `inner-${dir_1}`:
            case `scrollbar-${dir_1}`:
            case `content-${dir_1}`:
              return 0;
            case 'center':
            case `inner-center`:
            case `scrollbar-center`:
            case `content-center`:
              return window[`inner${Dir_scale}`] / 2;
            case `outer-center`:
              return window[`outer${Dir_scale}`] / 2;
            case dir_2:
            case `inner-${dir_2}`:
            case `scrollbar-${dir_2}`:
            case `content-${dir_2}`:
              return window[`inner${Dir_scale}`];
            case `outer-${dir_2}`:
              return window[`outer${Dir_scale}`];
            default: {
              if (typeof v == 'string')
                return parseCSSPosition(v, window, dir);
              else if (typeof v == 'number')
                return v;
              else if (v instanceof Function)
                return v.call(window);
              else
                throw new TypeError('The anchor point must be a CSS position, number, or function.');
            }
          }
        else if ($anchor instanceof Node) {
          const center = (v_1, v_2) => (v_1 + v_2) / 2;
          const rect = $anchor.rect();
          switch (v) {
            case dir_1:
            case `outer-${dir_1}`:
              return $anchor[`outer${Dir_1}`]();
            case `inner-${dir_1}`:
              return $anchor[`inner${Dir_1}`]();
            case `scrollbar-${dir_1}`:
              return $anchor[`scrollbar${Dir_1}`]();
            case `content-${dir_1}`:
              return $anchor[`content${Dir_1}`]();
            case 'center':
            case `outer-center`:
              return center($anchor[`outer${Dir_1}`](), $anchor[`outer${Dir_2}`]());
            case `inner-center`:
              return center($anchor[`inner${Dir_1}`](), $anchor[`inner${Dir_2}`]());
            case `scrollbar-center`:
              return rect[dir_1] + (rect[dir_scale] - this[`scrollbar${Dir_scale}`]) / 2;
            case `content-center`:
              return center($anchor[`content${Dir_1}`](), $anchor[`content${Dir_2}`]());
            case dir_2:
            case `outer-${dir_2}`:
              return $anchor[`outer${Dir_2}`]();
            case `inner-${dir_2}`:
              return $anchor[`inner${Dir_2}`]();
            case `scrollbar-${dir_2}`:
              return $anchor[`scrollbar${Dir_2}`]();
            case `content-${dir_2}`:
              return $anchor[`content${Dir_2}`]();
            default: {
              if (typeof v == 'string')
                return parseCSSPosition(v, $anchor, dir) - rect[dir_1];
              else if (typeof v == 'number')
                return v;
              else if (v instanceof Function)
                return v.call($anchor);
              else
                throw new TypeError('The anchor point must be a CSS position, number, or function.');
            }
          }
        }
      };

      const obj = { x: parsePoint(x, 'x'), y: parsePoint(y, 'y') };
      parsePoint = null;

      return obj;
    };

    const originPoint = getAnchorPoint(this.#$tooltip, this.#origin);
    const offsetPoint = getAnchorPoint(html, this.#offset);
    (offsetPoint.x += this.#$tooltip.rect().x), (offsetPoint.y += this.#$tooltip.rect().y);

    const anchorPoint = getAnchorPoint(this.#$anchor, this.#anchorPoints);

    this.#$tooltip.style.position = 'fixed';
    this.#$tooltip.style.left = `${anchorPoint.x - originPoint.x + offsetPoint.x}px`;
    this.#$tooltip.style.top = `${anchorPoint.y - originPoint.y + offsetPoint.y}px`;

    return this;
  }
  follow(v) {
    if (v === undefined)
      return bool(this.#follow);

    if (v && this.#follow === undefined)
      this.#follow = FixedUpdate(this.update);
    else if (!v && this.#follow !== undefined) {
      DeleteFixedUpdate(this.#follow);
      this.#follow = undefined;
    }


    return this;
  }

  deconstruct() {
    this.#canceled = true;

    this.#origin = undefined;

    this.#$anchor = undefined;
    this.#anchorPoints = undefined;

    this.#follow = undefined;

    DeleteLooseUpdate(this.#memoryCheckUpdate);

    this.#looseUpdates.forEach(id => DeleteLooseUpdate(id));
    this.#looseUpdates = undefined;
    this.#fixedUpdates.forEach(id => DeleteFixedUpdate(id));
    this.#fixedUpdates = undefined;
    this.#intervals.forEach(({ id }) => clearInterval(id));
    this.#intervals = undefined;

    this.#events.tooltip.deconstruct();
    this.#events.anchor.deconstruct();

    this.#events.tooltipDeconstructors.deconstruct();
    this.#events.anchorDeconstructors.deconstruct();

    this.#events = undefined;

    this.#$tooltip.memRmv();
    this.#$tooltip = undefined;
  }
  get canceled() {
    return this.#canceled;
  }
}

setTimeout(() => {
  const $tt = new Tooltip('div.tooltip', body).setOrigin('center', 'center').anchorTo('center', 'center').addAnchorEvents({
    mouseup: function(ev) {
      this.follow(true);
      this.$tooltip.rmvAttr('mousedown');
    },
    mousemove: function(ev) {
      if (this.$tooltip.getAttr('mousedown')) {
        this.$tooltip.style.left = `${ev.clientX - +this.$tooltip.getAttr('offsetX')}px`;
        this.$tooltip.style.top = `${ev.clientY - +this.$tooltip.getAttr('offsetY')}px`;
      }
    },
  }).addTooltipEvents({
    mousedown: [
      function(ev) {
        if (ev.button == 1)
          this.setOrigin(ev.pageX - this.origin.x, ev.pageY - this.origin.y).anchorTo(ev.pageX, ev.pageY) && tt2.update();
      },
      function(ev) {
        this.follow(false);
        this.$tooltip.setAttr('mousedown', true);
        this.$tooltip.setAttr('offsetX', ev.offsetX);
        this.$tooltip.setAttr('offsetY', ev.offsetY);
      },
    ],
  }).follow(true).$tooltip;
  const tt2 = new Tooltip('div.tooltip', $tt, 'tooltip', $ => body.appendChild($)).setOriginY('top').setOffsetY('1vmin').anchorToY('bottom');

  $tt.style.width = '10vw';
  $tt.style.height = '10vh';
  $tt.style.backgroundColor = 'red';

  requestAnimationFrame(tt2.update)
}, 400);

class TooltipOld {
  #created;

  #type;
  #tooltip;

  #text;

  #x;
  #y;

  #anchor_x;
  #anchor_y;

  #delay;

  #destroyFuncs;

  #update;
  #updateInterval = {};

  #eventsCtrl;

  /**
   * Creates a new tooltip object.
   * @param {string} [type='text'] - The type of the tooltip.
   * @param {string} [text='tooltip'] - The text content of the tooltip.
   * @param {number} x - The x-coordinate of the tooltip.
   * @param {number} y - The y-coordinate of the tooltip.
   * @param {string} [anchor_x='left'] - The horizontal anchor point of the tooltip.
   * @param {string} [anchor_y='top'] - The vertical anchor point of the tooltip.
   * @param {number} [delay=0] - The delay before showing the tooltip.
   * @param {object} [destroyFuncs={ time: { max: 1000 } }] - The destruction functions for the tooltip.
   * @param {string} [id] - The ID of the tooltip element.
   * @param {string|string[]} [classes] - The CSS classes to apply to the tooltip element.
   */
  constructor(
    type = 'text',
    text = 'tooltip',
    x, y,
    anchor_x = 'left', anchor_y = 'top',
    delay = 0,
    destroyFuncs = { time: { max: 1000 } },
    id, classes,
    update,
    animate = true
  ) {
    this.#created = false;
    this.#type = type;

    const tooltip = document.createElement('tooltip');
    if (id)
      tooltip.id = id;

    if (typeof classes == 'string')
      classes = [ classes ];
    if (classes instanceof Array)
      tooltip.classList.add(...classes);

    tooltip.classList.add('tooltip');
    tooltip.innerHTML = this.#text = text;

    this.#tooltip = tooltip;

    this.#x = x;
    this.#y = y;

    this.#anchor_x = anchor_x;
    this.#anchor_y = anchor_y;

    this.#delay = delay;
    if (animate)
      tooltip.style.animation = `fadeIn 250ms linear ${delay}ms 1 normal forwards`;
    else
      tooltip.style.opacity = 1;

    this.#destroyFuncs = destroyFuncs;

    this.#update = update;
  }
  get tooltip() {
    return this.#tooltip;
  }
  set text(text) {
    this.#tooltip.innerHTML = this.#text = text;
  }
  get text() {
    return this.#text;
  }
  set x(x) {
    this.#x = x;
  }
  get x() {
    return this.#x;
  }
  set y(x) {
    this.#y = y;
  }
  get y() {
    return this.#y;
  }
  set anchor_x(x) {
    this.#anchor_x = anchor_x;
  }
  get anchor_x() {
    return this.#anchor_x;
  }
  set anchor_y(y) {
    this.#anchor_y = anchor_y;
  }
  get anchor_y() {
    return this.#anchor_y;
  }
  set delay(delay) {
    this.#delay = delay;
    if (!this.#created)
      this.#tooltip.style.animation = `fadeIn 250ms linear ${delay}ms 1 normal forwards`;
  }
  get delay() {
    return this.#delay;
  }
  set destroyFunctions(destroyFuncs) {
    this.#destroyFuncs = destroyFuncs;
  }
  get destroyFunctions() {
    return this.#destroyFuncs;
  }
  set id(id) {
    if (id && this.#tooltip)
      this.#tooltip.id = id;
    else if (this.#tooltip)
      delete this.#tooltip.id;
  }
  get id() {
    return this.#tooltip?.id;
  }
  set classes(classes) {
    const tooltip = this.#tooltip;
    if (!tooltip || !tooltip.classList)
      return;

    tooltip.classList.forEach(thisClass => tooltip.classList.remove(thisClass));

    if (typeof classes === 'string')
      classes = [classes];
    if (classes instanceof Array)
      classes.forEach(thisClass => tooltip.classList.add(thisClass));
  }
  get classes() {
    return this.#tooltip?.classList.values;
  }
  get update() {
    return this.#update;
  }
  set update(update) {
    update = update;

    this.#update = update;
    if (this.#updateInterval.type == 'loose')
      DeleteLooseUpdate(this.#updateInterval.id);
    else if (this.#updateInterval.type == 'fixed')
      DeleteFixedUpdate(this.#updateInterval.id);
    else if (this.#updateInterval.type == 'interval')
      clearInterval(this.#updateInterval.interval);

    if (update == 'fixed')
      this.#updateInterval = { id: FixedUpdate(this.update), type: 'fixed' };
    else if (update == 'loose')
      this.#updateInterval = { id: LooseUpdate(this.update), type: 'loose' };
    else if (typeof update == 'number')
      this.#updateInterval = { interval: setInterval(this.update, update), type: 'interval' };
  }
  create() {
    const tooltip = this.#tooltip;
    if (!tooltip || (this.#type == 'help' && global.settings.tips.helpEnabled))
      return this.destroy();

    if (this.#created)
      return;

    this.#created = true;

    if (!(this.#destroyFuncs instanceof Object))
      this.#destroyFuncs = {};

    this.#destroyFuncs.time ??= { min: 0 };
    const { leave, out, click, time } = this.#destroyFuncs;

    let minTime = +time.min;
    minTime = Number.isFinite(minTime) ? minTime : 0;

    const thisClass = this;
    const startTime = Date.now();

    const crtl = this.#eventsCtrl = new AbortController();

    if (leave instanceof Element)
      leave.addEventListener('mouseleave', () => setTimeout(thisClass.destroy, minTime - (Date.now() - startTime)), { signal: crtl.signal });
    if (out instanceof Element)
      out.addEventListener('mouseout', function(e) {
        if (out.childOf(e.relatedTarget, true))
          setTimeout(thisClass.destroy, minTime - (Date.now() - startTime)), { signal: crtl.signal }
      });
    if (click instanceof Element)
      click.addEventListener('click', () => setTimeout(thisClass.destroy, minTime - (Date.now() - startTime)), { signal: crtl.signal });
    if (time.max)
      setTimeout(() => this.destroy(), Math.max(Number.isFinite(+time.max) ? +time.max : 0, minTime));

    body.appendChild(tooltip);

    const mouseMoveEvent = new Event('mousemove', { bubbles: true });
    addEventListener('mousemove', this.update, { capture: true, signal: crtl.signal });
    dispatchEvent(mouseMoveEvent);

    this.update({ clientX: global.mouse_x, clientY: global.mouse_y });

    if (this.#update == 'fixed')
      this.#updateInterval = { id: FixedUpdate(this.update), type: 'fixed' };
    else if (this.#update == 'loose')
      this.#updateInterval = { id: LooseUpdate(this.update), type: 'loose' };
    else if (typeof this.#update == 'number')
      this.#updateInterval = { interval: setInterval(this.update, this.#update), type: 'interval' };

    return tooltip;
  }
  destroy = (animate = true) => {
    const tooltip = this.#tooltip;
    if (!tooltip) {
      this.#eventsCtrl?.abort();
      return;
    }

    const opacity = getComputedStyle(tooltip).getPropertyValue('opacity');

    tooltip.style.opacity = opacity;
    if (opacity == 0)
      tooltip.memRmv();

    if (animate) {
      tooltip.style.animation = `fadeOut 250ms linear ${-250 * (1 - opacity) << 0}ms 1 normal forwards`;
      tooltip.onanimationend = tooltip.memRmv;
    } else
      tooltip.memRmv();

    if (this.#updateInterval.type == 'loose')
      DeleteLooseUpdate(this.#updateInterval.id);
    else if (this.#updateInterval.type == 'fixed')
      DeleteFixedUpdate(this.#updateInterval.id);
    else if (this.#updateInterval.type == 'interval')
      clearInterval(this.#updateInterval.interval);

    this.#eventsCtrl?.abort();
  }
  update = e => {
    const tooltip = this.#tooltip;
    if (!tooltip || (this.#type == 'help' && !global.settings.tips.helpEnabled))
      return this.destroy();

    const { w, h } = tooltip.rect();
    let x = this.#x ?? e.clientX;
    let y = this.#y ?? e.clientY;

    const anchor_x = this.#anchor_x;
    const anchor_y = this.#anchor_y;

    switch (anchor_x) {
      default:
      case 'left':
        break;
      case 'center':
        x -= w / 2;
        break;
      case 'right':
        x -= w;
        break;
    }

    switch (anchor_y) {
      case 'top':
        break;
      case 'center':
        y -= h / 2;
        break;
      default:
      case 'bottom':
        y -= h;
        break;
    }

    x = x.clamp(0, innerWidth - w);;
    y = y.clamp(0, innerHeight - h);

    tooltip[`${Dir_1}`] = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
}

function EvalKeyPath(kPath) {
  try {
    const regex = /(\w+)|\['([^']+?)'\]|\["([^"]+?)"\]|\[`([^`]+?)`\]/g;
    let match;

    const path = [];
    while ((match = regex.exec(kPath)) !== null)
      void (function([ v, i ]) {
        const char = { 1: "'", 2: "'", 3: '"', 4: '`' }[i];

        path.push(new Function(`return ${char}${v}${char};`)());
      })(match.map((v, i) => i && bool(v) ? [ v, i ] : null).filter(v => v !== null)[0]);

    return path;
  } catch (err) {
    return console.error(err);
  }
}

class VFile {
  #disk;

  #file;
  #name;
  #extension;
  constructor(disk, file) {
    const [ name, extension ] = (function(file) {
      if (file.length == 1)
        return [ file, 'txt' ];

      const extension = file.pop();
      return [ file.join('.'), extension ];
    })(file.split('.'));

    this.#disk = disk;

    this.#file = file;
    this.#name = name;
    this.#extension = extension;
  }

  get disk() {
    return this.#disk;
  }

  get file() {
    return this.#file;
  }
  get name() {
    return this.#name;
  }
  get extension() {
    return this.#extension;
  }

  async delete() {
    this.#disk.delete(this.#file);
  }
};

class VTextFile extends VFile {
  #url;
  constructor(disk, file) {
    super(disk, file);

    this.#url = URL.newObjectURL(new Blob([ '' ], { type: 'text/plain' })).replace('blob:', '');
  }

  get type() {
    return 'text/plain';
  }

  get url() {
    return `blob:${this.#url}`;
  }

  async read() {
    return await fetch(`blob:${this.#url}`, { cache: 'no-store' }).then(async function(response) {
      let content = '';

      const decoder = new TextDecoder();
      await (await response.blob()).stream().pipeTo(new WritableStream({
        write: chunk => content += decoder.decode(chunk)
      }));

      return content;
    });
  }

  async readAll() {
    return await this.read().then(content => content.split('\n'));
  }

  async readLine(line) {
    if (line % 1 != 0)
      throw `Line ${line} is not a valid line number!`;

    return (await this.readAll())[line];
  }

  async readLines(...lines) {
    if (lines.some(line => line % 1 != 0))
      throw `Some lines are not valid line numbers!`;

    return (await this.readAll()).filter((_, i) => lines.includes(i));
  }

  async readRange(start, end) {
    if (start % 1 != 0 || end % 1 != 0)
      throw `Some lines are not valid line numbers!`;

    return (await this.readAll()).slice(start, end + 1);
  }

  async readRanges(...ranges) {
    if (ranges.some(([ start, end ]) => start % 1 != 0 || end % 1 != 0))
      throw `Some lines are not valid line numbers!`;

    return (content =>
      ranges.map(([ start, end ]) => content.slice(start, end + 1))
    )(await this.readAll());
  }

  async readRangesFlat(...ranges) {
    if (ranges.some(([ start, end ]) => start % 1 != 0 || end % 1 != 0))
      throw `Some lines are not valid line numbers!`;

    return (await this.readAll()).filter((_, i) =>
      ranges.some(([ start, end ]) => i >= start && i <= end)
    );
  }

  #write = async function(handler) {
    const file = this;
    return await this.readAll().then(function(content) {
      URL.deleteObjectURL(`blob:${file.#url}`);

      file.#url = URL.newObjectURL(new Blob([
        handler.call(file, content).join('\n')
      ], { type: 'text/plain' })).replace('blob:', '');
    });
  };

  async write(str) {
    return await this.#write(() => str.split('\n'));
  }

  async writeLine(str, line) {
    return await this.#write(content => {
      if (line % 1 != 0)
        throw `Line ${line} is not a valid line number!`;

      content[line] = str;
      return content;
    });
  }

  async writeLines(str, ...paths) {
    return await this.#write(content => {
      paths.forEach(line => {
        if (line % 1 != 0)
          throw `Line ${line} is not a valid line number!`;

        content[line] = str;
      });

      return content;
    });
  }

  async writeRange(str, start, end) {
    return await this.#write(content => {
      if (start % 1 != 0 || end % 1 != 0)
        throw `Some lines are not valid line numbers!`;

      for (let i = start; i <= end; i++)
        content[i] = str;

      return content;
    });
  }

  async writeRanges(str, ...ranges) {
    return await this.#write(content => {
      if (ranges.some(([ start, end ]) => start % 1 != 0 || end % 1 != 0))
        throw `Some lines are not valid line numbers!`;

      ranges.forEach(([ start, end ]) => {
        for (let i = start; i <= end; i++)
          content[i] = str;
      });

      return content;
    });
  }

  async overwriteRange(str, start, end) {
    return await this.#write(content => {
      if (start % 1 != 0 || end % 1 != 0)
        throw `Some lines are not valid line numbers!`;

      content.splice(start, end - start + 1, str);
      return content;
    });
  }

  async overwriteRanges(str, ...ranges) {
    return await this.#write(content => {
      if (ranges.some(([ start, end ]) => start % 1 != 0 || end % 1 != 0))
        throw `Some lines are not valid line numbers!`;

      ranges.forEach(([ start, end ]) => {
        for (let i = start; i <= end; i++) {
          if (i == start)
            content[i] = str;
          else
            content[i] = undefined;
        }
      });

      return content.filter(line => line !== undefined);
    });
  }

  async append(str) {
    return await this.#write(content =>
      (content.join('\n') + str).split('\n')
    );
  }

  async appendLine(str) {
    return await this.#write(content =>
      [ ...content, str ]
    );
  }

  async prepend(str) {
    return await this.#write(content =>
      (str + content.join('\n')).split('\n')
    );
  }

  async prependLine(str) {
    return await this.#write(content =>
      [ str, ...content ]
    );
  }

  async insertBefore(str, ...paths) {
    return await this.#write(content => {
      paths.forEach(line => {
        if (line % 1 != 0)
          throw `Line ${line} is not a valid line number!`;

        content.splice(line, 0, str);
      });

      return content;
    });
  }

  async insertAfter(str, ...paths) {
    return await this.#write(content => {
      paths.forEach(line => {
        if (line % 1 != 0)
          throw `Line ${line} is not a valid line number!`;

        content.splice(line + 1, 0, str);
      });

      return content;
    });
  }

  async deleteLine(line) {
    return await this.#write(content => {
      if (line % 1 != 0)
        throw `Line ${line} is not a valid line number!`;

      content.splice(line, 1);
      return content;
    });
  }

  async deleteLines(...lines) {
    return await this.#write(content => {
      if (lines.some(line => line % 1 != 0))
        throw `Some lines are not valid line numbers!`;

      lines.sort((a, b) => b - a).forEach(line =>
        content.splice(line, 1)
      );
      return content;
    });
  }

  async deleteRange(start, end) {
    return await this.#write(content => {
      if (start % 1 != 0 || end % 1 != 0)
        throw `Some lines are not valid line numbers!`;

      content.splice(start, end - start + 1);
      return content;
    });
  }

  async deleteRanges(...ranges) {
    return await this.#write(content => {
      if (ranges.some(([ start, end ]) => start % 1 != 0 || end % 1 != 0))
        throw `Some lines are not valid line numbers!`;

      return content.filter((_, i) =>
        !ranges.some(([ start, end ]) => i >= start && i <= end)
      );
    });
  }
};

class VJSONFile extends VFile {
  #url;
  constructor(disk, file) {
    super(disk, file);

    this.#url = URL.newObjectURL(new Blob([ '' ], { type: 'application/json' })).replace('blob:', '');
  }

  get type() {
    return 'application/json';
  }

  get url() {
    return `blob:${this.#url}`;
  }

  async readRaw() {
    return await fetch(
      `blob:${this.#url}`,
      { cache: 'no-store' }
    ).then(async function(response) {
      let content = '';

      const decoder = new TextDecoder();
      await (await response.blob()).stream().pipeTo(new WritableStream({
        write: chunk => content += decoder.decode(chunk)
      }));

      return content;
    });
  }

  async read(){
    return await this.readRaw().then(content => JSON.parse(content || '{}'));
  }

  async readPath(path) {
    return await this.read().then(content =>
      (new Function('obj', `return obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path};`).bind(content))(content)
    );
  }

  async readPaths(...paths) {
    return (content => {
      const obj = {};
      let objPath;
      paths.map(path => {
        let currentObj = content;
        objPath = obj;
        EvalKeyPath(path).map((k, i, arr) => {
          currentObj = currentObj[k];

          if (i == arr.length - 1)
            objPath[k] = currentObj;
          else
            objPath = objPath[k] = {};
        });
      });

      return obj;
    })(await this.read());
  }

  async readPathsFlat(...paths) {
    return (content =>
      paths.map(path =>
        (new Function('obj', `return obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path};`).bind(content))(content)
      )
    )(await this.read());
  }

  #write = async function(handler) {
    const file = this;
    return await this.read().then(function(content) {
      URL.deleteObjectURL(`blob:${file.#url}`);
      file.#url = URL.newObjectURL(new Blob([
        JSON.stringify(handler.call(file, content))
      ], { type: 'application/json' })).replace('blob:', '');
    });
  };

  async write(obj) {
    return await this.#write(() => obj);
  }

  async writePath(v, path) {
    return await this.#write(content => {
      new Function('obj', 'v', `obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path} = v;`)(content, v);
      return content;
    });
  }

  async writePaths(v, ...paths) {
    return await this.#write(content => {
      paths.forEach(path =>
        new Function('obj', 'v', `obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path} = v;`)(content, v)
      );

      return content;
    });
  }

  async assign(obj) { // rewrite
    URL.deleteObjectURL(`blob:${this.#url}`);
    this.#url = URL.newObjectURL(new Blob([
      JSON.stringify(Object.assign(await this.read(), obj))
    ], { type: 'application/json' })).replace('blob:', '');
  }

  async deletePath(path) {
    return await this.#write(content => {
      new Function('obj', `delete obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path};`)(content);
      return content;
    });
  }

  async deletePaths(...paths) {
    return await this.#write(content => {
      paths.forEach(path =>
        new Function('obj', `delete obj${path[0] == '.' || path[0] == '[' ? '' : '.'}${path};`)(content)
      );

      return content;
    });
  }
};

class Disk {
  #files = {};
  new(file, overwrite) {
    if (this.#files[file] && !overwrite)
      throw `File ${file} already exists! Overwrite file is set to OFF`;
    else {
      if (this.#files[file])
        URL.deleteObjectURL(`blob:${this.#files[file].url}`);

      switch ({ txt: 'text/plain', json: 'application/json' }[file.split('.').pop()]) {
        default:
        case 'text/plain':
          return this.#files[file] = new VTextFile(this, file);
        case 'application/json':
          return this.#files[file] = new VJSONFile(this, file);
      }
    }
  }
  load(file) {
    if (this.#files[file])
      return this.#files[file];
    else
      throw `File ${file} does not exist!`;
  }
  delete(file) {
    if (this.#files[file]) {
      URL.deleteObjectURL(this.#files[file].url);
      delete this.#files[file];
    } else
      throw `File ${file} does not exist!`;
  }
  wipe() {
    this.#files.k_forEach(file =>
      this.delete(file)
    );
  }
  get files() {
    return structuredClone(this.#files);
  }
};
global.disk = new Disk();

/* async function diskTest() {
  const disk = new Disk();

  await (async function(file) {
    await file.write('3: Write');

    await file.writeLine('5: Write Line', 1);
    await file.writeLines('6-7: Write Lines', 2, 3);

    await file.writeRange('9-10: Write Range', 4, 7);
    await file.writeRanges('11-13,15-17: Write Ranges', [ 7, 9 ], [ 11, 13 ]);

    await file.overwriteRange('8: Overwrite Range', 4, 5);
    await file.overwriteRanges('11-12,14-15: Overwrite Ranges', [ 10, 11 ], [ 13, 14 ]);

    await file.append(' 17: Append');
    await file.appendLine('18: Append Lines');

    await file.prepend('3: Prepend ');
    await file.prependLine('1: Prepend Line');

    await file.insertBefore('2: Insert Before', 1);
    await file.insertAfter('4: Insert After', 2);

    console.log(await file.read());
    console.log(await file.readLine(1));
    console.log(await file.readLines(2, 3));
    console.log(await file.readRange(4, 6));
    console.log(await file.readRanges([7, 12], [ 8, 15 ]));
    console.log(await file.readRangesFlat([ 7, 12 ], [ 8, 15 ]));

    await file.deleteLine(1);
    await file.deleteLines(2, 3);
    await file.deleteRange(4, 6);
    await file.deleteRanges([7, 12], [ 8, 13 ]);

    console.log(await file.readAll());
    console.log(await file.read());

    console.log(file.url);
  })(disk.new('test.txt'));

  await (async function(file) {
    await file.write({ a: 1, b: [5, {a: 6}, 5], c: 3 });

    await file.writePath(4, 'd');
    await file.writePaths(5, 'e', 'f');

    console.log(await file.read());
    console.log(await file.readPath('a'));
    console.log(await file.readPaths('b[1]', 'c'));
    console.log(await file.readPathsFlat('b', 'c'));

    await file.deletePath('a');
    await file.deletePaths('d', 'c');

    console.log(await file.readRaw());

    console.log(file.url);
  })(disk.new('test.json'));

  disk.wipe();
}
diskTest(); */

/* const Sandbox = {};
Object.defineProperty(Sandbox, 'test', {
  enumerable: false,
  value: function(code, scope) {
    let $sandbox = body.qs('#sandbox') ?? body.appendChild('iframe#sandbox');
    $sandbox.style.display = 'none';

    return (function(contentWindow) {
      const $script = contentWindow.document.createElement('script');
      $script.textContent = `
        window.sandbox = (function() {
          'use strict';

          return (${code});
        }).call(${JSON.stringify(scope)});
      `;
      contentWindow.document.head.appendChild($script);

      return contentWindow.sandbox;
    })($sandbox.contentWindow);
  },
});

setTimeout(() =>
console.log(Sandbox.test('window.top', {}))
, 1000); */