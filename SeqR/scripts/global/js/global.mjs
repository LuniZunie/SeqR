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
  mouse: {},
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

addEventListener('mousemove', e => global.mouse = e);

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

function timedFetch(...args) {
  if (!((args.length - 1) % 2 == 0 && args.length > 2))
    throw new Error('Invalid number of arguments');

  const timeout = args.pop();
  const fetches = args.reduce((fetches, arg, i) => {
    if (i % 2 == 0)
      fetches.push([ arg ]); // url
    else
      fetches[fetches.length - 1].push(arg); // options

    return fetches;
  }, []);

  let invalidFetches = 0;
  return Promise.race([
    ...fetches.map(([ url, options ]) => {
      return new Promise((resolve, reject) => {
        fetch(url, options).then(res => {
          if (res.ok)
            resolve(res);
          else if (++invalidFetches == fetches.length)
            reject(new Error('all fetches failed'));
        }).catch(() => {
          if (++invalidFetches == fetches.length)
            reject(new Error('all fetches failed'));
        });
      });
    }),
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

    let l = $.scrollLeft;
    const speed = +$.nullSetAttr('scroll-speed', 1) + +$.nullSetAttr('scroll-round', 0);
    $.setAttr('scroll-round', speed % 1);

    $.scrollBy(+$.nullSetAttr('scroll-direction', 1) * speed | 0, 0);
    if (l == $.scrollLeft) {
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
  constructor(events = {}) {
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
  addWithScope($s, ...events) { // remove
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

class Modifier {
  #id = -1;
  #tooltip;
  #type;

  #point = { x: 0, y: 0 };
  #$element;

  #boundingBox = {
    x1: -Infinity,
    y1: -Infinity,
    x2: Infinity,
    y2: Infinity,
  };
  #$boundingBoxAnchor = window;

  #events = {
    standard: new Events(),
    destruction: new Events(),
  };

  #mouse;
  #mouseEvent = e => this.#mouse = e;

  #looseUpdates = [];
  #fixedUpdates = [];
  #intervals = [];

  #memoryCheckUpdate = LooseUpdate(function() {
    if (this.element?.getAttr?.('memory-removed'))
      this.deconstruct?.();
    if (this.anchor?.getAttr?.('memory-removed'))
      this.anchor = html;
    if (this.boundingBoxAnchor?.getAttr?.('memory-removed'))
      this.boundingBoxAnchor = window;
  }, 30, this);

  #getAnchorPoint = function($anchor, { x, y }, tooltip) {
    let parsePoint = function(v, dir) {
      const [ Dir, dir_1, Dir_1, dir_2, Dir_2, dir_scale, Dir_scale ] = dir == 'x' ?
        [ 'X', 'left', 'Left', 'right', 'Right', 'width', 'Width' ] :
        [ 'Y', 'top', 'Top', 'bottom', 'Bottom', 'height', 'Height' ];

      if (typeof v == 'string')
        v = v.replace(new RegExp(`-${dir_scale}`), `-${dir_2}`);

      if ($anchor instanceof Window)
        switch (v) {
          case 'mouse':
          case 'page-mouse':
            return this.mouse[`page${Dir}`];
          case 'client-mouse':
            return this.mouse[`client${Dir}`];
          case 'offset-mouse':
            return this.mouse[`offset${Dir}`];
          case 'screen-mouse':
            return this.mouse[`screen${Dir}`];
          case 'global-mouse':
          case 'global-page-mouse':
            return global.mouse[`page${Dir}`];
          case 'global-client-mouse':
            return global.mouse[`client${Dir}`];
          case 'global-offset-mouse':
            return global.mouse[`offset${Dir}`];
          case 'global-screen-mouse':
            return global.mouse[`screen${Dir}`];
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
          case null:
            return 0;
          default: {
            if (typeof v == 'string')
              return parseCSSPosition(v, window, dir);
            else if (typeof v == 'number')
              return v;
            else if (v instanceof Function)
              return v.call(this, this);
            else
              throw new TypeError('The anchor point must be a CSS position, number, or function. Passed: ' + v);
          }
        }
      else if ($anchor instanceof Node) {
        const center = (v_1, v_2) => (v_1 + v_2) / 2;
        const rect = $anchor.rect();
        const offset = tooltip ? -$anchor.rect()[dir] : 0;

        switch (v) {
          case 'mouse':
          case 'page-mouse':
            return this.mouse[`page${Dir}`];
          case 'client-mouse':
            return this.mouse[`client${Dir}`];
          case 'offset-mouse':
            return this.mouse[`offset${Dir}`];
          case 'screen-mouse':
            return this.mouse[`screen${Dir}`];
          case 'global-mouse':
          case 'global-page-mouse':
            return global.mouse[`page${Dir}`];
          case 'global-client-mouse':
            return global.mouse[`client${Dir}`];
          case 'global-offset-mouse':
            return global.mouse[`offset${Dir}`];
          case 'global-screen-mouse':
            return global.mouse[`screen${Dir}`];
          case dir_1:
          case `outer-${dir_1}`:
            return $anchor[`outer${Dir_1}`]() + offset;
          case `inner-${dir_1}`:
            return $anchor[`inner${Dir_1}`]() + offset;
          case `scrollbar-${dir_1}`:
            return $anchor[`scrollbar${Dir_1}`]() + offset;
          case `content-${dir_1}`:
            return $anchor[`content${Dir_1}`]() + offset;
          case 'center':
          case `outer-center`:
            return center($anchor[`outer${Dir_1}`](), $anchor[`outer${Dir_2}`]()) + offset;
          case `inner-center`:
            return center($anchor[`inner${Dir_1}`](), $anchor[`inner${Dir_2}`]()) + offset;
          case `scrollbar-center`:
            return rect[dir_1] + (rect[dir_scale] - $anchor[`scrollbar${Dir_scale}`]) / 2 + offset;
          case `content-center`:
            return center($anchor[`content${Dir_1}`](), $anchor[`content${Dir_2}`]()) + offset;
          case dir_2:
          case `outer-${dir_2}`:
            return $anchor[`outer${Dir_2}`]() + offset;
          case `inner-${dir_2}`:
            return $anchor[`inner${Dir_2}`]() + offset;
          case `scrollbar-${dir_2}`:
            return $anchor[`scrollbar${Dir_2}`]() + offset;
          case `content-${dir_2}`:
            return $anchor[`content${Dir_2}`]() + offset;
          case null:
            return 0;
          default: {
            if (typeof v == 'string')
              return parseCSSPosition(v, $anchor, dir) + offset;
            else if (typeof v == 'number')
              return v;
            else if (v instanceof Function)
              return v.call(this, this);
            else
              throw new TypeError('The anchor point must be a CSS position, number, or function. Passed: ' + v);
          }
        }
      }
    };

    const obj = { x: parsePoint.call(this, x, 'x'), y: parsePoint.call(this, y, 'y') };
    parsePoint = null;

    return obj;
  };
  constructor(x = 'center', y = 'center', $element = window, events = {}, deconstructionEvents = {}, tooltip, type = 'Anchor') {
    if ($element === 'tooltip')
      $element = tooltip.element;

    if (!($element instanceof Window || $element instanceof Node))
      throw new TypeError('The relative element must be a Window or Node.');
    else if (!(tooltip instanceof Tooltip) && type != 'Tooltip')
      throw new TypeError('The tooltip must be a Tooltip.');
    else if (!(type == 'Tooltip' || type == 'Anchor' || type == 'Offset'))
      throw new TypeError('The type must be "Tooltip" or "Anchor" or "Offset".');

    if (type != 'Tooltip')
      while (tooltip[`get${type}`](++this.#id)) continue;

    this.#tooltip = tooltip;
    this.#type = type;

    this.#$element = $element;
    this.setPoint(x, y);

    this.#setEvents('standard', events);
    this.#setEvents('destruction', deconstructionEvents);
  }
  get id() {
    if (this.#id == -1)
      throw new Error('The modifier has already been deconstructed.');

    return this.#id;
  }
  get tooltip() {
    if (this.#id == -1)
      throw new Error('The modifier has already been deconstructed.');

    return this.#tooltip;
  }
  get tooltipElement() {
    if (this.#id == -1)
      throw new Error('The modifier has already been deconstructed.');

    return this.#tooltip.element;
  }
  get type() {
    return this.#type;
  }
  get mouse() {
    return this.#mouse;
  }

  setPoint(x = this.#point.x, y = this.#point.y) {
    const regex = new RegExp('(?<!global-)mouse');
    const includesMouse = regex.exec(x?.toString()) || regex.exec(y?.toString());
    if (includesMouse && !this.#mouse) {
      this.#mouseEvent = (e => this.#mouse = e).bind(this);
      this.#$element.addEventListener('mousemove', this.#mouseEvent);

      this.#mouse = global.mouse;
    } else if (!includesMouse && this.#mouse) {
      this.#$element.removeEventListener('mousemove', this.#mouseEvent);
      this.#mouse = undefined;
    }

    this.#point = { x, y };
    return this;
  }
  get point() {
    return this.#point;
  }
  get parsedPoint() {
    return this.#getAnchorPoint(this.#$element, this.#point, this.#type == 'Tooltip');
  }

  setX(x) {
    return this.setPoint(x);
  }
  get x() {
    return this.#point.x;
  }
  get parsedX() {
    return this.parsedAnchor.x;
  }

  setY(y) {
    return this.setPoint(undefined, y);
  }
  get y() {
    return this.#point.y;
  }
  get parsedY() {
    return this.parsedAnchor.y;
  }

  setElement($element) {
    if (this.#id == -1)
      throw new Error('The modifier has already been deconstructed.');

    if (!($element instanceof Window || $element instanceof Node))
      throw new TypeError('The relative element must be a Window or Node.');

    if (this.#mouse) {
      this.#$element.removeEventListener('mousemove', this.#mouseEvent);

      this.#mouseEvent = (e => this.#mouse = e).bind(this);
      $element.addEventListener('mousemove', this.#mouseEvent);
    }

    this.#$element = $element;
    return this;
  }
  get element() {
    return this.#$element;
  }

  setBoundingBox(
    x1 = this.#boundingBox.x1,
    y1 = this.#boundingBox.y1,
    x2 = this.#boundingBox.x2,
    y2 = this.#boundingBox.y2,
    $element = this.#$boundingBoxAnchor ?? window
  ) {
    if (this.#type != 'Tooltip')
      throw new Error('The bounding box can only be set for a Tooltip.');

    this.setBoundingBoxElement($element);
    this.#boundingBox = { x1, y1, x2, y2 };

    return this;
  }
  get boundingBox() {
    if (this.#type != 'Tooltip')
      throw new Error('The bounding box can only be gotten for a Tooltip.');

    return { element: this.#$boundingBoxAnchor, ...this.#boundingBox };
  }
  get parsedBoundingBox() {
    if (this.#type != 'Tooltip')
      throw new Error('The bounding box can only be gotten for a Tooltip.');

    const { x: x1, y: y1 } = this.#getAnchorPoint(this.#$boundingBoxAnchor, { x: this.#boundingBox.x1, y: this.#boundingBox.y1 });
    const { x: x2, y: y2 } = this.#getAnchorPoint(this.#$boundingBoxAnchor, { x: this.#boundingBox.x2, y: this.#boundingBox.y2 });

    return { element: this.#$boundingBoxAnchor, x1, y1, x2, y2 };
  }

  setBoundingBoxElement($element) {
    if (this.#type != 'Tooltip')
      throw new Error('The bounding box can only be set for a Tooltip.');

    if ($element === 'tooltip')
      $element = this.tooltip.element;
    else if (!($element instanceof Window || $element instanceof Node))
      throw new TypeError('The relative element must be a Window or Node.');

    this.#$boundingBoxAnchor = $element;
    return this;
  }
  get boundingBoxElement() {
    if (this.#type != 'Tooltip')
      throw new Error('The bounding box can only be gotten for a Tooltip.');

    return this.#$boundingBoxAnchor;
  }

  #updateEvents(type) {
    this.#events[type].add(this.#$element, 'events');
    return this;
  }
  #addEvents(type, events, misc) {
    const eventsObj = new Events({ events });
    events = eventsObj.getFormatted.v_$map(v =>
      v.v_$map(v =>
        v.map(v => {
          if (type == 'destruction')
            v[0] = new Function('func', `
              this.tooltip.deconstruct(${misc?.fadeOut});
              return func.call(this, this);
            `)(v[0]);

          return [ v[0].bind(this), v[1], v[2] ];
        })
      )
    );

    events = Object.deepMerge(this.#events[type].getFormatted, events);
    eventsObj.deconstruct();

    this.#events[type].deconstruct();
    this.#events[type] = new Events(events);

    return this.#updateEvents(type);
  }
  #setEvents(type, events, misc) {
    const eventsObj = new Events({ events });
    events = eventsObj.getFormatted.v_$map(v =>
      v.v_$map(v =>
        v.map(v => {
          if (type == 'destruction')
            v[0] = new Function('func', `
              this.tooltip.deconstruct(${misc?.fadeOut});
              return (${v[0]}).call(this, this);
            `);

          return [ v[0].bind(this), v[1], v[2] ];
        })
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

  addEvents(events) {
    return this.#addEvents('standard', events);
  }
  setEvents(events = this.#events.standard.get) {
    return this.#setEvents('standard', events);
  }
  removeEvents(...events) {
    return this.#removeEvents('standard', ...events);
  }
  get events() {
    return this.#events.standard.getFormatted.events;
  }
  get sentevents() {
    return this.#events.standard.get.events;
  }

  #parseDestructionEvents(events) {
    return events.v_$map(v =>
      v === undefined || v === null ? () => void 1 : v
    );
  }
  addDestructionEvents(events, fadeOut) {
    return this.#addEvents('destruction', this.#parseDestructionEvents(events), { fadeOut });
  }
  setDestructionEvents(events = this.#events.destruction.get, fadeOut) {
    return this.#setEvents('destruction', this.#parseDestructionEvents(events), { fadeOut });
  }
  removeDestructionEvents(...events) {
    return this.#removeEvents('destruction', ...events);
  }
  get destructionEvents() {
    return this.#events.destruction.getFormatted.events;
  }
  get sentDestructionEvents() {
    return this.#events.destruction.get.events;
  }

  get looseUpdates() {
    return { ...update.loose }._$filter(([ k ]) => this.#looseUpdates.contains(k))._reduce((obj, [ k, { fn, scope, time } ]) =>
      (obj[k] = { 'function': fn, scope, time }) && obj,
    {});
  }
  requestLooseUpdate(fn, time, scope = this) {
    this.newLooseUpdate(fn, time, scope);
    return this;
  }
  newLooseUpdate(fn, time, scope = this) {
    const id = LooseUpdate(fn, time, scope);
    this.#looseUpdates.push(id);
    return id;
  }
  getLooseUpdate(id) {
    return update.loose[id];
  }
  removeLooseUpdate(id) {
    DeleteLooseUpdate(id);
    this.#looseUpdates = this.#looseUpdates.filter(i => i != id);
  }

  get fixedUpdates() {
    return { ...update.fixed }._$filter(([ k ]) => this.#fixedUpdates.contains(k))._reduce((obj, [ k, { fn, scope, time } ]) =>
      (obj[k] = { 'function': fn, scope, time }) && obj,
    {});
  }
  requestFixedUpdate(fn, time, scope = this) {
    this.newFixedUpdate(fn, time, scope);
    return this;
  }
  newFixedUpdate(fn, time, scope = this) {
    const id = FixedUpdate(fn, time, scope);
    this.#fixedUpdates.push(id);
    return id;
  }
  getFixedUpdate(id) {
    return update.fixed[id];
  }
  removeFixedUpdate(id) {
    DeleteFixedUpdate(id);
    this.#fixedUpdates = this.#fixedUpdates.filter(i => i != id);
  }

  get intervals() {
    return this.#intervals._reduce((obj, { id, fn, scope, time }) =>
      (obj[id] = { 'function': fn, scope, time }) && obj,
    {});
  }
  requestInterval(fn, time, scope = this) {
    this.newInterval(fn, time, scope);
    return this;
  }
  newInterval(fn, time, scope = this) {
    const id = setInterval(fn.bind(scope), time);
    this.#intervals.push({ id: id, fn, scope, time });
    return id;
  }
  getInterval(id) {
    return this.#intervals.find(v => v.id == id);
  }
  removeInterval(id) {
    clearInterval(id);
    this.#intervals = this.#intervals.filter(v => v.id != id);
  }

  superDeconstruct(called) {
    if (!called && this.#id != -1)
      this.#tooltip[`remove${this.#type}`](this.#id);

    this.#id = undefined;
    this.#tooltip = undefined;
    this.#type = undefined;

    this.#point = undefined;
    this.#$element = undefined;

    this.#boundingBox = undefined;
    this.#$boundingBoxAnchor = undefined;

    this.#events?.standard.deconstruct();
    this.#events?.destruction.deconstruct();
    this.#events = undefined;

    this.#looseUpdates?.forEach(id => DeleteLooseUpdate(id));
    this.#looseUpdates = undefined;
    this.#fixedUpdates?.forEach(id => DeleteFixedUpdate(id));
    this.#fixedUpdates = undefined;
    this.#intervals?.forEach(({ id }) => clearInterval(id));
    this.#intervals = undefined;

    DeleteLooseUpdate(this.#memoryCheckUpdate);
    this.#memoryCheckUpdate = undefined;

    this.#getAnchorPoint = undefined;
  }
}

class Tooltip extends Modifier {
  #canceled = false;
  get canceled() {
    return this.#canceled;
  }
  #fadingOut = false;
  get fadingOut() {
    return this.#fadingOut;
  }

  #firstUpdate = true;

  #follow;
  constructor($tooltip = 'div', $parent, text, addFunc = Element.prototype.appendChild, events, deconstructionEvents) {
    $tooltip = $tooltip instanceof Element ? $tooltip : document.createElementByQs($tooltip);
    super('center', 'center', $tooltip, events, deconstructionEvents, null, 'Tooltip');

    $parent = $parent instanceof Element ? $parent : (function() {
      try {
        return document.createElementByQs($parent);
      } catch (er) {
        return window;
      }
    })();

    this.element.style.position = 'fixed';
    this.element.setAttr('tooltip', true);
    this.element.innerHTML = text;

    (addFunc instanceof Function ? addFunc : Element.prototype.appendChild).call(
      $parent instanceof Element ? $parent : body,
      this.element,
      this
    );

    this.update = this.update.bind(this);
    return this;
  }
  create(time, fadeIn, update = true) {
    if (!+time)
      return update ? this.update() : this;

    const opacityTo = +(this.element.getCS('opacity') || 1);
    this.element.style.opacity = 0;
    this.element.style.pointerEvents = 'none';

    const startTransition = this.element.style.transition;
    setTimeout(function() {
      if (this.canceled || this.fadingOut || !this.element)
        return;

      this.element.style.pointerEvents = '';
      this.element.style.transition = (this.element.style.transition).split(',').concat(`opacity ${fadeIn}ms`).join(',').replace(/^,/, '');
      this.element.style.opacity = opacityTo;

      setTimeout(function() {
        if (this.canceled || this.fadingOut || !this.element)
          return;

        this.element.style.transition = startTransition;
        this.element.style.opacity = '';
      }.bind(this), fadeIn);

      if (update)
        this.update();
    }.bind(this), time);

    return this;
  }

  moveAbove($element) {
    this.element.style.zIndex = $element.getParsedCS('z-index') + 1;
    return this;
  }
  setCSS(style) {
    this.element.setCSS(style);
    return this;
  }
  addCSS(style) {
    this.element.addCSS(style);
    return this;
  }
  removeCSS(...styles) {
    this.element.removeCSS(...styles);
    return this;
  }

  setOrigin(x, y, events, deconstructionEvents) {
    this.setPoint(x, y);

    if (events)
      this.setEvents(events);
    if (deconstructionEvents)
      this.setDestructionEvents(deconstructionEvents);

    return this;
  }
  get origin() {
    return { element: this.element, ...this.point };
  }
  get parsedOrigin() {
    return { element: this.element, ...this.parsedPoint };
  }

  #anchor = class Anchor extends Modifier {
    #weight = 1;

    constructor(x, y, $element, weight = 1, events, deconstructionEvents, tooltip) {
      super(x, y, $element, events, deconstructionEvents, tooltip, 'Anchor');

      this.#weight = +weight;
    }

    setAnchor(x, y, $element, weight = this.#weight, events, deconstructionEvents) {
      if (!($element instanceof Window || $element instanceof Node))
        throw new TypeError('The relative element must be a Window or Node.');

      this.setPoint(x, y);
      this.setElement($element);
      this.#weight = +weight;

      if (events)
        this.setEvents(events);
      if (deconstructionEvents)
        this.setDestructionEvents(deconstructionEvents);

      return this;
    }
    get anchor() {
      return { element: this.element, ...this.point, weight: this.weight };
    }
    get parsedAnchor() {
      return { element: this.element, ...this.parsedPoint, weight: this.weight };
    }

    setWeight(weight = this.#weight) {
      this.#weight = +weight;
      return this;
    }
    get weight() {
      return this.#weight;
    }

    deconstruct(called) {
      if (!called)
        this.tooltip.removeAnchor(this.id);

      this.#weight = undefined;
      this.superDeconstruct(true);
    }
  }
  #anchors = {};
  get anchors() {
    return this.#anchors;
  }
  requestAnchor(...params) {
    return this.newAnchor(...params) && this;
  }
  newAnchor(x, y, $element, weight, events, deconstructionEvents) {
    const anchor = new this.#anchor(x, y, $element, weight, events, deconstructionEvents, this);
    return this.#anchors[anchor.id] = anchor;
  }
  getAnchor(id) {
    return this.#anchors[id];
  }
  removeAnchor(id) {
    this.#anchors[id]?.deconstruct(true);
    delete this.#anchors[id];
    return this;
  }

  #offset = class Offset extends Modifier {
    constructor(x, y, $element = 'tooltip', events, deconstructionEvents, tooltip) {
      super(x, y, $element, events, deconstructionEvents, tooltip, 'Offset');
    }

    setOffset(x, y, $element, events, deconstructionEvents) {
      if (!($element instanceof Window || $element instanceof Node))
        throw new TypeError('The relative element must be a Window or Node.');

      this.setPoint(x, y);
      this.setElement($element);

      if (events)
        this.setEvents(events);
      if (deconstructionEvents)
        this.setDestructionEvents(deconstructionEvents);

      return this;
    }
    get offset() {
      return { element: this.element, ...this.point };
    }
    get parsedOffset() {
      return { element: this.element, ...this.parsedPoint };
    }

    deconstruct(called) {
      if (!called)
        this.tooltip.removeOffset(this.id);

      this.superDeconstruct(true);
    }
  }
  #offsets = {};
  get offsets() {
    return this.#offsets;
  }
  requestOffset(...params) {
    return this.newOffset(...params) && this;
  }
  newOffset(x = 0, y = 0, $element, events, deconstructionEvents) {
    const offset = new this.#offset(x, y, $element, events, deconstructionEvents, this);
    return this.#offsets[offset.id] = offset;
  }
  getOffset(id) {
    return this.#offsets[id];
  }
  removeOffset(id) {
    this.#offsets[id]?.deconstruct(true);
    delete this.#offsets[id];
    return this;
  }

  update(smoothing = 1) {
    if (this.#canceled)
      return this;

    if (!this.#firstUpdate) {
      this.#firstUpdate = true;
      smoothing = 1;
    }

    const originPoint = this.parsedPoint;

    const offsetPoint = this.#offsets.v_reduce(function(totalOffset, offset) {
      const { x, y } = offset.parsedPoint;
      return {
        x: totalOffset.x + x,
        y: totalOffset.y + y,
      };
    }.bind(this), { x: 0, y: 0 });

    const anchorPoint = this.#anchors.v_reduce(function(totalAnchor, anchor) {
      const { x, y } = anchor.parsedPoint;
      return {
        x: totalAnchor.x + x * anchor.weight,
        y: totalAnchor.y + y * anchor.weight,
        weight: totalAnchor.weight + anchor.weight,
      };
    }, { x: 0, y: 0, weight: 0 });
    (anchorPoint.x /= anchorPoint.weight || 1), (anchorPoint.y /= anchorPoint.weight || 1);

    (function($tooltip) {
      $tooltip.style.position = 'fixed';
      const vx = (anchorPoint.x - originPoint.x + offsetPoint.x) - $tooltip.rect().x;
      const vy = (anchorPoint.y - originPoint.y + offsetPoint.y) - $tooltip.rect().y;

      if (!(smoothing instanceof Function))
        smoothing = new Function('v', `return v * ${+smoothing};`);

      let x = $tooltip.rect().x + smoothing(vx);
      let y = $tooltip.rect().y + smoothing(vy);

      const { x1, y1, x2, y2 } = this.parsedBoundingBox;

      x = x.clamp(x1, x2 - $tooltip.rect().w);
      y = y.clamp(y1, y2 - $tooltip.rect().h);

      $tooltip.style.left = `${x}px`;
      $tooltip.style.top = `${y}px`;
    }).bind(this)(this.element);

    return this;
  }
  follow(v = true, smoothing = 1, speed = 1) {
    if (v && this.#follow === undefined)
      this.#follow = FixedUpdate(() => this.update(smoothing), speed);
    else if (!v && this.#follow !== undefined) {
      DeleteFixedUpdate(this.#follow);
      this.#follow = undefined;
    }

    return this;
  }
  get following() {
    return bool(this.#follow);
  }

  deconstruct(fadeOut = 0) {
    if (!this.element || this.#canceled)
      return;

    this.#canceled = true;
    this.#fadingOut = true;

    this.element.style.pointerEvents = 'none';
    this.element.style.opacity = +(this.element.getCS('opacity') || 1);
    this.element.style.transition = (this.element.style.transition).split(',').concat(`opacity ${fadeOut}ms`).join(',').replace(/^,/, '');

    this.element.style.opacity = 0;
    setTimeout(function() {
      this.#fadingOut = undefined;
      this.#firstUpdate = undefined;

      this.follow(false);
      this.#follow = undefined;

      this.#offsets?.v_forEach(v => this.removeOffset.call(this, v.id));
      this.#offsets = undefined;

      this.#anchors?.v_forEach(v => this.removeAnchor.call(this, v.id));
      this.#anchors = undefined;

      this.element?.memRmv();

      this.superDeconstruct(true);
    }.bind(this), fadeOut);
  }
}

/* setTimeout(() => {
  const $tt = new Tooltip('div.tooltip', body)
    .setOrigin('global-mouse', 'global-mouse')
    .requestOffset('-50%', '-50%')
    .follow(true, 1, 0.1)
    .element;

  $tt.style.width = '10vw';
  $tt.style.height = '10vh';
  $tt.style.backgroundColor = 'red';

  $tt.style.zIndex = 9999;

  const tt_x = new Tooltip('div.tooltip', $tt, 'tooltip', $ => body.appendChild($))
    .setPoint('center', 'top')
    .requestAnchor('center', 0, $tt)
    .requestOffset(0, '0.5vh')
    .follow(true, 1, 0.05)
    .requestFixedUpdate(function() {
      this.element.textContent = Math.round(this.element.rect().x);
    });

  tt_x.element.style.zIndex = 10000;

  const tt_y = new Tooltip('div.tooltip', $tt, 'tooltip', $ => body.appendChild($))
    .setPoint('left', 'center')
    .requestAnchor(0, 'center', $tt)
    .requestOffset('0.5vw')
    .follow(true, 1, 0.05)
    .requestFixedUpdate(function() {
      this.element.textContent = Math.round(this.element.rect().y);
    });

  tt_y.element.style.zIndex = 10000;
}, 400); */

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