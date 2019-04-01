
# Black wrapper

## Background

This little Node package exists as a way to provide [Black](https://github.com/ambv/black) to our developers and CI processes, regardless of what version of Python they are running. For more info on why we found it useful, see issues [#362](https://github.com/ambv/black/issues/362) and [#585](https://github.com/ambv/black/issues/585).

This package also includes functionality for watching and re-running the formatter.

Is it super weird to wrap a python application in a binary, check it into source control, and wrap that in a Node.js package? Yes.

## Usage

As defined in `package.json`, the primary entry point is the `black-fmt` command, which symlinks to `cli.js` on installation using `yarn` or `npm`.


`black-fmt` takes some of the [same arguments as Black](https://github.com/ambv/black), specifically `--exclude` and `--check`.

Additionally, you can pass the optional `--watch` flag, and it will watch the same files and directories that are being formatted.

For example:

```bash
black-fmt --watch --check --exclude '/(\.git|node_modules)/' src docs
```

This will continually check all python files under src and docs except for `node_modules` and the `.git` directory.

## Development

It currently bundles binaries built on Mac and Linux with [PyInstaller](https://www.pyinstaller.org/) as follows (assuming a Python >= 3.6 virtual environment):

```bash
git clone https://github.com/ambv/black
cd black
git reset --hard 18.9b0
pip install pyinstaller
pyinstaller --clean -F --add-data blib2to3/:blib2to3 black.py
```

This created the binary files `black-mac` and `black-linux` are included in this package. If necessary, we can also build a Windows `black-win.exe` package and include that, too.

