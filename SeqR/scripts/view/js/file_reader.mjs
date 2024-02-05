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

import * as globalExports from '../../global/js/global.mjs';
Object.entries(globalExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

import * as mainExports from './main.mjs';
Object.entries(mainExports).forEach(
  ([ name, exported ]) => window[name] = exported
);

export {
  writeFLS,
  readFLS,
  FileReader,
  testFileReader,
};

const extensions = {
  gff: 'gff3',
  gff2: 'gff',
  gff3: 'gff3',
  gft: 'gff?gft',
  bed: 'bed',
  bed3: 'bed',
  bed4: 'bed',
  bed5: 'bed',
  bed6: 'bed',
  bed9: 'bed',
  bed12: 'bed',
  genome: 'bed',
};
body.qs('body > .top > input[type="file"]')?.setAttr('accept', extensions.k_map(k => `.${k}`).join(','));

// fls = formatted line string

function writeFLS({ l: line, s: starts, e: ends, g: group = '', p: parents = '', c: color = '', z: zIndex = '' }) {
  return `${line} ${starts.min()} ${ends.max()} ${starts.join(',')} ${ends.join(',')} ${group} ${parents.join(',')} ${color} ${zIndex}`;
}

function readFLS(str) {
  return Object.fromEntries(str.split(' ').map((v, i) => {
    const obj = [
      [ 'line', (v => +v) ],
      [ 'start', (v => +v) ],
      [ 'end', (v => +v) ],
      [ 'starts', (str => str.split(',').map(v => +v)) ],
      [ 'ends', (str => str.split(',').map(v => +v)) ],
      'group',
      [ 'parents', (str => str.split(',')) ],
      'color',
      'zIndex',
    ][i];

    if (typeof obj == 'string')
      return [ obj, v ];
    else
      return [ obj[0], obj[1](v) ];
  }));
}

function testFileReader(str, extension = 'gff') {
  const file = new Blob([ str ], { type: 'text/plain' });
  file.name = `test.${extension}`;

  FileReader({ files: [ file ] });
}

/**
 * Asynchronously reads and processes files.
 *
 * @param {Event} e - The event object containing the selected files.
 * @returns {Promise<void>} - A promise that resolves when the file reading and processing is complete.
 */
async function FileReader(e) {
  body.qs('body > .top > .import.button').addClass('cancel');

  const lineSplitRegExps = {
    gff: new RegExp(/(?<=\S)\t(?=\S)/),
    gff3: new RegExp(/(?<=\S)\t(?=\S)/),
    bed: new RegExp(/(?<=\S)\t(?=\S)/),
  };

  const reader = {};

  let chunks = {};

  let chunkCaches = {};
  let cacheTotal = 0;

  let lineNum = 0;
  let evalLineNum = 0;

  let rejected;

  let fileSaveNames = [];

  const metadataParser = [];
  const handlers = {
    /**
     * Handler for .gff/.gff2 files.
     * @param {String} line - The line to process.
     */
    gff: function(line, emptyCache, misc) {
      if (rejected)
        return;

      ++lineNum;
      if (line[0] == '#') { // comment defintions should only be at the start of the line
        if (line[1] == '#' && line[2] != '#' && line.trim() != '##') { // meta-data
          const metadataParser_id = metadataParser.length;
          metadataParser.push(false);
          new Promise(async r => {
            line = line.slice(2).split(/\s/);
            const segments = [];
            for (const segment of line) {
              await new Promise(async r => {
                try {
                  const url = new URL(segment).href; // make sure it's a valid url
                  const obj = {
                    type: 'link',
                    link: segment,
                  };

                  try {
                    obj.text = (await timedFetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {}, 1000).then(res =>
                      res.text()
                    )).match(/<title>(.*)<\/title>/)[1];
                  } finally {
                    r(obj);
                  }
                } catch (err) {
                  r(segment);
                }
              }).then(v => segments.push(v));
            }

            fileSaveNames.last().metaData.push(segments.reduce((arr, v) =>
              v instanceof Object ?
                arr.concat(v) :
                (function(last) {
                  if (arr[last] === undefined || arr[last] instanceof Object)
                    return arr.concat(v);
                  else
                    return arr.slice(0, last).concat(`${arr[last]} ${v}`);
                })(arr.length - 1), []
            ).filter(v => v != ''));

            r('done');
          }).then(v => metadataParser[metadataParser_id] = true);
        }

        return;
      } else if (line.startsWith('browser') || line.startsWith('track'))
        return;

      let [ seqid, source, type, start, end, score, strand, phase, ...group ] = line.split(lineSplitRegExps.gff);
      if (group.length > 1 || !phase)
        return;

      group = (v =>
        misc == 'gft' ?
          v.match(/(?<=[(^ )(; )]transcript_id ")[^(";)]*/)?.[0] :
          v
      )((v => v == '.' ? '' : v)(group[0])) ?? '';

      const length = start.length + end.length + (++evalLineNum).toString().length + 2;

      const numify = str => str == '.' ? undefined : +str;
      (start = numify(start)), (end = numify(end));

      if (start < global.dataRange[0])
        global.dataRange[0] = start;
      if (end > global.dataRange[1])
        global.dataRange[1] = end;

      cacheTotal += length;

      chunkCaches[type] ??= {};
      chunkCaches[type][strand] ??= {};
      chunkCaches[type][strand][group] ??= [];

      chunkCaches[type][strand][group].push({ v: {
        l: evalLineNum,
        s: [ start ],
        e: [ end ],
      }, l: length });

      if (cacheTotal >= global.settings.readerCacheMax || emptyCache)
        chunkCaches = chunkCaches._$filter(([ type, strand ]) =>
          void(strand._forEach(([ strand, groups ]) =>
            groups._$map(([ group, v ]) => [
              group,
              v.reduce((sum, { v, l: length }) => [
                `${sum[0]}\n${writeFLS(v)}`,
                [ min(sum[1][0], v.s), max(sum[1][1], v.e) ],
                sum[2] + length
              ], [ '', [ Infinity, -Infinity ], 0 ])
            ])._sort(([ , v_a ], [ , v_b ]) =>
              v_b[2] - v_a[2]
            ).forEach(([ group, [ v, range, len ] ]) => {
              if (!emptyCache && cacheTotal <= global.settings.readerCacheMin)
                return;

              cacheTotal -= len;

              chunks[type] ??= {};
              chunks[type][strand] ??= {};
              chunks[type][strand][group] ??= [];

              chunks[type][strand][group].push({
                u: URL.createObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
                r: range
              });

              delete chunkCaches[type][strand][group];
              if (chunkCaches[type][strand]._len() == 0) {
                delete chunkCaches[type][strand];
                if (chunkCaches[type]._len() == 0)
                  delete chunkCaches[type];
              }
            }
          ))) || !emptyCache
        )
    },
    gff3: function(line, emptyCache, misc) {
      reader.dir ??= {};
      reader.ref ??= {};
      if (rejected)
        return;

      ++lineNum;
      if (line[0] == '#') { // comment defintions should only be at the start of the line
        if (line[1] == '#' && line[2] != '#' && line.trim() != '##') { // meta-data
          const metadataParser_id = metadataParser.length;
          metadataParser.push(false);
          new Promise(async r => {
            line = line.slice(2).split(/\s/);
            const segments = [];
            for (const segment of line) {
              await new Promise(async r => {
                try {
                  const url = new URL(segment).href; // make sure it's a valid url
                  const obj = {
                    type: 'link',
                    link: segment,
                  };

                  try {
                    obj.text = (await timedFetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {}, 1000).then(res => res.text()
                    )).match(/<title>(.*)<\/title>/)[1];
                  } finally {
                    r(obj);
                  }
                } catch (err) {
                  r(segment);
                }
              }).then(v => segments.push(v));
            }

            fileSaveNames.last().metaData.push(segments.reduce((arr, v) =>
              v instanceof Object ?
                arr.concat(v) :
                (function(last) {
                  if (arr[last] === undefined || arr[last] instanceof Object)
                    return arr.concat(v);
                  else
                    return arr.slice(0, last).concat(`${arr[last]} ${v}`);
                })(arr.length - 1), []
            ).filter(v => v != ''));

            r('done');
          }).then(v => metadataParser[metadataParser_id] = true);
        }

        return;
      } else if (line.startsWith('browser') || line.startsWith('track'))
        return;

      let [ seqid, source, type, start, end, score, strand, phase, ...attrs ] = line.split(lineSplitRegExps.gff3);
      if (attrs.length > 1 || !phase)
        return;

      attrs = (v => v == '.' ? {} : Object.fromEntries(v?.split(';')?.map(v => v.split('=')) ?? []))(attrs[0]);
      const group = attrs.ID ?? '';
      const parents = attrs.Parent;

      if (group != '' && parents != '')
        parents?.split(',').forEach(parent => {
          if (parent == '') {
            reader.ref[group] ??= { o: {} };
            reader.dir[group] = reader.ref[group];
          } else if (reader.ref[parent] === undefined) {
            reader.ref[parent] = { o: {} };
            reader.ref[parent].o[group] = reader.ref[group] ??= { o: {} };
          } else {
            reader.ref[parent].o[group] = reader.ref[group] ??= { o: {} };
          }
        });

      const length = start.length + end.length + (++evalLineNum).toString().length + 2;

      const numify = str => str == '.' ? undefined : +str;
      (start = numify(start)), (end = numify(end));

      if (start < global.dataRange[0])
        global.dataRange[0] = start;
      if (end > global.dataRange[1])
        global.dataRange[1] = end;

      cacheTotal += length;

      chunkCaches[type] ??= {};
      chunkCaches[type][strand] ??= [];

      chunkCaches[type][strand].push({ v: {
        l: evalLineNum,
        s: [ start ],
        e: [ end ],
        g: group,
        p: parents,
      }, l: length });

      if (cacheTotal >= global.settings.readerCacheMax || emptyCache) {
        chunkCaches = chunkCaches._$filter(([ type, caches ]) =>
          void(caches._$map(([ k, v ]) => [
            k,
            v.reduce((sum, { v, l: length }) => [
              `${sum[0]}\n${writeFLS(v)}`,
              [ min(sum[1][0], v.s), max(sum[1][1], v.e) ],
              sum[2] + length
            ], [ '', [ Infinity, -Infinity ], 0 ])
          ])._sort(([ , v_a ], [ , v_b ]) =>
            v_b[2] - v_a[2]
          ).forEach(([ k, [ v, range, len ] ]) => {
            if (!emptyCache && cacheTotal <= global.settings.readerCacheMin)
              return;

            cacheTotal -= len;

            chunks[type] ??= {};
            chunks[type][k] ??= [];

            chunks[type][k].push({
              u: URL.createObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
              r: range
            });

            delete chunkCaches[type][k];
            if (chunkCaches[type]._len() == 0)
              delete chunkCaches[type];
          })) || !emptyCache
        );
      }
    },
    bed: function(line, emptyCache, misc) {
      if (rejected)
        return;

      ++lineNum;
      if (line[0] == '#' || line.startsWith('browser') || line.startsWith('track')) // comment defintions should only be at the start of the line
        return

      let [ chrom, start, end, name, score, strand, thickStart, thickEnd, rgb, blockCount, blockSizes, blockStarts ] = line.split(lineSplitRegExps.bed);

      const length = start.length + end.length + blockCount.length + blockSizes.length + blockStarts.length + (++evalLineNum).toString().length + 6;

      const numify = str => str == '.' ? undefined : +str;
      (start = numify(start)), (end = numify(end)), (blockCount = numify(blockCount));
      if (blockSizes.match(/,/).length + 1 != blockCount || blockStarts.match(/,/).length + 1 != blockCount)
        return;

      if (start < global.dataRange[0])
        global.dataRange[0] = start;
      if (end > global.dataRange[1])
        global.dataRange[1] = end;

      cacheTotal += length;

      const [ b_s, b_e ] = blockCount ? (function(starts, sizes) {
        return [ starts, sizes.map((v, i) => v + starts[i]) ];
      })(blockStarts.split(',').map(v => +v), blockSizes.split(',').map(v => +v)) : [ undefined, undefined ];

      chunkCaches[chrom] ??= {};
      chunkCaches[chrom][strand] ??= [];

      chunkCaches[chrom][strand].push({ v: {
        l: evalLineNum,
        s: b_s || [ start ],
        e: b_e || [ end ],
        c: rgb,
      }, l: length });

      if (cacheTotal >= global.settings.readerCacheMax || emptyCache)
        chunkCaches = chunkCaches._$filter(([ chrom, caches ]) =>
          void(caches._$map(([ k, v ]) => [
            k,
            v.reduce((sum, { v, l: length }) => [
              `${sum[0]}\n${writeFLS(v)}`,
              [ min(sum[1][0], v.s), max(sum[1][1], v.e) ],
              sum[2] + length
            ], [ '', [ Infinity, -Infinity ], 0 ])
          ])._sort(([ , v_a ], [ , v_b ]) =>
            v_b[2] - v_a[2]
          ).forEach(([ k, [ v, range, len ] ]) => {
            if (!emptyCache && cacheTotal <= global.settings.readerCacheMin)
              return;

            cacheTotal -= len;

            chunks[chrom] ??= {};
            chunks[chrom][k] ??= [];

            chunks[chrom][k].push({
              u: URL.createObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
              r: range
            });

            delete chunkCaches[chrom][k];
            if (chunkCaches[chrom]._len() == 0)
              delete chunkCaches[chrom];
          })) || !emptyCache
        );
    }
  };

  const postHandlers = {
    gff: async function(chunks) {
      const chunksTemp = {};
      for (const [ type, strands ] of Object.entries(chunks)) {
        chunksTemp[type] = {};
        for (const [ strand, groups ] of Object.entries(strands)) {
          chunksTemp[type][strand] = [];

          let lines = [];
          let range = [ Infinity, -Infinity ];
          let cacheLength = 0;
          for (const [ group, vs ] of Object.entries(groups)) {
            let minLine = Infinity;
            let poses = [ [], [] ];
            for (const v of vs) {
              const url = `blob:${v.u}`;
              range = [ min(range[0], v.r[0]), max(range[1], v.r[1]) ];

              let fullChunk = '';
              const decoder = new TextDecoder();
              const write = new WritableStream({
                write(chunk) {
                  fullChunk += decoder.decode(chunk);
                },
                close() {
                  const obj = fullChunk.split(/\n/).reduce(({ minLine, poses: [ allStarts, allEnds ] }, line) => {
                    const { line: lineNumber, starts, ends } = readFLS(line);

                    return {
                      minLine: min(minLine, lineNumber),
                      poses: [ allStarts.concat(starts.map(v => +v)), allEnds.concat(ends.map(v => +v)) ]
                    }
                  }, { minLine, poses });

                  minLine = obj.minLine;
                  poses = obj.poses;
                },
                abort(err) {
                  console.error(err);
                },
              });

              const blob = await fetch(url, { cache: 'no-store' }).then(r => r.blob());

              const stream = blob.stream();
              await stream.pipeTo(write);

              URL.revokeObjectURL(url);
            }
            poses.sort((a, b) => a[0] - b[0]);

            const fullLine = writeFLS(minLine, poses[0], poses[1], group);
            lines.push(fullLine);
            cacheLength += fullLine.length;

            if (cacheLength >= global.settings.readerCacheMax) {
              cacheLength = 0;
              chunksTemp[type][strand].push({
                u: URL.createObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
                r: range
              });

              lines = [];
              range = [ Infinity, -Infinity ];
            }
          }

          if (lines.length) {
            chunksTemp[type][strand].push({
              u: URL.createObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
              r: range
            });
          }
        }
      }

      return chunksTemp;
    },
    gff3: async function(chunks) {
      const flat = {};
      const construction = (k, ...params) => {
        const constructed = construct(k, ...params);
        flat[k] ??= [];
        flat[k].push({ p: constructed[1].p, z: constructed[1].z });
        return constructed;
      };
      const construct = (k, v, p, z) => {
        if (p)
          v.p = p;

        v.z = z;
        if (v.o._len())
          return [ k, {
            ...v,
            o: v.o._$map(([ this_k, this_v ]) => construction(this_k, this_v, k, v.z + 1))
          }];

        return [ k, { z, p } ];
      };
      reader.dir = reader.dir._$map(([ k, v ]) => construction(k, v, undefined, 0));

      reader.ref = reader.ref._$map(([ k, v ]) => {
        if (v.z === undefined) {
          v.z = -1;
          v.o = v.o._$map(([ this_k, this_v ]) => construction(this_k, this_v, k, v.z + 1));
        }

        return [ k, v ];
      });

      reader.ref._forEach(([ k, v ]) => {
        if (v.z == -1)
          reader.dir[k] = {
            z: 0,
            o: v.o
          }
      });

      console.log(reader.dir);

      const simplify = ([ k, v ]) => [ k, v.o?._$map(simplify) ];

      console.log(flat)
    }
  };

  await new Promise(async (resolve) => {
    body.qs('.top > .import').onclick = function() {
      resolve({ type: 'cancel', data: { fileSaveNames } });
    };

    const $notif = body.appendChild('notification');
    $notif.addClass('file_reader_notification');

    const files = e?.files ?? this.files;
    if (files?.length) {
      const decoder = new TextDecoder();
      for (const file of files) {
        const extension = parseExtension(file.name.splitOnLast('.')[1]);
        if (!extension) {
          body.qsa('.bad_extension_warning').memRmv();

          const $warning = body.appendChild('notification');
          $warning.addClass('bad_extension_warning');
          $warning.innerHTML = `File <code>${file.name}</code> is not a supported extension!<br><br>Supported Extensions: ${extensions.k_map(k =>
            `<code>.${k}</code>`
          ).join(', ')}`;

          setTimeout(() => {
            $warning.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
            page.events.add($warning, 'notification');
          }, 5000);

          return resolve({ type: 'cancel', data: { fileSaveNames } });
        }
      }

      for (const file of files) {
        if (rejected)
          return;

        const extension = file.name.splitOnLast('.')[1];
        const processExtension = parseExtension(extension).split('?');

        let name = file.name;
        for (let i = 2; global.data[name];)
          name = `${file.name} (${i++})`;

        fileSaveNames.push({ name, metaData: [] });

        (function($file) {
          $file.setAttr('raw-name', file.name);
          $file.setAttr('process-name', name);

          $file.setAttr('raw-extension', extension);
          $file.setAttr('process-extension', processExtension);

          $file.innerText = name;
          $file.cursorPosition(0);

          LoadEvents($file);
        })(body.qs('body > .top > .files').template('.file', 'append'));

        $notif.innerHTML = 'Starting data stream...';

        lineNum = 0;
        evalLineNum = 0;

        let lastLine = '';
        const streamHandler = new WritableStream({
          start(controller) {
            $notif.innerHTML = 'Data stream started...';
          },
          async write(chunk, controller) {
            if (rejected)
              return;

            chunk = decoder.decode(chunk).split(/\n/);

            chunk[0] = lastLine + chunk[0];
            lastLine = chunk.pop();

            chunk.forEach(v => handlers[processExtension[0]](v, false, processExtension[1]));
            chunk = null;

            await new Promise(async r => {
              requestIdleCallback(r);

              $notif.innerHTML = `Reading${Array.from({ length: (Date.now() % 2000) / 500 << 0 }, () => '.').join('')}<br><br>(Line: ${lineNum})`;
            });
          },
          async close() {
            if (rejected)
              return;

            handlers[processExtension[0]](lastLine, true, processExtension[1]);
            if (postHandlers[processExtension[0]])
              chunks = await postHandlers[processExtension[0]](chunks);

            console.log(chunks);
            global.data[name] = chunks;
          },
          abort(reason) {
            if (!rejected)
              resolve({ type: 'cancel', data: { fileSaveNames } });
          },
        });

        console.time(file.name);
        console.profile(file.name);

        const stream = file.stream();
        await stream.pipeTo(streamHandler);

        console.timeEnd(file.name);
        console.profileEnd(file.name);
      }

      resolve({ type: 'done', data: { fileSaveNames } });
    }

    resolve({ type: 'cancel', data: { fileSaveNames } });
  }).then(async ({ type, data: { fileSaveNames }}) => {
    body.qsa('.file_reader_notification')?.memRmv();
    body.qs('body > .top > .import.button').rmvClass('cancel');

    switch (type) {
      case 'done': {
        while (metadataParser.some(v => !v))
          await new Promise(r => requestIdleCallback(r));

        fileSaveNames.forEach(
          ({ name, metaData }) => (function($file) {
            $file.setAttr('metadata', JSON.stringify(metaData));
            $file.rmvClass('hide');
          })(body.qs(`body > .top > .files > .file:not(.template)[process-name='${name}']`))
        );
        break;
      } case 'cancel':
      default: {
        rejected = true;
        fileSaveNames.forEach(({ name }) => {
          delete global.data[name];
          body.qs(`body > .top > .files > .file:not(.template)[process-name='${name}']`)?.memRmv();
        });
        break;
      }
    }
  });
}

function parseExtension(str) {
  return extensions[str.toLowerCase()];
}

function test() {
  const list = [
    {id: 9,parent:7},
    {id: 5,parent:4},
    {id: 3,parent:2},
    {id: 4,parent:2},
    {id: 1},
    {id: 2,parent:1},
    {id: 6,parent:2},
    {id: 7,parent:8}
  ];

  const reader = {
    dir: {},
    ref: {}
  };

  list.forEach(({ id, parent }) => {
    if (parent === undefined) {
      reader.ref[id] ??= { o: {} };
      reader.dir[id] = reader.ref[id];
    } else if (reader.ref[parent] === undefined) {
      reader.ref[parent] = { o: {} };
      reader.ref[parent].o[id] = reader.ref[id] ??= { o: {} };
    } else
    reader.ref[parent].o[id] = reader.ref[id] ??= { o: {} };
  });

  const func = (k, v, p, z) => {
    if (p)
      v.p = p;

    v.z = z;
    if (v.o._len())
      return [ k, {
        ...v,
        o: v.o._$map(([ this_k, this_v ]) =>
          func(this_k, this_v, k, v.z + 1)
        )
      }];

    return [ k, v ];
  };
  reader.dir = reader.dir._$map(([ k, v ]) => func(k, v, undefined, 0));

  reader.ref = reader.ref._$map(([ k, v ]) => {
    if (v.z === undefined) {
      v.z = -1;
      v.o = v.o._$map(([ this_k, this_v ]) =>
        func(this_k, this_v, k, 1)
      );
    }

    return [ k, v ];
  });

  reader.ref._forEach(([ k, v ]) => {
    if (v.z == -1)
      reader.dir[k] = {
        z: 0,
        o: v.o
      }
  });

  console.log(reader.dir);
}
test();