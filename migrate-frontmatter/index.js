const editor = require('front-matter-editor');
const path = require('path');
const klaw = require('klaw');
const through2 = require('through2');
const fs = require('fs');

function convertFile( filePath, destPath ) {
    // if add author property to front-matter
    editor.read(filePath)
      .data((data, matter, fileSystemInfo) => {
        const tags = data.tags.filter( tag => tag != 'wikimedia');
        let publish_date;
        if ( data.date ) {
            publish_date = data.date;
        } else if ( fileSystemInfo.name.match( /^\d{4}-\d{2}-\d{2}/ ) ) {
            publish_date = fileSystemInfo.name.match( /^\d{4}-\d{2}-\d{2}/ )[0]
        } else {
            let d = fileSystemInfo.status.mtime;
            // TODO use proper date formatter to avoid invalid dates with 1-digit days/months
            publish_date = [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-');
        }
        matter.data = {
            title: data.title,
            tags: tags,
            date: publish_date
        };
        if ( data.draft ) {
            matter.data.draft = true;
        }
        if ( data.tags.indexOf( 'wikimedia' ) > -1 ) {
            matter.data.categories = ['wikimedia'];
        }
      })
      .save(destPath, {}, (err) => {
          if ( err ) {
              console.log(err);
          }
      });
}

const src = path.join(__dirname, '../src/content/');
const dest = path.join(__dirname,'../../hugo-gabriel/content');

const onlyMarkdownFiles = through2.obj(function (item, enc, next) {
  if (path.extname(item.path) === '.md') this.push(item);
  next();
})

// Use "klaw" library to walk through the src directory, converting each encountered Markdown file
klaw(src)
  .pipe(onlyMarkdownFiles)
  .on('data', (item) => {
      const outputFile = path.join(dest,item.path.replace(src, ''));
      const outputPath = path.dirname(outputFile).replace('/posts', '/post');
      fs.access(outputPath, fs.constants.F_OK, (err) => {
        if(err) {
            fs.mkdirSync(outputPath);
        }
        convertFile(item.path, outputPath);
    });

});



