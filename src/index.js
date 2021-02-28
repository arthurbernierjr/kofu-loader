/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import validateOptions from 'schema-utils';

import mambascript from 'mambascript';
import loaderUtils from 'loader-utils';

import schema from './options.json';
import MambaScriptError from './MambaScriptError';

export default function loader(source) {
  const options = loaderUtils.getOptions(this);

  validateOptions(schema, options, {
    name: 'MambaScript Loader',
    baseDataPath: 'options',
  });

  const callback = this.async();
  const useSourceMap =
    typeof options.sourceMap === 'boolean' ? options.sourceMap : this.sourceMap;

  let result;

  try {
    const msAST = mambascript.parse(source, {
      ...{
        bare: true,
      },
      ...options,
      ...{
        filename: this.resourcePath,
      },
    });

    const jsAST = mambascript.compile(msAST, {
      ...{
        bare: true,
      },
      ...options,
      ...{
        filename: this.resourcePath,
      },
    });

    if (useSourceMap) {
      const code = mambascript.jsEsm(jsAST, {
        ...{
          bare: true,
        },
        ...options,
        ...{
          filename: this.resourcePath,
        },
      });
      const sourceMap = mambascript.sourceMap(jsAST, {
        ...{
          bare: true,
        },
        ...options,
        ...{
          filename: this.resourcePath,
        },
      });
      result = {
        js: code,
        v3SourceMap: sourceMap,
      };
    } else {
      result = mambascript.jsEsm(jsAST, {
        ...{
          bare: true,
        },
        ...options,
        ...{
          filename: this.resourcePath,
        },
      });
    }
  } catch (error) {
    callback(new MambaScriptError(error));

    return;
  }

  let map;

  if (useSourceMap && result.v3SourceMap) {
    map = JSON.parse(result.v3SourceMap);

    delete map.file;

    result = result.js;
  }

  callback(null, result, map);
}
