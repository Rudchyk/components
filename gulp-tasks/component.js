'use strict';
const component = {
  gulp: require('gulp'),
  file: require('gulp-file'),
  notify: require('gulp-notify'),
  fs: require('fs'),
  fileName: function(type) {
    switch (type) {
      case 'js':
        return `acc.${this.data.arg}.js`;
      case 'styles':
        return `_${this.data.arg}.${this.data.configuration.styles.type}`;
      case 'tpl':
        return `${this.data.arg}.${this.data.configuration.tpl.type}`;
    }
  },
  fileContent: function(data) {
    const re = /{{name}}/gi;
    return data.replace(re, this.data.arg);
  },
  filePath: function(type) {
    let generalPath = this.data.configuration.projectPaths.src,
      filePath = this.data.configuration[type].paths.src;
    return `${generalPath}/${filePath}/${this.data.configuration.componentFolderName}/`;
  },
  fileTemplate: function(type) {
    let tpl = this.data.configuration[type].type;

    if (type === 'styles' && tpl !== 'sass') {
      tpl = 'css';
    }

    return `./templates/${type}/tpl.${tpl}`;
  },
  createFile: function(types) {
    types.forEach(type => {
      this.fs.readFile(this.fileTemplate(type), 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        } else {
          this.file(this.fileName(type), this.fileContent(data), { src: true })
            .pipe(this.notify(this.data.notifyHandler('created')))
            .pipe(this.gulp.dest(this.filePath(type)));
        }
      });
    });
  }
};

module.exports = function (data) {
  return () => {
    component.data = data;
    component.createFile(['js', 'styles', 'tpl']);
  };
};