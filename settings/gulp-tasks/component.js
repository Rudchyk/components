'use strict';
const component = {
  gulp: require('gulp'),
  file: require('gulp-file'),
  notify: require('gulp-notify'),
  gcallback: require('gulp-callback'),
  execall: require('execall'), //???
  fs: require('fs'),
  init: false,
  toTitleCase: (str) => {
    return str[0].toUpperCase() + str.substr(1);
  },
  componentName: function(taskType) {
    let name = `${this.data.arg}.${this.data.configuration[taskType].type}`;
    switch (taskType) {
      case 'js':
        return `acc.${name}`;
      case 'styles':
        return `_${name}`;
      case 'tpl':
        return name;
      case 'vue':
        return this.toTitleCase(name);
    }
  },
  modifyFileContent: function(data) {
    return data.replace(/{{name}}/gi, this.data.arg);
  },
  indexFileAction: function(data) {
    this.fs.stat(data.indexFullPath, err => {
      if(err == null) {
        this.modifyIndexFile(data);
      } else if(err.code == 'ENOENT') {
        this.createIndexFile(data, () => {
          this.init = true;
          this.modifyIndexFile(data);
        });
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
    let modifiedModuleContent, modifiedIndexContent;
    this.fs.readFile(data.moduleTpl, 'utf8', (err, moduleContent) => {
      this.fs.readFile(data.indexFullPath, 'utf8', (err, indexContent) => {
        modifiedModuleContent = this.modifyModuleContent(moduleContent, data.taskType);
        modifiedIndexContent = this.modifyIndexContent(modifiedModuleContent, indexContent, data.taskType);
        this.fs.writeFileSync(data.indexFullPath, modifiedIndexContent, 'utf8');
        console.log(`${data.indexName} is updated!`);
      });
    });
  },
  modifyModuleContent: function(tplContent, fileType) {
    let componentName, componentPath;
    switch (fileType) {
      case 'js':
        componentName = `acc.${this.data.arg}.js`;
        break;
      default:
        componentName = this.data.arg;
        break;
    }
    componentPath = `${this.data.configuration.componentFolderName}/${componentName}`;
    return tplContent.replace(/{{path}}/gi, componentPath);
  },
  modifyIndexContent: function(moduleContent, indexContent, fileType) {
    const flags = this.specifyInjectArea(fileType);
    let moduleContentNew,
      indexContentNew = indexContent;
    for (var flag in flags) {
      switch (flag) {
        case 'name':
          moduleContentNew = `${this.init ? '' : ', '}${this.toTitleCase(this.data.arg)}${flags[flag]}`;
          break;
        default:
          moduleContentNew = `${flags[flag]}\n${moduleContent}`;
          break;
      }
      indexContentNew = indexContentNew.replace(flags[flag], moduleContentNew);
    }
    
    return indexContentNew;
  },
  specifyInjectArea: function(taskType) {
    const keyWord = '<--inject',
      injects = {};
    switch (taskType) {
      case 'js':
        injects.string = `//${keyWord}:string`;
        break;
      case 'styles':
        injects.string = `/*${keyWord}:string*/`;
        break;
      case 'vue':
        injects.string = `//${keyWord}:string`;
        injects.name = `//${keyWord}:name`;
        break;
    }
    return injects;
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