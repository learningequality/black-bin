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
const path = require("path");
const fs = require("fs");

const chokidar = require("chokidar");
const program = require("commander");
const log = require("npmlog");
const request = require("request");

log.info("black-fmt", "Running black formatter");
program
  .arguments("[files...]", "List of files and directories to process")
  .description("Run the Black formatter")
  .option("--check", "Only check output, but do not write fixes", false)
  .option("--watch", "Run watcher on input", false)
  .option("--exclude <regex>", "Regex of paths to ignore, overriding defaults")
  .parse(process.argv);

if (!["darwin", "linux"].includes(process.platform)) {
  log.error("black-fmt", `Unsupported OS: ${process.platform}`);
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

// start a watch process and hook it up to the black daemon
if (program.watch) {
  const HOST = "localhost";
  const PORT = 45454;
  const blackd = child_process.spawn(executable, [
    "--bind-host",
    HOST,
    "--bind-port",
    PORT
  ]);
  blackd.on("close", code => {
    log.info("black-fmt", `blackd process exited with code ${code}`);
  });
  // watch files
  chokidar
    .watch("**/*.py", { ignored: RegExp(exclude) })
    .on("change", relativePath => {
      const fullPath = path.resolve(relativePath);
      // read in contents of python file
      fs.readFile(fullPath, (error, contents) => {
        if (error) throw error;
        // send contents to daemon
        request.post(
          `http://${HOST}:${PORT}`,
          { body: contents },
          (error, response, body) => {
            if (response.statusCode === 400) {
              log.warn("black-fmt", fullPath);
              log.warn("black-fmt", body);
            } else if (response.statusCode === 500) {
              log.error("black-fmt", fullPath);
              log.error("black-fmt", body);
            } else if (response.statusCode === 200) {
              fs.writeFile(fullPath, body, function(err) {
                if (err) throw err;
                log.info("black-fmt", `Re-formatted ${fullPath}`);
              });
            }
          }
        );
      });
    });
}

// run black as a one-off command
else {
  const command_array = [executable];
  if (program.check) {
    command_array.push("--check");
  }
  // Apply Black to the entire current directory.
  // Passing in globs doesn't work because then --exclude is ignored.
  //   https://github.com/ambv/black/issues/438
  command_array.push(`--exclude '${exclude}'`);
  command_array.push(".");
  child_process.exec(command_array.join(" "), (error, stdout, stderr) => {
    // print the output
    log.info("black-fmt", stderr);
    if (error) {
      // exit with an error code for CI
      log.error("black-fmt", "Check failed");
      process.exit(1);
    }
  });
}
