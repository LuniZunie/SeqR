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
  writeFLS_short,
  readFLS,
  readFLS_short,
  readFLSsByKey,
  readFLSsByKey_short,
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

// FLS = formatted line string
const FLS_ks = {
  line: {
    column: 0,
    shorthand: 'l',
    read: v => +v,
    write: v => v,
  },
  starts: {
    column: 1,
    shorthand: 's',
    read: v => v.split(',').map(v => +v),
    write: v => v.join(','),
  },
  start: {
    column: 1,
    shorthand: 'S',
    read: v => v.split(',').min(),
  },
  ends: {
    column: 2,
    shorthand: 'e',
    read: v => v.split(',').map(v => +v),
    write: v => v.join(','),
  },
  end: {
    column: 2,
    shorthand: 'E',
    read: v => v.split(',').max(),
  },
  group: {
    column: 3,
    def: '',
    shorthand: 'g',
    write: v => v,
  },
  parents: {
    column: 4,
    def: '',
    shorthand: 'p',
    read: v => v.split(','),
    write: v => v.join(','),
  },
  color: {
    column: 5,
    def: '',
    shorthand: 'c',
    write: v => v,
  },
  zIndex: {
    column: 6,
    def: '',
    shorthand: 'z',
    read: v => v.split(',').map(v => +v),
    write: v => v == '0' ?
      '' :
      (v instanceof Array ? v : [ v ]).join(','),
  },
}._$sort(([ , v_a ], [ , v_b ]) =>
  v_a.column - v_b.column
)._$map(([ k, v ]) =>
  [ k, v._$map(([ k, v ]) =>
    [ k, v instanceof Function || k == 'shorthand' ? v : JSON.stringify(v) ]
  ) ]
);

const FLS_ks_unique = {};
FLS_ks._reduce((taken, [ k, v ]) => {
  const column = v.column;
  if (taken.includes(column))
    return taken;

  FLS_ks_unique[k] = v;
  return taken.concat(column);
}, []);

const writeFLS = new Function(
  `{${FLS_ks_unique._map(( [ k, { def } ]) =>
    def === undefined ? k : `${k} = ${def}`
  ).join(',')}}`,
  `return \`${FLS_ks.v_map(({ write, column }) =>
    write && `\${(
      ${write.toString()}
    )(
      ${FLS_ks_unique.k_find(k => FLS_ks_unique[k].column == column)}
    )}`
  ).filter(v => v !== undefined).join(' ')}\`;`
);

const writeFLS_short = new Function(
  `{${FLS_ks_unique.v_map(({ def, shorthand }) =>
    def === undefined ? shorthand : `${shorthand} = ${def}`
  ).join(',')}}`,
  `return \`${FLS_ks.v_map(({ write, column }) =>
    write && `\${(
      ${write.toString()}
    )(
      ${FLS_ks_unique[FLS_ks_unique.k_find(k => FLS_ks_unique[k].column == column)].shorthand}
    )}`
  ).filter(v => v !== undefined).join(' ')}\`;`
);

const readFLS = new Function('str', `
  str = str.split(' ');
  return { ${FLS_ks._map(([ k, { column, read } ]) =>
    `${k}: ${read ? `(${read.toString()})(str[${column}])` : `str[${column}]`}`
  )} };
`);

const readFLS_short = new Function('str', `
  str = str.split(' ');
  return { ${FLS_ks.v_map(({ column, read, shorthand }) =>
    `${shorthand}: ${read ? `(${read.toString()})(str[${column}])` : `str[${column}]`}`
  )} };
`);

const { readFLSsByKey, readFLSsByKey_short } = (function(func) {
  return {
    readFLSsByKey: func.bind(readFLS),
    readFLSsByKey_short: func.bind(readFLS_short),
  }
})(function(str, ...kvs) {
  return str.split('\n').reduce(({ accepted, rejected }, line) => {
    const obj = this(line);
    (kvs.some(kvs_2 =>
      kvs_2._every(([ k, v ]) => {
        const obj_v = (v => v instanceof Array ? v.join(',') : v)(obj[k]);
        return (v instanceof Array ? v : [ v ]).some(v => v == obj_v);
      })
    ) ? accepted : rejected).push(obj);

    return { accepted, rejected };
  }, { accepted: [], rejected: [] });
});

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
  const metadataLocations = {};
  function MetaDataHandler(line) {
    const file = fileSaveNames.last();
    const metaDataI = metadataLocations[file.name]++;

    metadataParser.push(new Promise(async resolve => {
      const octothorpes = line.match(/^#*/)[0];
      line = line.slice(octothorpes.length).split(/\s/);

      const segments = [];
      const segmentPromises = [];
      for (const segment of line)
        segmentPromises.push(new Promise(async segmentResolve => {
          try {
            const url = new URL(segment); // make sure it's a valid url before wasting resources on it
            const obj = {
              type: 'link',
              link: url.href,
            };

            try {
              obj.text = await timedFetch(
                `https://corsproxy.io/?${encodeURIComponent(url.href)}`, {},
                1000
              ).then(res => res.text()).then(text =>
                text.match(/<title>(.*)<\/title>/)[1]
              ).catch(() =>
                `${url.hostname}${url.pathname}`.replace(/(^www\.|\/$)/g, '')
              );
            } finally {
              segmentResolve(obj);
            }
          } catch (err) {
            segmentResolve(segment);
          }
        }).then(v => segments.push(v)));

      await Promise.all(segmentPromises);

      file.metaData[metaDataI] = {
        segments: segments.reduce((arr, v) =>
          v instanceof Object ?
            arr.concat(v) :
            (function(last) {
              if (arr[last] === undefined || arr[last] instanceof Object)
                return arr.concat(v);
              else
                return arr.slice(0, last).concat(`${arr[last]} ${v}`);
            })(arr.length - 1), []
        ).filter(v => v != ''),
        label: octothorpes,
      };

      resolve('done');
    }));
  }

  const handlers = {
    gff: function(line, emptyCache, misc) {
      if (rejected)
        return;

      const clearCache = () => {
        if (cacheTotal >= global.settings.readerCacheMax || emptyCache)
          chunkCaches = chunkCaches._$filter(([ type, strand ]) =>
            void strand._forEach(([ strand, groups ]) =>
              groups._$map(([ group, v ]) => [
                group,
                v.reduce((sum, { v, l: length }) => [
                  `${sum[0]}\n${writeFLS_short(v)}`,
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
                  u: URL.newObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
                  r: range
                });

                delete chunkCaches[type][strand][group];
                if (chunkCaches[type][strand]._len() == 0) {
                  delete chunkCaches[type][strand];
                  if (chunkCaches[type]._len() == 0)
                    delete chunkCaches[type];
                }
              }
            )) || !emptyCache
          );
      };

      ++lineNum;
      if (line[0] == '#') { // comment defintions should only be at the start of the line
        MetaDataHandler(line);

        return clearCache();
      } else if (line.startsWith('browser') || line.startsWith('track'))
        return clearCache();

      let [ seqid, source, type, start, end, score, strand, phase, ...group ] = line.split(lineSplitRegExps.gff);
      if (group.length > 1 || !phase)
        return clearCache();

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

      clearCache();
    },
    gff3: function(line, emptyCache, misc) {
      if (rejected)
        return;

      reader.dir ??= {};
      reader.ref ??= {};
      const clearCache = () => {
        if (cacheTotal >= global.settings.readerCacheMax || emptyCache)
          chunkCaches = chunkCaches._$filter(([ type, caches ]) =>
            void caches._$map(([ k, v ]) => [
              k,
              v.reduce((sum, { v, l: length }) => [
                `${sum[0]}\n${writeFLS_short(v)}`,
                [
                  min(sum[1][0], v.s),
                  max(sum[1][1], v.e)
                ],
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
                u: URL.newObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
                r: range
              });

              delete chunkCaches[type][k];
              if (chunkCaches[type]._len() == 0)
                delete chunkCaches[type];
            }) || !emptyCache
          );
      };

      ++lineNum;
      if (line[0] == '#') { // comment defintions should only be at the start of the line
        MetaDataHandler(line);

        return clearCache();
      } else if (line.startsWith('browser') || line.startsWith('track'))
        return clearCache();

      let [ seqid, source, type, start, end, score, strand, phase, ...attrs ] = line.split(lineSplitRegExps.gff3);
      if (attrs.length > 1 || !phase)
        return clearCache();

      attrs = (v => v == '.' ? {} : Object.fromEntries(v?.split(';')?.map(v =>
        v.split('=')
      ) ?? []))(attrs[0]);
      const group = attrs.ID ?? '';
      const parents = attrs.Parent?.split(',');

      if (group != '' && parents)
        parents.forEach(parent => {
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

      clearCache();
    },
    bed: function(line, emptyCache, misc) {
      if (rejected)
        return;

      const clearCache = () => {
        if (cacheTotal >= global.settings.readerCacheMax || emptyCache)
          chunkCaches = chunkCaches._$filter(([ chrom, caches ]) =>
            void caches._$map(([ k, v ]) => [
              k,
              v.reduce((sum, { v, l: length }) => [
                `${sum[0]}\n${writeFLS_short(v)}`,
                [
                  min(sum[1][0], v.s),
                  max(sum[1][1], v.e)
                ],
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
                u: URL.newObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(),
                r: range
              });

              delete chunkCaches[chrom][k];
              if (chunkCaches[chrom]._len() == 0)
                delete chunkCaches[chrom];
            }) || !emptyCache
          );
      }

      ++lineNum;
      if (line[0] == '#') { // comment defintions should only be at the start of the line
        MetaDataHandler(line);

        return clearCache();
      } else if (line.startsWith('browser') || line.startsWith('track'))
        return clearCache();

      let [ chrom, start, end, name, score, strand, thickStart, thickEnd, rgb, blockCount, blockSizes, blockStarts ] = line.split(lineSplitRegExps.bed);
      if (!chrom || !start || !end)
        return clearCache();

      const length = start?.length + end?.length + blockCount?.length + blockSizes?.length + blockStarts?.length + (++evalLineNum).toString().length + 6;

      const numify = str => str == '.' ? undefined : +str;
      (start = numify(start)), (end = numify(end)), (blockCount = numify(blockCount) || 0);
      if ((blockSizes?.match(/,/).length + 1) || 0 != blockCount || (blockStarts?.match(/,/).length + 1) || 0 != blockCount)
        return clearCache();

      if (start < global.dataRange[0])
        global.dataRange[0] = start;
      if (end > global.dataRange[1])
        global.dataRange[1] = end;

      cacheTotal += length;

      const [ b_s, b_e ] = blockCount ?
        ((starts, sizes) =>
          [ starts, sizes.map((v, i) => v + starts[i]) ]
        )(blockStarts.split(',').map(v => +v), blockSizes.split(',').map(v => +v)) :
        [ undefined, undefined ];

      chunkCaches[chrom] ??= {};
      chunkCaches[chrom][strand] ??= [];

      chunkCaches[chrom][strand].push({ v: {
        l: evalLineNum,
        s: b_s || [ start ],
        e: b_e || [ end ],
        c: rgb,
      }, l: length });

      clearCache();
    }
  };

  const postHandlers = {
    gff: async function(chunks) {
      const chunksTemp = {};
      for (const [ type, strands ] of chunks._ens()) {
        chunksTemp[type] = {};
        for (const [ strand, groups ] of strands._ens()) {
          chunksTemp[type][strand] = [];

          let lines = [];
          let range = [ Infinity, -Infinity ];
          let cacheLength = 0;
          for (const [ group, vs ] of groups._ens()) {
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
                abort(err) { console.error(err); },
              });

              const blob = await fetch(url, { cache: 'no-store' }).then(r => r.blob());

              const stream = blob.stream();
              await stream.pipeTo(write);

              URL.deleteObjectURL(url);
            }
            poses.sort((a, b) => a[0] - b[0]);

            const fullLine = writeFLS_short(minLine, poses[0], poses[1], group);
            lines.push(fullLine);
            cacheLength += fullLine.length;

            if (cacheLength >= global.settings.readerCacheMax) {
              cacheLength = 0;
              chunksTemp[type][strand].push({
                u: URL.newObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
                r: range
              });

              lines = [];
              range = [ Infinity, -Infinity ];
            }
          }

          if (lines.length)
            chunksTemp[type][strand].push({
              u: URL.newObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
              r: range
            });
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
      reader.dir = reader.dir._$map(([ k, v ]) => construction(k, v, undefined, 1));

      reader.ref = reader.ref._$map(([ k, v ]) => {
        if (v.z === undefined) {
          v.z = 0;
          v.o = v.o._$map(([ this_k, this_v ]) => construction(this_k, this_v, k, v.z + 1));
        }

        return [ k, v ];
      });

      reader.ref._forEach(([ k, v ]) => {
        if (v.z == 0)
          reader.dir[k] = {
            z: 1,
            o: v.o
          }
      });

      //const simplify = ([ k, v ]) => [ k, v.o?._$map(simplify) ];

      const chunksTemp = {};
      for (const [ type, strands ] of chunks._ens()) {
        chunksTemp[type] = {};
        for (const [ strand, vs ] of strands._ens()) {
          chunksTemp[type][strand] = [];
          const testGroup = async (group, full) => {
            let accepted = [];
            let rejected = [];

            let range = [ Infinity, -Infinity ];
            let cacheLength = 0;
            for (const v of vs) {
              range = [ min(range[0], v.r[0]), max(range[1], v.r[1]) ];

              let fullChunk = '';
              const decoder = new TextDecoder();
              const write = new WritableStream({
                write(chunk) {
                  fullChunk += decoder.decode(chunk);
                },
                close() {
                  let { accepted: thisAccepted, rejected: thisRejected } = readFLSsByKey(fullChunk, group ?
                    { group } :
                    flat.k_map(group => { return { group }; })
                  );

                  if ((group || full) && thisAccepted)
                    accepted = accepted.concat(thisAccepted);

                  if (thisRejected) {
                    if (!group && !full) {
                      thisRejected = thisRejected.map(v => {
                        const flatObj = flat[v.group];

                        return writeFLS({
                          ...v,
                          parents: flatObj?.map(v => v.p).flat(),
                          zIndex: flatObj?.map(v => v.z).flat()
                        });
                      });
                      rejected = rejected.concat(thisRejected);

                      cacheLength += thisRejected.join('\n').length;
                      if (cacheLength >= global.settings.readerCacheMax) {
                        cacheLength = 0;
                        chunksTemp[type][strand].push({
                          u: URL.newObjectURL(new Blob([ rejected.join('\n') ])).replace('blob:',' ').trim(),
                          r: range
                        });

                        thisRejected = [];
                        range = [ Infinity, -Infinity ];
                      }
                    } else if (full)
                      rejected = rejected.concat(thisRejected);
                  }
                },
                abort(err) { console.error(err); },
              });

              const blob = await fetch(`blob:${v.u}`, { cache: 'no-store' }).then(r => r.blob());

              const stream = blob.stream();
              await stream.pipeTo(write);
            }

            return full ?
              { accepted, rejected } :
              (group ? { accepted } : { lines: rejected, range, cacheLength });
          }

          let { lines, range, cacheLength } = await testGroup();
          for (const [ group, groups ] of flat._ens()) {
            const { accepted } = await testGroup(group);
            if (accepted.length) {
              const starts = accepted.map(v => v.starts).flat();
              const ends = accepted.map(v => v.ends).flat();
              range = [ min(range[0], ...starts), max(range[1], ...ends) ];

              void (function(line) {
                lines.push(line);
                cacheLength += line.length;
              })(writeFLS({
                line: accepted.map(v => v.line).min(),
                starts: accepted.map(v => v.starts).flat(),
                ends: accepted.map(v => v.ends).flat(),
                group,
                parents: groups.map(v => v.p),
                zIndex: groups.map(v => v.z),
              }));

              if (cacheLength >= global.settings.readerCacheMax) {
                cacheLength = 0;
                chunksTemp[type][strand].push({
                  u: URL.newObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
                  r: range
                });

                lines = [];
              }
            }
          }

          if (lines.length)
            chunksTemp[type][strand].push({
              u: URL.newObjectURL(new Blob([ lines.join('\n') ])).replace('blob:',' ').trim(),
              r: range
            });

          for (const { u } of vs)
            URL.deleteObjectURL(`blob:${u}`);
        }
      }

      return chunksTemp;
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
        metadataLocations[file.name] = 0;

        void (function($file) {
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
        // console.profile(file.name);

        const stream = file.stream();
        await stream.pipeTo(streamHandler);

        console.timeEnd(file.name);
        // console.profileEnd(file.name);
      }

      resolve({ type: 'done', data: { fileSaveNames } });
    }

    resolve({ type: 'cancel', data: { fileSaveNames } });
  }).then(async ({ type, data: { fileSaveNames }}) => {
    body.qsa('.file_reader_notification')?.memRmv();
    body.qs('body > .top > .import.button').rmvClass('cancel');

    switch (type) {
      case 'done': {
        await Promise.all(metadataParser);

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