// Utility Function
const fs = require("fs");
var shell = require("shelljs");

/**
 * Pretty date
 * @return {string} Return a pretty date [2020-10-29 4:3:7]
 */
function GenerateDate() {
  var today = new Date();

  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  var dateTime = date + " " + time;

  return dateTime;
}

/**
 * Wait
 * @param  {number} Tick Tick
 * @return {Promise} Return resolve(true) after finish
 */
function Wait(Tick) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(true);
    }, Tick);
  });
}

/**
 * Create directory
 * @param  {string} TargetDirectory Current directory
 * @return {Promise} Return resolve(true) after created directory
 */
function CreateDirectory(TargetDirectory) {
  return new Promise((resolve, reject) => {
    // console.log(TargetDirectory);
    if (!fs.existsSync(TargetDirectory)) {
      fs.mkdirSync(TargetDirectory);
    }

    return resolve(true);
  });
}

/**
 * Check file exists
 * @param  {string} TargetFile Target file path to check
 * @return {Promise} Return resolve(true) if exists
 */
function CheckFileExists(TargetFile) {
  return new Promise((resolve, reject) => {
    try {
      fs.promises
        .access(TargetFile)
        .then(() => {
          return resolve(true);
        })
        .catch(() => {
          return resolve(false);
        });
    } catch (error) {
      return resolve(false);
    }
  });
}

/**
 * Check directory exists
 * @param  {string} TargetDirectory Target directory path to check
 * @return {Promise} Return resolve(true) if exists
 */
function CheckDirectoryExists(TargetDirectory) {
  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(TargetDirectory)) {
        return resolve(true);
      }

      return resolve(false);
    } catch (error) {
      return resolve(false);
    }
  });
}

/**
 * ShellJS execute
 * @param  {string} Command Command to execute
 * @param  {string} Directory Target directory to execute
 * @return {Promise} Return resolve(true) complete
 */
function ShellJsExecute(Command, Directory) {
  return new Promise((resolve, reject) => {
    try {
      shell.cd(Directory);
      var ShellInstance = shell.exec(Command);

      if (ShellInstance.code !== 0) {
        // ShellInstance.exit(1);
        // shell.exit(1);
        return reject(new Error(ShellInstance.code));
      }

      return resolve(true);
    } catch (e) {
      return reject(new Error(e));
    }
  });
}

/**
 * ShellJS Chmod
 * @param  {string} Mode Mode (777)
 * @param  {string} File Target file
 * @return {Promise} Return resolve(true) complete
 */
function ShellJsChmod(Mode, File) {
  return new Promise((resolve, reject) => {
    try {
      shell.chmod(Mode, File);
      return resolve(true);
    } catch (e) {
      return reject(new Error(e));
    }
  });
}

module.exports = {
  GenerateDate,
  Wait,
  CreateDirectory,
  CheckFileExists,
  ShellJsExecute,
  ShellJsChmod,
  CheckDirectoryExists,
};
