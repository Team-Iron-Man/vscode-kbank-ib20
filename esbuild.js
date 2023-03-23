const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const path = require('path');
const fs = require('fs');

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
};

// Config for extension source code (to be run in a Node-based context)
/** @type BuildOptions */
const extensionConfig = {
  ...baseConfig,
  platform: "node",
  format: "cjs",
  entryPoints: ["./src/extension.ts"],
  outfile: "./out/extension.js",
  external: ["vscode"],
};

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const webviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/webview/main.ts"],
  outfile: "./out/webview.js",
  plugins: [
    // Copy webview css files to `out` directory unaltered
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./src/webview/*.css","./src/webview/*.js"],
        to: ["./out"],
      },
    }),
  ],
};

const sqlConfigList = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/ui/getsqlconfigLists.ts"],
  outfile: "./out/getsqlconfigLists.js",
  plugins: [
    // Copy webview css files to `out` directory unaltered
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./src/webview/*.css","./src/webview/*.js"],
        to: ["./out"],
      },
    }),
  ],
};

const workerEntryPoints = [
	'vs/language/json/json.worker.js',
	'vs/language/css/css.worker.js',
	'vs/language/html/html.worker.js',
	'vs/language/typescript/ts.worker.js',
	'vs/editor/editor.worker.js'
];

const workerEntryConfig = {
	entryPoints: workerEntryPoints.map((entry) => `../node_modules/monaco-editor/esm/${entry}`),
	bundle: true,
	format: 'iife',
	outbase: '../node_modules/monaco-editor/esm/',
	outdir: path.join(__dirname, 'dist')
};

// This watch config adheres to the conventions of the esbuild-problem-matchers
// extension (https://github.com/connor4312/esbuild-problem-matchers#esbuild-via-js)
/** @type BuildOptions */
const watchConfig = {
  watch: {
    onRebuild(error, result) {
      console.log("[watch] build started");
      if (error) {
        error.errors.forEach((error) =>
          console.error(
            `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
          )
        );
      } else {
        console.log("[watch] build finished");
      }
    },
  },
};


// Build script
(async () => {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--watch")) {
      // Build and watch extension and webview code
      console.log("[watch] build started");
      await build({
        ...extensionConfig,
        ...watchConfig,
      });
      await build({
        ...webviewConfig,
        ...watchConfig,
      });
      await build({
        ...sqlConfigList,
        ...watchConfig,
      });
      await build({
        ...workerEntryConfig,
        ...watchConfig,
      });
      console.log("[watch] build finished");
    } else {
      // Build extension and webview code
      await build(extensionConfig);
      await build(webviewConfig);
      await build(sqlConfigList);
      console.log("build complete");
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();