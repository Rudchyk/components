'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
const pack = require('./package.json'),
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
    created: "File: <%= file.relative %> is created in <%= file.path %>!",
    compressed: "File: <%= file.relative %> is compressed!",
    deleted: "Old file(folder): <%= file.relative %> is deleted!"
  },
  notifyHandler = (message) => {
    return {
      title: `${pack.name}@${pack.version}`,
      icon: path.join(__dirname, 'gulp.png'),
      message: messages[message]
    }
  },
  getTask = (task, arg) => {
    return require('./gulp-tasks/' + task)({
      pack,
      notifyHandler,
      arg
    });
  };

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------
gulp.task('block', getTask('component', argv.n)); // gulp block -n name

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------
gulp.task('default', ['block']);