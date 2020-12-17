console.log('Starting');
const fs = require('fs');
const events = require('events');
const emitter = new events.EventEmitter();
emitter.on('log', (msgs) => console.log(...msgs));
try {
  fs.readdir('./files', (err, files) => {
    err && console.log(err);
    emitter.emit('log', ['Read files directory']);
    files.forEach((el) => {
      emitter.emit('log', ['Starting reading file: ', el]);
      fs.readFile(`./files/${el}`, 'utf-8', (err, fileContent) => {
        if (err) throw err;
        emitter.emit('log', ['Finished reading file: ', el]);
        const firstBreakIndex = fileContent.indexOf('\n');
        const firstLine = fileContent.substring(0, firstBreakIndex);
        const secondOccurrence = fileContent.indexOf(firstLine, firstBreakIndex);
        const newFileContent = fileContent.substring(0, secondOccurrence);
        emitter.emit('log', ['New file contents:\n', newFileContent]);
        fs.writeFile(`./files/${el}`, newFileContent, (err) => {
          if (err) throw err;
        });
      });
    });
  });
} catch (err) {
  throw err;
}
