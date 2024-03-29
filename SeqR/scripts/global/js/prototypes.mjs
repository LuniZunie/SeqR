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

import * as globalExports from './global.mjs';
Object.entries(globalExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

Object.defineProperty(Array.prototype, 'prandom', {
  enumerable: false,
  value: function(seed, i, remove) {
    if (remove) {
      const i = Math.floor(Prandom(seed, i) * this.length);
      return (this.splice(i, 1))[0];
    } else
      return this[Math.floor(Prandom(seed, i) * this.length)];
  }
});
Object.defineProperty(Array.prototype, 'distance', {
  enumerable: false,
  value: function(...arrs) {
    return this.reduce((dist, v, i) => {
      return dist + (v - arrs.reduce(
        (sum, arr) => sum + arr[i] ?? 0, 0
      )) ** 2;
    }, 0) ** (1 / (arrs.length + 1));
  }
});
Object.defineProperty(Array.prototype, 'dist', {
  enumerable: false,
  value: Array.prototype.distance
});
Object.defineProperty(Array.prototype, 'min', {
  enumerable: false,
  value: function() {
    return Math.min(...this);
  }
});
Object.defineProperty(Array.prototype, 'max', {
  enumerable: false,
  value: function() {
    return Math.max(...this);
  }
});
Object.defineProperty(Array.prototype, 'sum', {
  enumerable: false,
  value: function() {
    return this.reduce(
      (sum, v) => sum + v,
    0);
  }
});
Object.defineProperty(Array.prototype, 'average', {
  enumerable: false,
  value: function() {
    return this.reduce(
      (sum, v) => sum + v,
    0) / this.length;
  }
});
Object.defineProperty(Array.prototype, 'avg', {
  enumerable: false,
  value: Array.prototype.average
});
Object.defineProperty(Array.prototype, 'clamp', {
  enumerable: false,
  value: function() {
    const min = Math.min(...this);
    const max = Math.max(...this);

    return this.map(
      v => (v - min) / (max - min)
    );
  }
});
Object.defineProperty(Array.prototype, 'shuffle', {
  enumerable: false,
  value: function() {
    for (let i = this.length; i > 1;) {
      const j = Math.floor(prandom() * i--);
      const temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }

    return this;
  }
});
Object.defineProperty(Array.prototype, 'contains', {
  enumerable: false,
  value: function(needle) {
    return this.some(
      v => v == needle
    );
  }
});
Object.defineProperty(Array.prototype, 'unique', {
  enumerable: false,
  value: function() {
    return [ ...new Set(this) ];
  }
});
Object.defineProperty(Array.prototype, 'last', {
  enumerable: false,
  value: function() {
    return this[this.length - 1];
  }
});
Object.defineProperty(Array.prototype, 'toLength', {
  enumerable: false,
  value: function(targetLength, fill = ' ', fromLeft = true) {
    const length = this.length;
    if (length == targetLength)
      return this;
    else if (length > targetLength)
      return fromLeft ? this.slice(0, targetLength) : this.slice(~targetLength + 1);
    else {
      Array.from({ length: targetLength - length },
        () => fromLeft ? this.unshift(fill) : this.push(fill)
      );
      return this;
    }
  }
});

[ NodeList, HTMLCollection, DOMTokenList, Object ].forEach(obj => {
  [
    'at',
    'average',
    'avg',
    'clamp',
    'concat',
    'contains',
    'copyWithin',
    'distance',
    'dist',
    'entries',
    'every',
    'fill',
    'filter',
    'find',
    'findIndex',
    'flat',
    'flatMap',
    'forEach',
    'from',
    'includes',
    'indexOf',
    'join',
    'keys',
    'last',
    'lastIndexOf',
    'map',
    'max',
    'min',
    'pop',
    'push',
    'reduce',
    'reduceRight',
    'reverse',
    'shift',
    'shuffle',
    'some',
    'sort',
    'splice',
    'sum',
    'toLength',
    'toString',
    'unique',
    'unshift',
    'valueOf',
    { prototype: 'array', type: 1 },
  ].forEach(prototype => {
    if (obj === Object) {
      if ([ 'entries', 'keys', 'values' ].includes(prototype))
        return;

      if (prototype?.type === 1) {
        Object.defineProperty(obj.prototype, `_${prototype.prototype}`, {
          enumerable: false,
          value: function() {
            return Object.entries(this);
          }
        });

        Object.defineProperty(obj.prototype, `k_${prototype}`, {
          enumerable: false,
          value: function() {
            return Object.keys(this);
          }
        });

        Object.defineProperty(obj.prototype, `v_${prototype}`, {
          enumerable: false,
          value: function() {
            return Object.values(this);
          }
        });
      } else {
        Object.defineProperty(obj.prototype, `_${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.entries(this)[prototype](...parameters);
          }
        });

        Object.defineProperty(obj.prototype, `k_${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.keys(this)[prototype](...parameters);
          }
        });

        Object.defineProperty(obj.prototype, `v_${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.values(this)[prototype](...parameters);
          }
        });

        Object.defineProperty(obj.prototype, `_$${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.fromEntries(Object.entries(this)[prototype](...parameters));
          }
        });

        Object.defineProperty(obj.prototype, `k_$${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.fromEntries(Object.keys(this)[prototype](...parameters).map(
              (k, i) => [ k, this._v(i) ]
            ));
          }
        });

        Object.defineProperty(obj.prototype, `v_$${prototype}`, {
          enumerable: false,
          value: function(...parameters) {
            return Object.fromEntries(Object.values(this)[prototype](...parameters).map(
              (v, i) => [ this._k(i), v ]
            ));
          }
        });
      }
    } else if (prototype?.type === 1)
      Object.defineProperty(obj.prototype, prototype.prototype, {
        enumerable: false,
        value: function() {
          return [ ...this ];
        }
      });
    else
      Object.defineProperty(obj.prototype, prototype, {
        enumerable: false,
        value: function(...parameters) {
          return [ ...this ][prototype](...parameters);
        }
      });
  });
});

[ NodeList, HTMLCollection, DOMTokenList ].forEach(obj => {
  Object.defineProperty(obj.prototype, 'memoryRemove', {
    enumerable: false,
    value: function() {
      this.forEach(
        $ => $?.memRmv()
      );
    },
  });
  Object.defineProperty(obj.prototype, 'memRmv', {
    enumerable: false,
    value: obj.prototype.memoryRemove
  });
});

Object.defineProperty(Object.prototype, '_keys', {
  enumerable: false,
  value: function() {
    return Object.keys(this);
  }
});
Object.defineProperty(Object.prototype, '_ks', {
  enumerable: false,
  value: Object.prototype._keys
});
Object.defineProperty(Object.prototype, '_key', {
  enumerable: false,
  value: function(i) {
    return Object.keys(this)[i];
  }
});
Object.defineProperty(Object.prototype, '_k', {
  enumerable: false,
  value: Object.prototype._key
});
Object.defineProperty(Object.prototype, '_values', {
  enumerable: false,
  value: function() {
    return Object.values(this);
  }
});
Object.defineProperty(Object.prototype, '_vs', {
  enumerable: false,
  value: Object.prototype._values
});
Object.defineProperty(Object.prototype, '_value', {
  enumerable: false,
  value: function(i) {
    return Object.values(this)[i];
  }
});
Object.defineProperty(Object.prototype, '_v', {
  enumerable: false,
  value: Object.prototype._value
});
Object.defineProperty(Object.prototype, '_entries', {
  enumerable: false,
  value: function() {
    return Object.entries(this);
  }
});
Object.defineProperty(Object.prototype, '_ens', {
  enumerable: false,
  value: Object.prototype._entries
});
Object.defineProperty(Object.prototype, '_entry', {
  enumerable: false,
  value: function(i) {
    return Object.entries(this)[i];
  }
});
Object.defineProperty(Object.prototype, '_en', {
  enumerable: false,
  value: Object.prototype._entry
});
Object.defineProperty(Object.prototype, '_length', {
  enumerable: false,
  value: function() {
    return Object.keys(this).length;
  }
});
Object.defineProperty(Object.prototype, '_len', {
  enumerable: false,
  value: Object.prototype._length
});
Object.defineProperty(Object.prototype, '_order', {
  enumerable: false,
  value: function() {
    const valueRef = Object.entries(this).reduce((ref, [ k, v ]) => {
      if (ref[v])
        ref[v].push(k);
      else
        ref[v] = [k];

      return ref;
    }, {});

    return Object.values(this).sort().reduce((obj, v) => {
      valueRef[v].sort().forEach(k =>
        obj[k] = this[k]
      );

      return obj;
    }, {});
  }
});

Date.fullDate = function(time = Date.now()) {
  const date = new Date(time);
  const timeZone = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(/([\s\S]*) /g)[2];

  return `${date.toLocaleString()} ${timeZone}`;
};

Math.avg = function(...nums) {
	return nums.reduce(
		(sum, v) => +sum + +v
	) / nums.length;
};

Math.absMax = function(...nums) {
  return nums.reduce(
    (max, num) => Math.abs(num) > Math.abs(max) ? num : max
  );
};
Math.absMin = function(...nums) {
  return nums.reduce(
    (min, num) => Math.abs(num) < Math.abs(min) ? num : min
  );
};

Number.isFloat = function(num) {
	return Number.isFinite(num) && !Number.isInteger(num);
};

Object.defineProperty(Number.prototype, 'ceil', {
  enumerable: false,
  value: function(intv = 1) {
    return Math.ceil(this / intv) * intv;
  }
});
Object.defineProperty(Number.prototype, 'cl', {
  enumerable: false,
  value: Number.prototype.ceil,
});
Object.defineProperty(Number.prototype, 'round', {
  enumerable: false,
  value: function(intv = 1) {
    return Math.round(this / intv) * intv;
  }
});
Object.defineProperty(Number.prototype, 'rnd', {
  enumerable: false,
  value: Number.prototype.round,
});
Object.defineProperty(Number.prototype, 'floor', {
  enumerable: false,
  value: function(intv = 1) {
    return Math.floor(this / intv) * intv;
  }
});
Object.defineProperty(Number.prototype, 'flr', {
  enumerable: false,
  value: Number.prototype.floor
});
Object.defineProperty(Number.prototype, 'fixed', {
  enumerable: false,
  value: Number.prototype.toFixed,
});
Object.defineProperty(Number.prototype, 'fxd', {
  enumerable: false,
  value: Number.prototype.fixed,
});
Object.defineProperty(Number.prototype, 'abs', {
  enumerable: false,
  value: function() {
    return Math.abs(this);
  },
});
Object.defineProperty(Number.prototype, 'sign', {
  enumerable: false,
  value: function(mod = 1) {
    return Math.sign(this) * mod;
  },
});
Object.defineProperty(Number.prototype, 'sgn', {
  enumerable: false,
  value: Number.prototype.sign,
});
Object.defineProperty(Number.prototype, 'min', {
  enumerable: false,
  value: function(min) {
    return Math.min(this, min);
  }
});
Object.defineProperty(Number.prototype, 'max', {
  enumerable: false,
  value: function(max) {
    return Math.max(this, max);
  }
});
Object.defineProperty(Number.prototype, 'clamp', {
  enumerable: false,
  value: function(min = -Infinity, max = Infinity) {
    return Math.max(Math.min(this, max), min);
  }
});
Object.defineProperty(Number.prototype, 'toPercent', {
  enumerable: false,
  value: function(percentOf = 1, dec = Infinity) {
    return (this / percentOf).toDecimals(dec);
  }
});
Object.defineProperty(Number.prototype, 'toDecimals', {
  enumerable: false,
  value: function(decs = Infinity) {
    const getDecimals = function(v) {
      v = (+v).noExponents().toString();
      return (v.split('.')[1] ?? '').length;
    };

    if (decs === Infinity)
      return this;
    else if (decs === -Infinity)
      return 0;

    const mod = 10 ** decs;
    const num = Math.floor(this * mod) / mod;

    return `${num}${num.toString().includes('.') || !this.toString().includes('.') ? '' : '.'}${'0'.repeat(Math.min(getDecimals(this), 2) - getDecimals(num))}`;
  }
});
Object.defineProperty(Number.prototype, 'noExponents', {
  enumerable: false,
  value: function() {
    const data = String(this).split(/[eE]/);
    if (data.length == 1)
      return data[0];

    const sign = this < 0 ? '-' : '';
    const str = data[0].replace('.', '');
    const mag = Number(data[1]) + 1;

    if (mag < 0)
      return `${sign}0.${'0'.repeat(-mag - 1) + str.replace(/^\-/, '')}`;

    return str + '0'.repeat(mag - str.length);
  }
});
Object.defineProperty(Number.prototype, 'length', {
  enumerable: false,
  value: function() {
    return this.toString().length;
  }
});
Object.defineProperty(Number.prototype, 'toShortString', {
  enumerable: false,
  value: function() {
    const suffixes = [ '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg' ];
    const suffix = (this.toString().length - 1) / 3 << 0;

    return (((suffix ? this / 1000 ** suffix : this) * 1000 << 0) / 1000).toString().slice(0, 4).replace(/\.$/,'') + suffixes[suffix];
  }
});
Object.defineProperty(Number.prototype, 'toScientific', {
  enumerable: false,
  value: function(precision) {
    const [ coeff, exp ] = this.toExponential(precision).split('e');

    return `${coeff}*10^${exp.replace('+', '')}`;
  }
});

Object.defineProperty(String.prototype, 'reverse', {
  enumerable: false,
  value: function() {
    return this.split('').reverse().join('');
  }
});
Object.defineProperty(String.prototype, 'toUpperCaseWords', {
  enumerable: false,
  value: function() {
    return this.split(' ').map(
      word => word[0].toUpperCase() + word.slice(1, Infinity)
    ).join(' ');
  }
});
Object.defineProperty(String.prototype, 'join', {
  enumerable: false,
  value: function(join = '') {
    return this.split('').join(join.toString());
  }
});
Object.defineProperty(String.prototype, 'toNumber', {
  enumerable: false,
  value: function(base) { //base values above 36 use UNICODE values 0 -> base AND become case sensitive
    const maxBase = 0x200;
    if (base > 36 || !base) {
      const baseChars = Array.from({ length: base ?? maxBase },
        (_, i) => String.fromCharCode(i)
      );

      let trueBase = 0;
      const validBase = this.split('').every(char => {
        const index = baseChars.indexOf(char) + 1;
        trueBase = trueBase.max(index);

        return index;
      });
      base ??= trueBase;

      if (!validBase || base > maxBase)
        throw `(String, toNumber) cannot convert string to valid number!`;

      return this.split('').map(
        char => baseChars.indexOf(char)
      ).reduce(
        (sum, v, i, arr) => sum + v * base ** (arr.length - i - 1), 0
      );
    } else {
      const baseChars = Array.from({ length: base ?? 36 },
        (_, i) => i < 10 ? i.toString() : String.fromCharCode(i + 87)
      );

      let trueBase = 0;
      const validBase = this.toLowerCase().split('').every(char => {
        const i = baseChars.indexOf(char) + 1;
        trueBase = trueBase.max(i);

        return i;
      });

      if (!validBase)
        throw `(String, toNumber) cannot convert string to valid number!`;

      return parseInt(this, base ?? trueBase.max(2));
    }
  }
});
Object.defineProperty(String.prototype, 'evaluateNumber', {
  enumerable: false,
  value: function() {
    return this.replace(/[^(\d|\.|e|\+|\-)]/g, '');
  }
});
Object.defineProperty(String.prototype, 'toLength', {
  enumerable: false,
  value: function(targetLength, fill = ' ', fromLeft = true) {
    const length = this.length;
    if (length == targetLength)
      return this;
    else if (length > targetLength)
      return fromLeft ? this.slice(0, targetLength) : this.slice(~targetLength + 1);
    else {
      const newString = this.split('');
      Array.from({ length: targetLength - length },
        () => fromLeft ? newString.unshift(fill) : newString.push(fill)
      );
      return newString.join('');
    }
  }
});
Object.defineProperty(String.prototype, 'width', {
  enumerable: false,
  value: function(font = '16px sans-serif') {
    let $span = document.createElement('span');
    $span.style.font = font;
    $span.innerHTML = this;

    document.body.appendChild($span);
    const width = $span.getBoundingClientRect().width;

    $span.memRmv();

    return width;
  }
});
Object.defineProperty(String.prototype, 'height', {
  enumerable: false,
  value: function(font = '16px sans-serif') {
    let $span = document.createElement('span');
    $span.style.font = font;
    $span.innerHTML = this;

    document.body.appendChild($span);
    const height = $span.getBoundingClientRect().height;

    $span.memRmv();

    return height;
  }
});
Object.defineProperty(String.prototype, 'ex', {
  enumerable: false,
  value: function($parent = document.documentElement) {
    let $span = document.createElement('span');
    $span.style.fontSize = '1ex';
    $span.innerHTML = this;

    $parent.appendChild($span);
    const height = $span.getBoundingClientRect().height;

    $span.memRmv();

    return height;
  }
});
Object.defineProperty(String.prototype, 'splitOnLast', {
  enumerable: false,
  value: function(id) {
    const arr = this.split(id);
    return [ arr.slice(0, -1).join(id), arr.last() ];
  }
});
Object.defineProperty(String.prototype, 'matchOne', {
  enumerable: false,
  value: function(pattern) {
    return this.match(pattern)?.[0];
  }
});
Object.defineProperty(String.prototype, 'capitalize', {
  enumerable: false,
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
});

Object.defineProperty(Document.prototype, 'template', {
  enumerable: false,
  value: function(options, addToParent = true) {
    let $s = [];
    (options instanceof Array ? options : [ options ]).forEach(option => {
      if (options instanceof Element)
        $s = $s.concat(option);
      else if (typeof options == 'string')
        $s = $s.concat(this.querySelectorAll(`${options}.template`).array());
      else if (options.qs)
        $s = $s.concat(this.querySelector(`${options.qs}.template`));
      else if (options.qsa)
        $s = $s.concat(this.querySelectorAll(`${options.qsa}.template`).array());
      else if (options.id)
        $s = $s.concat(this.getElementById(options.id).filter(
          $template => $template.classList.contains('template')
        ));
      else if (options.class)
        $s = $s.concat(this.getElementsByClassName(options.class).filter(
          $template => $template.classList.contains('template')
        ));
      else if (options.tagName)
        $s = $s.concat(this.getElementsByTagName(options.tagName).filter(
          $template => $template.classList.contains('template')
        ));
    });

    $s = $s.filter(
      $template => $template instanceof Element
    ).map($template => {
      const $ = $template.cloneNode(true);
      $.classList.remove('template');

      if (addToParent == 'append')
        $template.parentElement.appendChild($);
      else if (addToParent == 'prepend')
        $template.parentElement.prependChild($);
      else if (addToParent == 'preprend_template')
        $template.parentElement.prependChild($, $template);
      else if (addToParent)
        $template.parentElement.appendChild($, $template);

      return $;
    });

    return $s.length == 1 ? $s[0] : $s;
  }
});
Object.defineProperty(Document.prototype, 'qs', {
  enumerable: false,
  value: Document.prototype.querySelector
});
Object.defineProperty(Document.prototype, 'qsa', {
  enumerable: false,
  value: Document.prototype.querySelectorAll
});
Object.defineProperty(Document.prototype, 'getById', {
  enumerable: false,
  value: Document.prototype.getElementById
});
Object.defineProperty(Document.prototype, 'getByTag', {
  enumerable: false,
  value: Document.prototype.getElementsByTagName
});
Object.defineProperty(Document.prototype, 'getByTagNS', {
  enumerable: false,
  value: Document.prototype.getElementsByTagNameNS
});
Object.defineProperty(Document.prototype, 'getByClass', {
  enumerable: false,
  value: Document.prototype.getElementsByClassName
});
Object.defineProperty(Document.prototype, 'createElementByQs', {
  enumerable: false,
  value: function(cssPath) {
    const [ , tag, id, classes ] = cssPath.match(/(\w+)(?:#(\w+))?(?:\.([\w-]+(?:\.[\w-]+)*))?/);

    const $ = this.createElement(tag);
    if (id)
      $.id = id;
    if (classes)
      $.classList.add(...classes.split('.'));

    return $;
  }
});

[ Element ].forEach(obj => { // change to Node.prototype
  Object.defineProperty(obj.prototype, 'getComputedStyle', {
    enumerable: false,
    value: function(property, $pseudo) {
      if (property === undefined)
        return getComputedStyle(this, $pseudo);
      else
        return getComputedStyle(this, $pseudo).getPropertyValue(property);
    }
  });
  Object.defineProperty(obj.prototype, 'getCS', {
    enumerable: false,
    value: obj.prototype.getComputedStyle
  });
  Object.defineProperty(obj.prototype, 'getComputedStyles', {
    enumerable: false,
    value: function($pseudo, ...properties) {
      if (properties.length)
        return (cs =>
          Object.fromEntries(properties.map(property =>
            [ property, cs.getPropertyValue(property) ]
          ))
        )(getComputedStyle(this, $pseudo));
      else
        return getComputedStyle(this, $pseudo);
    }
  });
  Object.defineProperty(obj.prototype, 'getCSs', {
    enumerable: false,
    value: obj.prototype.getComputedStyle
  });
  Object.defineProperty(obj.prototype, 'setCSS', {
    enumerable: false,
    value: function(css) {
      this.style.cssText = css._reduce((str, [ k, v ]) => `${str}${k}:${v};`, '');
      return this;
    }
  });
  Object.defineProperty(obj.prototype, 'addCSS', {
    enumerable: false,
    value: function(css) {
      this.style.cssText = `${this.style.cssText};${css._reduce((str, [ k, v ]) => `${str}${k}:${v};`, '')}`.replace(/^;/, '');
      return this;
    }
  });
  Object.defineProperty(obj.prototype, 'removeCSS', {
    enumerable: false,
    value: function(...properties) {
      properties.forEach(
        property => this.style.removeProperty(property)
      );

      return this;
    }
  });
  Object.defineProperty(obj.prototype, 'icon', {
    enumerable: false,
    value: function(icon, invert, cw = true) {
      const $icon = document.createElement('icon');
      $icon.setAttribute('type', icon);
      switch(icon) {
        case 'loading': {
          $icon.setAttribute('spin', cw ? 'cw' : 'ccw');
          $icon.setAttribute('height', 256);
          break;
        };
      }

      if (invert)
        $icon.style.filter = 'invert()';

      const { x, y, width: w, height: h } = this.getBoundingClientRect();
      $icon.style.left = `${x + w / 2 - 128}px`;
      $icon.style.top = `${y + h / 2 - 128}px`;
      $icon.style.width = $icon.style.height = `${Math.min(w, h) / 4}px`;

      return this.appendChild($icon);
    }
  });
  Object.defineProperty(obj.prototype, 'rect', {
    enumerable: false,
    value: function() {
      const rect = this.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        w: rect.width,
        height: rect.height,
        h: rect.height,
        top: rect.top,
        t: rect.top,
        right: rect.right,
        r: rect.right,
        bottom: rect.bottom,
        b: rect.bottom,
        left: rect.left,
        l: rect.left,
      };
    }
  });

  Object.defineProperty(obj.prototype, 'scrollbarWidth', {
    enumerable: false,
    value: function() {
      return this.offsetWidth - this.clientWidth;
    }
  });
  Object.defineProperty(obj.prototype, 'scrollbarHeight', {
    enumerable: false,
    value: function() {
      return this.offsetHeight - this.clientHeight;
    }
  });

  [ 'left', 'right', 'top', 'bottom' ].forEach(side => {
    const scale = side == 'left' || side == 'right' ? 'Width' : 'Height';
    const Side = side.capitalize();
    Object.defineProperty(obj.prototype, `outer${Side}`, { // pos + mar
      enumerable: false,
      value: function() { // (pos + mar)
        return this.rect()[side];
      }
    });
    Object.defineProperty(obj.prototype, `inner${Side}`, { // pos + mar + bor
      enumerable: false,
      value: function() { // (bor) + (pos + mar)
        return +this.getCS(`border-${side}-width`).replace('px', '') + this[`outer${Side}`]();
      }
    });
    Object.defineProperty(obj.prototype, `scrollbar${Side}`, { // pos + mar + bor + pad
      enumerable: false,
      value: function() { // (pos + mar + bor + srlbr + pad) - ((pos + mar + bor + srlbr + pad) - (pos + mar + bor) - (pad))
        return this[`inner${Side}`]() + +this.getCS(`padding-${side}`).replace('px', '');
      }
    });
    Object.defineProperty(obj.prototype, `content${Side}`, { // pos + mar + bor + srlbr + pad
      enumerable: false,
      value: function() { // (pos + mar + bor + pad) + (srlbr)
        return this[`scrollbar${Side}`]() + (this[`scrollbar${scale}`]);
      }
    });
  });

  Object.defineProperty(obj.prototype, 'qs', {
    enumerable: false,
    value: Element.prototype.querySelector
  });
  Object.defineProperty(obj.prototype, 'qsa', {
    enumerable: false,
    value: Element.prototype.querySelectorAll
  });
  Object.defineProperty(obj.prototype, 'getById', {
    enumerable: false,
    value: function(id) {
      return this.qs(`#${id.trim().split(/(\.|#|>|\s)/)[0]}`);
    }
  });
  Object.defineProperty(obj.prototype, 'getByTag', {
    enumerable: false,
    value: Element.prototype.getElementsByTagName
  });
  Object.defineProperty(obj.prototype, 'getByTagNS', {
    enumerable: false,
    value: Element.prototype.getElementsByTagNameNS
  });
  Object.defineProperty(obj.prototype, 'getByClass', {
    enumerable: false,
    value: Element.prototype.getElementsByClassName
  });
  Object.defineProperty(obj.prototype, 'memoryRemove', {
    enumerable: false,
    value: function() {
      if (this.parentNode) {
        this.removeAttribute('href');
        this.src = null;

        let clone = this.cloneNode(true);
        this.parentNode.replaceChild(clone, this);
        clone.parentNode.removeChild(clone);

        this.remove();
        clone.remove();
      } else
        this.remove();

      this.qsa('*')?.memRmv();
      this.setAttribute('memory-removed', true);
    },
  });
  Object.defineProperty(obj.prototype, 'memRmv', {
    enumerable: false,
    value: obj.prototype.memoryRemove
  });
  Object.defineProperty(obj.prototype, 'template', {
    enumerable: false,
    value: function(options, addToParent = true) {
      let $s = [];
      (options instanceof Array ? options : [ options ]).forEach(option => {
        if (options instanceof Element)
          $s = $s.concat(option);
        else if (typeof options == 'string')
          $s = $s.concat(this.querySelectorAll(`${options}.template`).array());
        else if (options.qs)
          $s = $s.concat(this.querySelector(`${options.qs}.template`));
        else if (options.qsa)
          $s = $s.concat(this.querySelectorAll(`${options.qsa}.template`).array());
        else if (options.id)
          $s = $s.concat(this.getElementById(options.id).filter(
            $template => $template.classList.contains('template')
          ));
        else if (options.class)
          $s = $s.concat(this.getElementsByClassName(options.class).filter(
            $template => $template.classList.contains('template')
          ));
        else if (options.tagName)
          $s = $s.concat(this.getElementsByTagName(options.tagName).filter(
            $template => $template.classList.contains('template')
          ));
      });

      $s = $s.filter(
        $template => $template instanceof Element
      ).map($template => {
        const $ = $template.cloneNode(true);
        $.classList.remove('template');

        if (addToParent == 'append')
          $template.parentElement.appendChild($);
        else if (addToParent == 'prepend')
          $template.parentElement.prependChild($);
        else if (addToParent == 'preprend_template')
          $template.parentElement.prependChild($, $template);
        else if (addToParent)
          $template.parentElement.appendChild($, $template);

        return $;
      });

      return $s.length == 1 ? $s[0] : $s;
    }
  });
  Object.defineProperty(obj.prototype, 'createElementByQs', {
    enumerable: false,
    value: function(cssPath) {
      const [ , tag, id, classes ] = cssPath.match(/(\w+)(?:#(\w+))?(?:\.([\w-]+(?:\.[\w-]+)*))?/);

      const $ = document.createElement(tag);
      if (id)
        $.id = id;
      if (classes)
        $.classList.add(...classes.split('.'));

      return $;
    }
  });
  Object.defineProperty(obj.prototype, 'prependChild', {
    enumerable: false,
    value: function($, target = 0) {
      if (!(target instanceof Node || Number.isInteger(target) || target == Infinity || target == -Infinity))
        target = 0;

      if (!($ instanceof Node || $ instanceof SVGElement)) {
        if (typeof $ == 'string')
          $ = this.createElementByQs($);
        else
          throw 'Bad Element Passed';
      }

      if (target instanceof Node || $ instanceof SVGElement) {
        this.insertBefore($, target);
      } else if (Number.isInteger(target) || target == Infinity || target == -Infinity) {
        if (target >>> 31 || target == -Infinity)
          this.insertBefore($, this.childNodes[(this.childNodes.length + target + 1).clamp(0)]);
        else
          this.insertBefore($, this.childNodes[target.clamp(undefined, this.childNodes.length - 1)]);
      }

      return $;
    }
  });
  Object.defineProperty(obj.prototype, 'appendChild', {
    enumerable: false,
    value: function($, target = Infinity) {
      if (!(target instanceof Node || Number.isInteger(target) || target == Infinity || target == -Infinity))
        target = Infinity;

      if (!($ instanceof Node || $ instanceof SVGElement)) {
        if (typeof $ == 'string')
          $ = this.createElementByQs($);
        else
          throw 'Bad Element Passed';
      }

      if (target instanceof Node || $ instanceof SVGElement)
        this.insertBefore($, target.nextSibling);
      else if (Number.isInteger(target) || target == Infinity || target == -Infinity) {
        if (target >>> 31 || target == -Infinity)
          this.insertBefore($, this.childNodes[(this.childNodes.length + ++target).clamp(0)]);
        else
          this.insertBefore($, this.childNodes[(++target).clamp(undefined, this.childNodes.length)]);
      }

      return $;
    }
  });
  Object.defineProperty(obj.prototype, 'insertChild', {
    enumerable: false,
    value: function($, target = 0) {
      if (!(target instanceof Node || Number.isInteger(target) || target == Infinity || target == -Infinity))
        target = 0;

      if (!($ instanceof Node || $ instanceof SVGElement)) {
        if (typeof $ == 'string')
          $ = this.createElementByQs($);
        else
          throw 'Bad Element Passed';
      }

      if (target instanceof Node || $ instanceof SVGElement) {
        if (target.parentNode.isEqualNode(this))
          this.replaceChild($, target);
        else
          console.error('Incorrect target level');
      } else if (Number.isInteger(target) || target == Infinity || target == -Infinity) {
        if (target >>> 31 || target == -Infinity)
          this.insertBefore($, this.childNodes[(this.childNodes.length + ++target).clamp(0)]);
        else
          this.insertBefore($, this.childNodes[target.clamp(undefined, this.childNodes.length)]);
      }

      return $;
    }
  });
  Object.defineProperty(obj.prototype, 'childIndex', {
    enumerable: false,
    value: function() {
      return [].indexOf.call(this.parentNode.children, this);
    }
  });
  Object.defineProperty(obj.prototype, 'cursorPosition', {
    enumerable: false,
    value: function(pos) {
      if (document.createRange) { // Firefox, Chrome, Opera, Safari, IE 9+
        const range = document.createRange();
        range.setStart(this.childNodes[0], pos);
        range.collapse(true);

        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (body.createTextRange) { //IE 8-
        const range = body.createTextRange();
        range.setStart(this.childNodes[0], pos);
        range.collapse(true);
        range.select();
      }
    }
  });
  Object.defineProperty(obj.prototype, 'selectAll', {
    enumerable: false,
    value: function() {
      if (document.createRange) { // Firefox, Chrome, Opera, Safari, IE 9+
        const range = document.createRange();
        range.selectNode(this);

        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (body.createTextRange) { //IE 8-
        const range = body.createTextRange();
        range.moveToElementText(this);
        range.select();
      }
    }
  });
  Object.defineProperty(obj.prototype, 'triggerEvent', {
    enumerable: false,
    value: function(name, obj) {
      this.dispatchEvent(new CustomEvent(name, obj));
    }
  });
  Object.defineProperty(obj.prototype, 'generation', {
    enumerable: false,
    value: function(y_1 = 0, y_2, all = false) {
      if (typeof y_2 == 'boolean') {
        all = y_2;
        y_2 = undefined;
      }

      const flat = y_2 === undefined;

      let $ = this;
      let min = 0;
      while (true) {
        $ = $.parentNode;
        if ($)
          min--;
        else
          break;
      }
      y_1 = y_1.max(min);
      y_2 ??= y_1;

      let max = -min + 1;
      while (true) {
        let $child = this.qs(`*${' > *'.repeat(max)}`);
        if ($child)
          max++;
        else
          break;
      }
      max += min - 1;
      y_2 = y_2.min(max);

      let $s = [];
      for (let i = y_1; i <= y_2; i++) {
        if (i < 0)
          $s.push([ new Function(`return this${'?.parentNode'.repeat(-i)};`).call(this) ]);
        else if (i == 0)
          $s.push([ this ]);
        else if (i > 0)
          $s.push($s.last().map(
            $ => $.childNodes.array()
          ).flat(Infinity));
      }

      const correction = (-y_1).max(0);
      $s = $s.filter(
        (_, i) => i + correction >= y_1
      ).map(
        $ => all ? $ : $[0]
      );

      if (flat)
        $s = all ? $s.flat(Infinity) : $s[0];

      return $s;
    }
  });
  Object.defineProperty(obj.prototype, 'gen', {
    enumerable: false,
    value: obj.prototype.generation
  });
  Object.defineProperty(obj.prototype, 'generationAll', {
    enumerable: false,
    value: function(y_1, y_2) {
      return this.generation(y_1, y_2, true);
    }
  });
  Object.defineProperty(obj.prototype, 'genAll', {
    enumerable: false,
    value: obj.prototype.generationAll
  });
  Object.defineProperty(obj.prototype, 'index', {
    enumerable: false,
    value: function() {
      return this.gen(-1).children.indexOf(this);
    }
  });
  Object.defineProperty(obj.prototype, 'i', {
    enumerable: false,
    value: obj.prototype.index
  });
  Object.defineProperty(obj.prototype, 'nodeIndex', {
    enumerable: false,
    value: function() {
      return this.gen(-1).childNodes.indexOf(this);
    }
  });
  Object.defineProperty(obj.prototype, 'ni', {
    enumerable: false,
    value: obj.prototype.nodeIndex
  });
  Object.defineProperty(obj.prototype, 'childOf', {
    enumerable: false,
    value: function($, includeSelf = false) {
      return this.genAll(-Infinity, includeSelf ? 0 : -1).flat(Infinity).some($parent => $?.isEqualNode($parent));
    }
  });
  Object.defineProperty(obj.prototype, 'parentOf', {
    enumerable: false,
    value: function($, includeSelf = false) {
      return (includeSelf && this.isEqualNode($)) || this.genAll(0, Infinity).flat(Infinity).some($child => $?.isEqualNode($child));
    }
  });
  Object.defineProperty(obj.prototype, 'getParsedComputerStyle', {
    enumerable: false,
    value: function(property, notEqualTo = 'auto') {
      return (this.gen(-Infinity, 0).reverse().find($ =>
        ($.getCS?.(property) ?? notEqualTo) != notEqualTo
      )?.getCS?.(property) ?? 0);
    },
  });
  Object.defineProperty(obj.prototype, 'getParsedCS', {
    enumerable: false,
    value: obj.prototype.getParsedComputerStyle
  });
  Object.defineProperty(obj.prototype, 'getParsedComputerStyles', {
    enumerable: false,
    value: function(...properties) {
      const notEqualTo = properties.pop() ?? 'auto';
      return properties.map(property => this.getParsedComputerStyle(property, notEqualTo));
    }
  });
  Object.defineProperty(obj.prototype, 'getParsedCSs', {
    enumerable: false,
    value: obj.prototype.getParsedComputerStyles
  });
  Object.defineProperty(obj.prototype, 'addClass', {
    enumerable: false,
    value: function(...classes) {
      this.classList.add(...classes);
    }
  });
  Object.defineProperty(obj.prototype, 'removeClass', {
    enumerable: false,
    value: function(...classes) {
      this.classList.remove(...classes);
    }
  });
  Object.defineProperty(obj.prototype, 'rmvClass', {
    enumerable: false,
    value: obj.prototype.removeClass
  });
  Object.defineProperty(obj.prototype, 'toggleClass', {
    enumerable: false,
    value: function(...classes) {
      this.classList.toggle(...classes);
    }
  });
  Object.defineProperty(obj.prototype, 'tglClass', {
    enumerable: false,
    value: obj.prototype.toggleClass
  });
  Object.defineProperty(obj.prototype, 'containsClass', {
    enumerable: false,
    value: function(...classes) {
      return this.classList.contains(...classes);
    }
  });
  Object.defineProperty(obj.prototype, 'cntsClass', {
    enumerable: false,
    value: obj.prototype.containsClass
  });
  Object.defineProperty(obj.prototype, 'hasClass', {
    enumerable: false,
    value: obj.prototype.containsClass
  });
  Object.defineProperty(obj.prototype, 'setClass', {
    enumerable: false,
    value: function(...classes) {
      const set = classes.pop();
      if (set)
        this.classList.add(...classes);
      else
        this.classList.remove(...classes);
    }
  });
  Object.defineProperty(obj.prototype, 'getAttr', {
    enumerable: false,
    value: function(attr) {
      return this.getAttribute(attr);
    }
  });
  Object.defineProperty(obj.prototype, 'getAttrs', {
    enumerable: false,
    value: function(...attrs) {
      return attrs.map(attr => this.getAttr(attr));
    }
  });
  Object.defineProperty(obj.prototype, 'setAttr', {
    enumerable: false,
    value: function(attr, v) {
      this.setAttribute(attr, v);

      return v;
    }
  });
  Object.defineProperty(obj.prototype, 'setAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      const v = attrs.pop();
      return attrs.map(attr => this.setAttr(attr, v));
    }
  });
  Object.defineProperty(obj.prototype, 'nullSetAttr', {
    enumerable: false,
    value: function(attr, v) {
      if (!this.hasAttr(attr))
        return this.setAttr(attr, v);

      return this.getAttr(attr);
    },
  });
  Object.defineProperty(obj.prototype, 'nullSetAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      const v = attrs.pop();
      return attrs.map(attr => this.nullSetAttr(attr, v));
    },
  });
  Object.defineProperty(obj.prototype, 'removeAttr', {
    enumerable: false,
    value: function(attr) {
      this.removeAttribute(attr);
      return this;
    }
  });
  Object.defineProperty(obj.prototype, 'rmvAttr', {
    enumerable: false,
    value: obj.prototype.removeAttr
  });
  Object.defineProperty(obj.prototype, 'removeAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs.forEach(attr => this.removeAttr(attr));
      return this;
    }
  });
  Object.defineProperty(obj.prototype, 'rmvAttrs', {
    enumerable: false,
    value: obj.prototype.removeAttrs
  });
  Object.defineProperty(obj.prototype, 'hasAttr', {
    enumerable: false,
    value: function(attr) {
      return this.hasAttribute(attr);
    }
  });
  Object.defineProperty(obj.prototype, 'hasAttrs', {
    enumerable: false,
    value: function(...attrs) {
      let all = attrs.pop();
      if (typeof all != 'boolean') {
        attrs.push(all);
        all = true;
      } else
        all ??= true;

      return all ? attrs.every(attr => this.hasAttr(attr)) : attrs.some(attr => this.hasAttr(attr));
    }
  });
  Object.defineProperty(obj.prototype, 'preDecrementAttr', {
    enumerable: false,
    value: function(attr, by = 1) {
      return this.setAttr(attr, this.getAttr(attr) - by);
    }
  });
  Object.defineProperty(obj.prototype, 'preDecAttr', {
    enumerable: false,
    value: obj.prototype.preDecrementAttr
  });
  Object.defineProperty(obj.prototype, 'preDecrementAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      let by = attrs.pop();
      if (typeof by != 'number') {
        attrs.push(by);
        by = 1;
      } else
        by ??= 1;

      return attrs.map(attr => this.preDecrementAttr(attr, by));
    }
  });
  Object.defineProperty(obj.prototype, 'preDecAttrs', {
    enumerable: false,
    value: obj.prototype.preDecrementAttrs
  });
  Object.defineProperty(obj.prototype, 'preIncrementAttr', {
    enumerable: false,
    value: function(attr, by = 1) {
      return this.setAttr(attr, this.getAttr(attr) + by);
    }
  });
  Object.defineProperty(obj.prototype, 'preIncAttr', {
    enumerable: false,
    value: obj.prototype.preIncrementAttr
  });
  Object.defineProperty(obj.prototype, 'preIncrementAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      let by = attrs.pop();
      if (typeof by != 'number') {
        attrs.push(by);
        by = 1;
      } else
        by ??= 1;

      return attrs.map(attr => this.preIncrementAttr(attr, by));
    }
  });
  Object.defineProperty(obj.prototype, 'preIncAttrs', {
    enumerable: false,
    value: obj.prototype.preIncrementAttrs
  });
  Object.defineProperty(obj.prototype, 'postDecrementAttr', {
    enumerable: false,
    value: function(attr, by = 1) {
      const v = this.getAttr(attr);
      this.setAttr(attr, v - by);
      return v;
    }
  });
  Object.defineProperty(obj.prototype, 'postDecAttr', {
    enumerable: false,
    value: obj.prototype.postDecrementAttr
  });
  Object.defineProperty(obj.prototype, 'postDecrementAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      let by = attrs.pop();
      if (typeof by != 'number') {
        attrs.push(by);
        by = 1;
      } else
        by ??= 1;

      return attrs.map(attr => this.postDecrementAttr(attr, by));
    }
  });
  Object.defineProperty(obj.prototype, 'postDecAttrs', {
    enumerable: false,
    value: obj.prototype.postDecrementAttrs
  });
  Object.defineProperty(obj.prototype, 'postIncrementAttr', {
    enumerable: false,
    value: function(attr, by = 1) {
      const v = this.getAttr(attr);
      this.setAttr(attr, v + by);
      return v;
    }
  });
  Object.defineProperty(obj.prototype, 'postIncAttr', {
    enumerable: false,
    value: obj.prototype.postIncrementAttr
  });
  Object.defineProperty(obj.prototype, 'postIncrementAttrs', {
    enumerable: false,
    value: function(...attrs) {
      attrs = structuredClone(attrs);

      let by = attrs.pop();
      if (typeof by != 'number') {
        attrs.push(by);
        by = 1;
      } else
        by ??= 1;

      return attrs.map(attr => this.postIncrementAttr(attr, by));
    }
  });
  Object.defineProperty(obj.prototype, 'postIncAttrs', {
    enumerable: false,
    value: obj.prototype.postIncrementAttrs
  });
});

Object.defineProperty(CanvasRenderingContext2D.prototype, 'move', {
  enumerable: false,
  value: function(...args) {
    this.moveTo(...args.flat(Infinity));
  },
});
Object.defineProperty(CanvasRenderingContext2D.prototype, 'line', {
  enumerable: false,
  value: function(...args) {
    this.lineTo(...args.flat(Infinity));
  },
});
Object.defineProperty(CanvasRenderingContext2D.prototype, 'hollowRect', {
  enumerable: false,
  value: function(...args) {
    this.strokeRect(...args.flat(Infinity));
  },
});
Object.defineProperty(CanvasRenderingContext2D.prototype, 'rect', {
  enumerable: false,
  value: function(...args) {
    this.fillRect(...args.flat(Infinity));
  },
});

Object.defineProperty(Object, 'deepMerge', {
  enumerable: false,
  value: function(target, ...sources) {
    const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);

    if (!sources.length)
      return target;

    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
      for (const k in source) {
        if (Array.isArray(source[k])) {
          if (target[k] === undefined)
            Object.assign(target, { [k]: [] });
          else if (!Array.isArray(target[k]))
            target[k] = [ target[k] ];

          target[k] = target[k].concat(source[k]);
        } else if (isObject(source[k])) {
          if (target[k] === undefined)
            Object.assign(target, { [k]: {} });

          Object.deepMerge(target[k], source[k]);
        } else
          Object.assign(target, { [k]: source[k] });
      }
    }

    return Object.deepMerge(target, ...sources);
  }
});