
# Black wrapper

This silly little Node package exists as a way to provide [Black](https://github.com/ambv/black) to our developers and CI processes. For more info on why it's necsesary, see:

* https://github.com/ambv/black/issues/362
* https://github.com/ambv/black/issues/585

It currently bundles a binary built on a Mac using Python 3.7 and pyinstaller as follows:

```bash
git clone https://github.com/ambv/black
cd black
git reset --hard v18.9b0
pipenv --python 3
pipenv shell
pip install pyinstaller
pyinstaller --clean -F --add-data blib2to3/:blib2to3 black
```

This created the binary file `black` included in this package, which should run on Mac and Linux systems. If necessary, we can also build a Windows package and include it, too.


