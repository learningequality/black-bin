#!/usr/bin/env node

/*
 * A wrapper for self-contained packages of the Black formatter.
 *
 * Takes the same arguments as Black: https://github.com/ambv/black
 *
 * Additionally, pass the optional --watch flag, and it will watch the same
 * files and directories that are being formatted.
 *
 * For example:
 *
 *    black-fmt src --watch --check --exclude /node_modules/ --exclude ^.+?_special.py$
 *
 * This will continually check all pythont files under src except for node_modules
 * and any file that ends with '_special.py'.
 */

const child_process = require("child_process");
const chokidar = require("chokidar");
const program = require("commander");

const path = require("path");

// grab all the arguments passed in
const args = process.argv.slice(2);

// check if the special 'watch' flag was passed, and remove it if was
const watch_index = args.indexOf("--watch");
const watch = watch_index !== -1;
if (watch) {
  args.splice(watch_index, 1);
}

// prepend the correct binary
if (process.platform === "darwin") {
  args.unshift(path.join(__dirname, "./bin/black-mac"));
} else if (process.platform === "linux") {
  args.unshift(path.join(__dirname, "./bin/black-linux"));
} else {
  console.log("Unsupported OS:", process.platform);
  process.exit(1);
}

// define the command
const command = args.join(" ");
function cmd() {
  console.log(command);
  child_process.exec(command, (error, stdout, stderr) => {
    // print the output
    console.log(stderr);
    if (!watch && error) {
      // exit with an error code for CI
      process.exit(1);
    }
  });
}

// do the work
console.log("Black formatter");
if (watch) {
  // Hack to extract input arguments that are not associated with a --[flag]
  program.parse(process.argv);
  // start a watch process
  chokidar.watch(program.args).on("change", cmd);
} else {
  cmd();
}
