'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
const pack = require('./package.json'),
  configuration = require('./configuration.json'),
  path  = require('path'),
  gulp = require('gulp'),
  argv = require('yargs').argv;

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const messages = {
    error: "Error: <%= error.message %>",
    compiled: "<%= file.relative %> is compited!",
    moved: "File: <%= file.relative %> is moved!",
    created: "File: <%= file.relative %> is created!",
    compressed: "File: <%= file.relative %> is compressed!",
    deleted: "Old file(folder): <%= file.relative %> is deleted!"
  },
  notifyHandler = (message, auto = true) => {
    return {
      title: `${pack.name}@${pack.version}`,
      icon: path.join(__dirname, 'gulp.png'),
      message: auto ? messages[message] : message
    }
  },
  getTask = (task, arg) => {
    return require('./gulp-tasks/' + task)({
      pack,
      configuration,
      notifyHandler,
      arg
    });
  };

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------
gulp.task('block', getTask('component', argv.b)); // gulp block -b name

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------
gulp.task('default', ['block']);