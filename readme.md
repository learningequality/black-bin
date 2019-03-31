
# Black wrapper

This silly little Node package exists as a way to provide [Black](https://github.com/ambv/black) to our developers and CI processes. For more info on why it's necsesary, see:

* https://github.com/ambv/black/issues/362
* https://github.com/ambv/black/issues/585

It currently bundles binaries built on Mac and Linux with [PyInstaller](https://www.pyinstaller.org/) as follows (assuming a Python >= 3.6 virtual environment):

```bash
git clone https://github.com/ambv/black
cd black
git reset --hard 18.9b0
pip install pyinstaller
pyinstaller --clean -F --add-data blib2to3/:blib2to3 black.py
```

This created the binary files `black-mac` and `black-linux` are included in this package. If necessary, we can also build a Windows `black-win.exe` package and include that, too.

