var fs = require('fs');

function read(filename, cb) {
  if (!filename) {
    console.log('enter filename');
    return;
  }

  fs.readFile(filename, 'utf8', function(err, contents) {
    var levels = contents.split(";");
    levels.splice(-1);
    levels = levels.map(level => {
      var newLineAt = level.indexOf('\n');
      var str = level.slice(newLineAt);
      return str.replace(/^\n|\n$/g, '');
    });
    cb(err, levels);
  });
}

function build(input, output) {
  if (!output) {
    console.log('enter output file');
    return;
  }
  read(input, (err, levels) => {
    var data = JSON.stringify(levels);

    fs.writeFile(output, data, function(err) {
      if (err) {
        throw err;
      }
    });
  });
}

build(process.argv[2], process.argv[3]);
