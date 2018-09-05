'use strict';
const component = {
  gulp: require('gulp'),
  file: require('gulp-file'),
  notify: require('gulp-notify'),
  gcallback: require('gulp-callback'),
  fs: require('fs'),
  toTitleCase: (str) => {
    return str[0].toUpperCase() + str.substr(1);
  },
  componentName: function(taskType) {
    switch (taskType) {
      case 'js':
        return `acc.${this.data.arg}.js`;
      case 'styles':
        return `_${this.data.arg}.${this.data.configuration.styles.type}`;
      case 'tpl':
        return `${this.data.arg}.${this.data.configuration.tpl.type}`;
      case 'vue':
        return this.toTitleCase(`${this.data.arg}.${this.data.configuration.tpl.type}`);
    }
  },
  modifyFileContent: function(data) {
    const re = /{{name}}/gi;
    return data.replace(re, this.data.arg);
  },
  indexFileAction: function(data) {
    this.fs.stat(data.indexFullPath, (err, stat) => {
      if(err == null) {
        this.modifyIndexFile(data);
      } else if(err.code == 'ENOENT') {
        console.log(`${data.indexFullPath} does not exist!`);
        this.createIndexFile(data, () => {
          this.modifyIndexFile(data);
        });
      } else {
        console.log('Some other error: ', err.code);
      }
    });
  },
  createIndexFile: function(data, callback) {
    this.fs.readFile(data.intexTpl, 'utf8', (err, content) => {
      this.file(data.indexName, (content || ''), { src: true })
        .pipe(this.notify(this.data.notifyHandler(`File: <%= file.relative %> is created`, false)))
        .pipe(this.gulp.dest(data.indexPath))
        .pipe(this.gcallback(() => {
          callback();
        }));
    });
  },
  modifyIndexFile: function(data) {
    this.fs.readFile(data.moduleTpl, 'utf8', (err, moduleContent) => {
      this.fs.readFile(data.indexFullPath, (err, indexContent) => {
        let modifiedIndexContent = this.modifyIndexContent(this.modifyModuleContent(moduleContent), indexContent, data.taskType);
        this.fs.writeFileSync(data.indexFullPath, modifiedIndexContent, 'utf8');
        console.log(`${data.indexName} has been saved!`);
      });
    });
  },
  modifyModuleContent: function(tplContent) {
    const re = /{{path}}/gi,
      componentPath = `${this.data.configuration.componentFolderName}/${this.data.arg}`;
    return tplContent.replace(re, componentPath);
  },
  modifyIndexContent: function(moduleContent, indexContent, fileType) {
    let re = this.specifyInjectArea(fileType);
    console.log('re', re);
    return indexContent + moduleContent;
  },
  specifyInjectArea: function(taskType) {
    let keyWords = ['inject', 'endinject'];

    switch (taskType) {
      case 'js':
        keyWords = this.createFlag(keyWords, '//{{mask}}');
        break;
      case 'styles':
        keyWords = this.createFlag(keyWords, '/* {{mask}} */');
        break;
      case 'vue':
        keyWords = this.createFlag(keyWords, '//{{mask}}:{{flag}}');
        break;
    }

    return [keyWords[0], '(.*?)', keyWords[1]];
  },
  createFlag: function (arr, mask) {
    const re = /{{mask}}/gi;
    return arr.map((item) => {
      return mask.replace(re, item);
    });
  },
  createComponentsFile: function(taskTypes) {
    const config = this.data.configuration;

    taskTypes.forEach(taskType => {
      const indexFile = config[taskType].index;
      let indexPath, intexTplRootPath, componentDestPath;

      this.fs.readFile(`${this.tplRootPath(taskType)}/tpl.tpl`, 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        } else {
          componentDestPath = `${config.projectPaths.src}/${config[taskType].paths.src}/${config.componentFolderName}/`;

          this.file(this.componentName(taskType), this.modifyFileContent(data), { src: true })
            .pipe(this.notify(this.data.notifyHandler(`File: ${componentDestPath}<%= file.relative %> is created`, false)))
            .pipe(this.gulp.dest(componentDestPath));
        }
      });

      if (indexFile) {
        indexPath = `${config.projectPaths.src}/${config[taskType].paths.index || config[taskType].paths.src}/`;
        intexTplRootPath = this.tplRootPath(taskType);

        this.indexFileAction({
          taskType,
          fileType: config[taskType].type,
          indexPath,
          indexName: indexFile,
          indexFullPath: `${indexPath}${indexFile}`,
          intexTpl: `${intexTplRootPath}/index.tpl`,
          moduleTpl: `${intexTplRootPath}/module.tpl`
        });
      }
    });
  },
  tplRootPath: function(taskType) {
    const type = this.data.configuration[taskType].type;
    let tplRootPath = `./settings/templates/${taskType}`;

    if (type !== taskType) {
      tplRootPath += `/${type}`;
    }

    return tplRootPath;
  }
};

module.exports = function (data) {
  return () => {
    component.data = data;
    component.createComponentsFile(['js', 'styles', 'tpl', 'vue']);
  };
};