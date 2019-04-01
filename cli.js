#!/usr/bin/env node

/*
 * A wrapper for self-contained packages of the Black formatter.
 *
 * Pass the optional --watch flag, and it will watch the same files and
 * directories that are being processed.
 *
 * For example:
 *
 *    black-fmt --watch --check --exclude '/(\.git|node_modules)/' src docs
 *
 * This will continually check all python files under src and docs except for
 * node_modules and the .git directory.
 */

const child_process = require("child_process");
const chokidar = require("chokidar");
const program = require("commander");
const path = require("path");

const command_array = [];

program
  .arguments("[files...]", "List of files and directories to process")
  .description("Run the Black formatter")
  .option("--check", "Only check output, but do not write fixes", false)
  .option("--watch", "Run watcher on input", false)
  .option("--exclude <regex>", "Regex of paths to ignore")
  .parse(process.argv);

// prepend the correct binary
if (process.platform === "darwin") {
  command_array.push(path.join(__dirname, "./bin/black-mac"));
} else if (process.platform === "linux") {
  command_array.push(path.join(__dirname, "./bin/black-linux"));
} else {
  console.log("Unsupported OS:", process.platform);
  process.exit(1);
}

if (program.check) {
  command_array.push("--check");
}

if (program.exclude) {
  command_array.push("--exclude");
  command_array.push('"' + program.exclude + '"');
}

// add additional args
command_array.push(...program.args);

// define the command
const command = command_array.join(" ");
function cmd() {
  console.log(command);
  child_process.exec(command, (error, stdout, stderr) => {
    // print the output
    console.log(stderr);
    if (!program.watch && error) {
      // exit with an error code for CI
      process.exit(1);
    }
  });
}

// do the work
console.log("Black formatter");
if (program.watch) {
  // start a watch process
  chokidar.watch(program.args).on("change", cmd);
} else {
  cmd();
}
