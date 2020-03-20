# March 20 2020: This component is now discouraged

There are no active developers without access to Python 3.6+ on their dev machines.

Please use one or more of the following work-arounds:

* By running black through pre-commit, you can have a separate Python 3.6+ environment managed by pre-commit, while working on Python 2.7
* Install black only when you are working with Python 3.6+ or in your IDE
* Rest assured that black is run by CI or go and include it in CI, for instance see Kolibri's invocation of pre-commit in CI builds.

# Black wrapper

## Background

This little Node package exists as a way to provide [Black](https://github.com/ambv/black) to our developers and CI processes, regardless of what version of Python they are running. For more info on why we found it useful, see issues [#362](https://github.com/ambv/black/issues/362) and [#585](https://github.com/ambv/black/issues/585).

This package also includes functionality for watching and re-running the formatter.

Is it super weird to wrap a python application in a binary, check it into source control, and wrap that in a Node.js package? Yes.

## Usage

As defined in `package.json`, the primary entry point is the `black-fmt` command, which symlinks to `cli.js` on installation using `yarn` or `npm`.

`black-fmt` takes some of the [same arguments as Black](https://github.com/ambv/black), specifically `--exclude` and `--check`. 

Black will be applied to the entire directory except for files matching the `exclude` regex. The default exclusion regex is:

```regex
/(\.git|\.tox|\.venv|build|static|dist|node_modules)/
```

Additionally, you can pass the optional `--watch` flag, and it will watch all python files in the current directory except for those excluded.

For example:

```bash
black-fmt --watch --check
```

## Development

This package currently bundles binaries built on Mac and Linux with [PyInstaller](https://www.pyinstaller.org/) as follows (assuming a Python >= 3.6 virtual environment):

```bash
git clone https://github.com/ambv/black
cd black
git reset --hard 18.9b0
pip install pyinstaller
pyinstaller --clean -F --add-data blib2to3/:blib2to3 black.py
pyinstaller --clean -F --add-data blib2to3/:blib2to3 blackd.py
```

This is the process that created the files `black-mac`, `blackd-mac`, `blackd-linux`, and `black-linux` are included in this package.

If necessary, we can also build Windows `black-win.exe` and `blackd-win.exe` packages and include those, too.

Some notes on building under Linux:

* Build on the [oldest possible distribution](https://stackoverflow.com/questions/17654363/pyinstaller-glibc-2-15-not-found) that is desired to be supported. The binaries included were built using Ubuntu 16.04.
* Make sure to install the `python3.6-dev` package and all dependencies
* If you're running in a virtualenv and getting an error related to `pyconfig.h` not being found, you can manually copy that file from the system python3.6 includes to your virtualenv includes.

