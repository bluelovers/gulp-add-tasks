# `gulp-add-tasks2`

[![npm](https://img.shields.io/npm/v/gulp-add-tasks2.svg?maxAge=2592000)](https://www.npmjs.com/package/gulp-add-tasks2)

A utility to dynamically add tasks based on a specified task structure to a passed-in instance of [`gulp`][gulp].

Integrates with [`gulp-help`][gulp-help] and [`run-sequence`][run-sequence] to provide a more robust user experience, as well as the ability to run tasks synchronously

*this module fork from [`gulp-add-tasks`][gulp-add-tasks]

## Install

`npm i gulp-add-tasks2 --save-dev`

## Usage

```javascript
const gulp = require('gulp');
const addTasks = require('gulp-add-tasks2').init(gulp);

addTasks(...taskLists)
```

### other way import

```
const addTasks = require('gulp-add-tasks2').init(gulp, parentTaskName);
const addTasks = require('gulp-add-tasks2/node')(gulp, parentTaskName);
```

```
import gulpAddTasks from 'gulp-add-tasks2';
import { gulpAddTasks } from 'gulp-add-tasks2';

const addTasks = gulpAddTasks(gulp, parentTaskName);
```

### Task list structure

Task list accepts two object structures, one for "multi-tasks" and one for simple task and function pairs, both of which assume each key in the map as the gulp task name.

#### multi-task structure

|Name|Description|
|:--:|-----------|
|**`tasks`**|An array of tasks, passed directly to [`run-sequence`][run-sequence]|
|`description`|A task description, used by [`gulp-help`][gulp-help]|
|`options`|Programmatic options to be utlized by the tasks, used by [`gulp-help`][gulp-help]|
|`aliases`|An array of aliases that the task can be called with, used by [`gulp-help`][gulp-help]|
|`deps`|An array of tasks to be executed and completed before your task will run.|
|`callback`|The function performs the task's main operations. Generally this takes the form of:|

##### Example

```javascript
const gulp = require('gulp');
const addTasks = require('gulp-add-tasks2').init(gulp);

addTasks({
  build: {
    description: 'Build application for distribution',
    tasks: [
      ['sass', 'babel']
    ],
    options: {
      production: 'Minify assets with this flag'
    }
  }
});
```

`gulp build` will now be a runnable task via the CLI, which will, in turn, call `gulp sass & gulp babel` (async) via [`run-sequence`][run-sequence].

#### single task structure

A simple key/value pair, with the key representing the task name, and the value a reference to a function, can be used to create a simple task. This is particularly useful when used in conjunction with [`require-tasks`][require-tasks], which generates a structure that can be directly passed to `gulp-add-tasks`.

##### Example

```javascript
const gulp = require('gulp');
const addTasks = require('gulp-add-tasks2').init(gulp);

addTasks({
  babel() {
    const babel = require('gulp-babel');

    return gulp.src('src/**/*.js')
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('dist'));
  }
});
```

`gulp babel` will now be a runnable task via the CLI.

## Advanced Usage

`gulp-add-tasks` supports multi-tasks, separating a nested structure via colons (`:`), e.g.

```javascript
const gulp = require('gulp');
const addTasks = require('gulp-add-tasks2').init(gulp);

addTasks({
  copy: {
    css() {
      return gulp.src('src/**/*.css')
        .pipe(gulp.dest('dist/css'));
    },
    js() {
      return gulp.src('src/**/*.js')
        .pipe(gulp.dest('dist/js'));
    }
  }
})
```

gulp will now have the tasks `copy:css` and `copy:js` available for usage from the command line.

[gulp]: http://gulpjs.com
[gulp-help]: https://www.npmjs.com/package/gulp-help
[run-sequence]: https://www.npmjs.com/package/run-sequence
[require-tasks]: https://www.npmjs.com/package/require-tasks
[gulp-add-tasks]: https://www.npmjs.com/package/gulp-add-tasks

