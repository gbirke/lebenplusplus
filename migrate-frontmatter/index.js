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
// TODO Use Hugo content directory
const dest = path.join(__dirname,'/output');

const onlyMarkdownFiles = through2.obj(function (item, enc, next) {
  if (path.extname(item.path) === '.md') this.push(item)
  next()
})

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



/*
convertFile(
    path.join(__dirname, '../src/content/drafts/json-log-files.md'),
    path.join(__dirname,'/output')
);
*/




//let filePath = path.join(__dirname, '../src/content/posts/2016-09-14-swanseaconf-2016.md');
