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
  FileReader
};

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
  };

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
     * Handler for .gff/.gft/.gff3 files.
     * @param {String} line - The line to process.
     */
    gff: function(line) {
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
                    obj.text = (await timedFetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {}, 1000).then(
                      res => res.text()
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
            ).filter(
              v => v != ''
            ));
            console.log(fileSaveNames.last().metaData.last());

            r('done');
          }).then(
            v => metadataParser[metadataParser_id] = true
          );
        }

        return;
      }

      let [ seqid, source, type, start, end, score, strand, phase, ...attrs ] = line.split(lineSplitRegExps.gff);

      if (attrs.length > 1 || !phase)
        return;

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
      chunkCaches[type][strand].push({ v: { s: start, e: end, n: evalLineNum }, l: length });

      if (cacheTotal >= global.settings.readerCacheMax)
        chunkCaches._forEach(
          ([ type, caches ]) => caches._$map(
            ([ k, v ]) => [ k, v.reduce((sum, { v: { s, e, n }, l }) => [ // function
              `${sum[0]}\n${n} ${s} ${e}`,
              [ min(sum[1][0], s), max(sum[1][1], e) ],
              sum[2] + l ],
              [ '', [ Infinity, -Infinity ], 0 ] // start value
            ) ]
          )._sort(
            ([ , v_a ], [ , v_b ]) => v_b[2] - v_a[2]
          ).forEach(([ k, [ v, range, len ] ]) => {
            if (cacheTotal <= global.settings.readerCacheMin)
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
          })
        )
    }
  };

  const emptyCache = {
    /**
     * Clears cache .gff/.gft/.gff3 files.
     */
    gff: function() {
      cacheTotal = 0;
      chunkCaches = chunkCaches._$filter(
        ([ type, caches ]) => void(caches._$map(
          ([ k, v ]) => [ k, v.reduce((sum, { v: { s, e, n } }) => [ // function
            `${sum[0]}\n${n} ${s} ${e}`,
            [ min(sum[1][0], s), max(sum[1][1], e) ] ],
            [ '', [ Infinity, -Infinity ] ] // start value
          ) ]
        )._$filter(([ k, [ v, range ] ]) => {
          chunks[type] ??= {};
          chunks[type][k] ??= [];
          chunks[type][k].push({
            u: URL.createObjectURL(new Blob([ v.slice(1) ])).replace('blob:',' ').trim(), // u = url
            r: range
          });

          return;
        }))
      );
    },
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
        if (![ 'gff' ].includes(extension)) {
          body.qsa('.bad_extension_warning').memRmv();

          const $warning = body.appendChild('notification');
          $warning.addClass('bad_extension_warning');
          $warning.innerHTML = `File <code>${file.name}</code> is not a supported extension!<br><br>Supported Extensions: <code>.gff</code>, <code>.gft</code>, <code>.gff3</code>`;

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
        const processExtension = parseExtension(extension);

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

            switch (processExtension) {
              case 'gff': {
                chunk.forEach(handlers.gff);
                break;
              } default: {
                body.qsa('.bad_extension_warning').memRmv();

                const $warning = body.appendChild('notification');
                $warning.addClass('bad_extension_warning');
                $warning.innerHTML = `File <code>${file.name}</code> is not a supported extension!<br><br>Supported Extensions: <code>.gff</code>, <code>.gft</code>, <code>.gff3</code>`;

                setTimeout(() => {
                  $warning.style.animation = 'NotificationOut 500ms ease-in 0s 1 normal forwards';
                  events.add($warning, 'notification');
                  $warning.memRmv();
                }, 5000);

                return resolve({ type: 'cancel', data: { fileSaveNames } });
              }
            }
            chunk = null;

            await new Promise(async r => {
              requestIdleCallback(r);

              $notif.innerHTML = `Reading${Array.from({ length: (Date.now() % 2000) / 500 << 0 }, () => '.').join('')}<br><br>(Line: ${lineNum})`;
            });
          },
          close() {
            if (rejected)
              return;

            handlers.gff(lastLine);
            emptyCache.gff();

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
          })(body.qs(`body > .top > .files > .file:not(.template)[raw-name='${name}']`))
        );
        break;
      } case 'cancel':
      default: {
        rejected = true;
        fileSaveNames.forEach(({ name }) => {
          delete global.data[name];
          body.qs(`body > .top > .files > .file:not(.template)[raw-name='${name}']`)?.memRmv();
        });
        break;
      }
    }
  });
}

function parseExtension(str) {
  return {
    gff: 'gff',
    gft: 'gff',
    gff3: 'gff',
  }[str.toLowerCase()];
}