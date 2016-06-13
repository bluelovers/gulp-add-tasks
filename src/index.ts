interface ITaskObject {
  aliases?: string[];
  description?: string;
  options?: ITaskOptions;
  tasks?: string[];
}

interface ITaskOptions {
  options?: any;
  aliases?: string[];
}

function looksLikeGulp(gulp): boolean {
  return !!(gulp.task && gulp.watch && gulp.src && gulp.dest);
}

function looksLikeGulpHelp(gulp): boolean {
  return !!(gulp.tasks.help);
}

function getOptions(impl): ITaskOptions {
  const options = impl.options || {};
  if ( options.options || options.aliases ) {
    return options;
  }
  return {
    options: impl.options || {},
    aliases: impl.aliases || []
  };
}

function isTaskListObject(impl): boolean {
  return Object.keys(impl).indexOf('tasks') > -1;
}

function addTasksToGulp(gulp, rs, taskObject: ITaskObject, parentTask: string = ''): void {
  for ( let taskName in taskObject ) {
    const taskImpl = taskObject[taskName];
    if ( parentTask ) {
      taskName = `${parentTask}:${taskName}`;
    }
    if ( typeof taskImpl === 'function' || isTaskListObject(taskImpl) ) {
      const taskFn = typeof taskImpl === 'function' ? taskImpl : function(done) {
        return rs.use(gulp)(...(taskImpl.tasks || []).concat(done));
      };
      gulp.task(taskName, taskImpl.description || false, [], taskFn, getOptions(taskImpl));
    } else {
      addTasksToGulp(gulp, rs, taskImpl, taskName);
    }
  }
}

export = function gulpAddTasks(gulp, ...taskObjects): any {
  if ( !looksLikeGulp(gulp) ) {
    throw new Error('An instance of gulp is required as the first argument');
  }

  const runSequence = require('run-sequence');
  gulp = looksLikeGulpHelp(gulp) ? gulp : require('gulp-help')(gulp);

  taskObjects
    .forEach((taskObject: ITaskOptions) => {
      addTasksToGulp(gulp, runSequence, taskObject);
    });

  return gulp;
}
