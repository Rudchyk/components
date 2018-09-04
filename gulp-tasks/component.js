'use strict';
const component = {
  gulp: require('gulp'),
  file: require('gulp-file'),
  notify: require('gulp-notify'),
  fileName: function(type) {
    switch (type) {
      case 'js':
        return `acc.${this.data.arg}.js`;
      case 'styles':
        return `_${this.data.arg}.${this.data.pack.configuration.styles.type}`;
      case 'tpl':
        return `${this.data.arg}.${this.data.pack.configuration.tpl.type}`;
    }
  },
  fileDestPath: function(type) {
    let generalPath = this.data.pack.configuration.projectPaths.src,
      filePath = this.data.pack.configuration[type].paths.src;
    return `${generalPath}/${filePath}/${this.data.pack.configuration.componentFolderName}/`;
  },
  createFile: function(types) {
    types.forEach(type => {
      this.file(this.fileName(type), 'str', { src: true })
        .pipe(this.notify(this.data.notifyHandler('created')))
        .pipe(this.gulp.dest(this.fileDestPath(type)));
    });
  }
};

module.exports = function (data) {
  return () => {
    component.data = data;
    component.createFile(['js', 'styles', 'tpl']);
  };
};