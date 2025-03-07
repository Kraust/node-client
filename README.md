# neovim-client

| CI (Linux, macOS, Windows) | Coverage | npm | Gitter |
|----------------------------|----------|-----|--------|
| [![ci](https://github.com/neovim/node-client/actions/workflows/ci.yml/badge.svg)](https://github.com/neovim/node-client/actions/workflows/ci.yml) | [![Coverage Badge][]][Coverage Report] | [![npm version][]][npm package] | [![Gitter Badge][]][Gitter] |

Currently tested for node >= 10

## Installation
Install the `neovim` package globally using `npm`.

```sh
npm install -g neovim
```

A global package is required for neovim to be able to communicate with a plugin.

## Usage
This package exports a single `attach()` function which takes a pair of
write/read streams and invokes a callback with a Nvim API object.

### `attach`

```js
const cp = require('child_process');
const attach = require('neovim').attach;

const nvim_proc = cp.spawn('nvim', ['-u', 'NONE', '-N', '--embed'], {});

// Attach to neovim process
(async function() {
  const nvim = await attach({ proc: nvim_proc });
  nvim.command('vsp');
  nvim.command('vsp');
  nvim.command('vsp');
  const windows = await nvim.windows;

  // expect(windows.length).toEqual(4);
  // expect(windows[0] instanceof nvim.Window).toEqual(true);
  // expect(windows[1] instanceof nvim.Window).toEqual(true);

  nvim.window = windows[2];
  const win = await nvim.window;

  // expect(win).not.toEqual(windows[0]);
  // expect(win).toEqual(windows[2]);

  const buf = await nvim.buffer;
  // expect(buf instanceof nvim.Buffer).toEqual(true);

  const lines = await buf.lines;
  // expect(lines).toEqual(['']);

  await buf.replace(['line1', 'line2'], 0);
  const newLines = await buf.lines;
  // expect(newLines).toEqual(['line1', 'line2']);

  nvim.quit();
  nvim_proc.disconnect();
})();
```

## Writing a Plugin
A plugin can either be a file or folder in the `rplugin/node` directory. If the plugin is a folder, the `main` script from `package.json` will be loaded.

The plugin should export a function which takes a `NvimPlugin` object as its only parameter. You may then register autocmds, commands and functions by calling methods on the `NvimPlugin` object. You should not do any heavy initialisation or start any async functions at this stage, as nvim may only be collecting information about your plugin without wishing to actually use it. You should wait for one of your autocmds, commands or functions to be called before starting any processing.

`console` has been replaced by a `winston` interface and `console.log` will call `winston.info`.

### API

```ts
  NvimPlugin.nvim
```

This is the nvim api object you can use to send commands from your plugin to nvim.

```ts
  NvimPlugin.setOptions(options: NvimPluginOptions);

  interface NvimPluginOptions {
    dev?: boolean;
    alwaysInit?: boolean;
  }
```

Set your plugin to dev mode, which will cause the module to be reloaded on each invocation.
`alwaysInit` will always attempt to attempt to re-instantiate the plugin. e.g. your plugin class will
always get called on each invocation of your plugin's command.


```ts
  NvimPlugin.registerAutocmd(name: string, fn: Function, options: AutocmdOptions): void;
  NvimPlugin.registerAutocmd(name: string, fn: [any, Function], options: AutocmdOptions): void;

  interface AutocmdOptions {
    pattern: string;
    eval?: string;
    sync?: boolean;
  }
```

Registers an autocmd for the event `name`, calling your function `fn` with `options`. Pattern is the only required option. If you wish to call a method on an object you may pass `fn` as an array of `[object, object.method]`.

By default autocmds, commands and functions are all treated as asynchronous and should return `Promises` (or should be `async` functions).

```ts
  NvimPlugin.registerCommand(name: string, fn: Function, options?: CommandOptions): void;
  NvimPlugin.registerCommand(name: string, fn: [any, Function], options?: CommandOptions): void;

  interface CommandOptions {
    sync?: boolean;
    range?: string;
    nargs?: string;
  }
```

Registers a command named by `name`, calling function `fn` with `options`. This will be invoked from nvim by entering `:name` in normal mode.

```ts
  NvimPlugin.registerFunction(name: string, fn: Function, options?: NvimFunctionOptions): void;
  NvimPlugin.registerFunction(name: string, fn: [any, Function], options?: NvimFunctionOptions): void;

  interface NvimFunctionOptions {
    sync?: boolean;
    range?: string;
    eval?: string;
  }
```

Registers a function with name `name`, calling function `fn` with `options`. This will be invoked from nvim by entering eg `:call name()` in normal mode.

### Examples

Examples of how to write plugins can be seen in the [`examples`](https://github.com/neovim/node-client/tree/master/examples) directory.

## Debugging / troubleshooting
Here are a few env vars you can set while starting `neovim`, that can help debugging and configuring logging:

#### `NVIM_NODE_HOST_DEBUG`
Will spawn the node process that calls `neovim-client-host` with `--inspect-brk` so you can have a debugger. Pair that with this [Node Inspector Manager Chrome plugin](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj?hl=en)

### Logging
TBD

#### `NVIM_NODE_LOG_LEVEL`
Sets the logging level for winston. Default is `debug`, available levels are `{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }`

#### `NVIM_NODE_LOG_FILE`
Sets the log file path

### Usage through node REPL
#### `NVIM_LISTEN_ADDRESS`
First, start Nvim with a known address (or use the $NVIM_LISTEN_ADDRESS of a running instance):

$ NVIM_LISTEN_ADDRESS=/tmp/nvim nvim
In another terminal, connect a node REPL to Nvim

```javascript
// `scripts/nvim` will detect if `NVIM_LISTEN_ADDRESS` is set and use that unix socket
// Otherwise will create an embedded `nvim` instance
require('neovim/scripts/nvim').then((nvim) => {
  nvim.command('vsp');
});
```

The tests and [`scripts`](https://github.com/neovim/node-client/tree/master/packages/neovim/scripts) can be consulted for more examples.

## Contributors
* [@billyvg](https://github.com/billyvg) for rewrite
* [@mhartington](https://github.com/mhartington) for TypeScript rewrite
* [@fritzy](https://github.com/fritzy) for transferring over the npm package repo `neovim`!
* [@rhysd](https://github.com/rhysd), [@tarruda](https://github.com/tarruda), [@nhynes](https://github.com/nhynes) on work for the original `node-client`

[Coverage Badge]: https://codecov.io/gh/neovim/node-client/branch/master/graph/badge.svg
[Coverage Report]: https://codecov.io/gh/neovim/node-client
[npm version]: https://img.shields.io/npm/v/neovim.svg
[npm package]: https://www.npmjs.com/package/neovim
[Gitter Badge]: https://badges.gitter.im/neovim/node-client.svg
[Gitter]: https://gitter.im/neovim/node-client?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
