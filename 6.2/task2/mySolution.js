const fs = require('fs');
const path = require('path');

const currentDate = new Date();

/**
 * Delete files in path older than a certain amount of days.
 * @param {string} path path to where the files are
 * @param {number} days number of days the files must be old to be deleted.
 */
const pathEraser = (pathLocation, days) => {
  const allFiles = fs.readdirSync(pathLocation);
  allFiles
    .filter(
      (file) =>
        fs.statSync(path.join(pathLocation, file)).mtime <
        new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * days)
    )
    .forEach((file) => fs.rmSync(path.join(pathLocation, file)));
};

pathEraser('./files', 7);
