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
const blackd = require("./blackd-client");

console.log("Black formatter");
program
  .arguments("[files...]", "List of files and directories to process")
  .description("Run the Black formatter")
  .option("--check", "Only check output, but do not write fixes", false)
  .option("--watch", "Run watcher on input", false)
  .option("--exclude <regex>", "Regex of paths to ignore, overriding defaults")
  .parse(process.argv);

if (!["darwin", "linux"].includes(process.platform)) {
  console.log("Unsupported OS:", process.platform);
  process.exit(1);
}

const executable = path.join(
  __dirname,
  `./bin/black${program.watch ? "d" : ""}-${process.platform}`
);

// eventually Black should auto-ignore .gitignored files
//   https://github.com/ambv/black/issues/475
const exclude = program.exclude
  ? program.exclude
  : "/(\\.git|\\.tox|\\.venv|build|static|dist|node_modules)/";

const command_array = [executable];

function cmd(cmd_arr) {
  const cmd_str = command_array.join(" ");
  console.log(cmd_str);
  return cmd_str;
}

// start a watch process and hook it up to the black daemon
if (program.watch) {
  const PORT = 454545;
  command_array.push(`--bind-port ${PORT}`);
  child_process.spawn(cmd(command_array));
  chokidar
    .watch("**/*.py", { ignored: RegExp(exclude) })
    .on("change", file_path => {
      console.log(">>", file_path);
    });
}

// run black as a one-off command
else {
  if (program.check) {
    command_array.push("--check");
  }
  // Apply Black to the entire current directory.
  // Passing in globs doesn't work because then --exclude is ignored.
  //  https://github.com/ambv/black/issues/438
  command_array.push(`--exclude '${exclude}'`);
  command_array.push(".");
  child_process.exec(cmd(command_array), (error, stdout, stderr) => {
    // print the output
    console.log(stderr);
    if (error) {
      // exit with an error code for CI
      process.exit(1);
    }
  });
}
