interface ITaskObject {
  aliases?: string[];
  description?: string;
  options?: ITaskOptions;
  tasks?: string[];

  deps?: Array<string>;
  callback?: Function;
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

function isTaskListObject(impl: any = {}): boolean {
  return Object.keys(impl).indexOf('tasks') > -1;
}

function getTasks(tasks) {
  if ( typeof tasks === 'function' ) {
    tasks = tasks();
  }
  return tasks || [];
}

function prefixTasks(tasks: Array<string> = [], parentTask: string = '') : Array<string> {
  return (tasks || []).map(function (v: string) {
    return v.indexOf(':') === 0 ? parentTask + v : v;
  });
}

function addTasksToGulp(gulp, rs, taskObject: ITaskObject, parentTask: string = ''): void {
  for ( let taskName in taskObject ) {
    const taskImpl = taskObject[taskName];
    if ( parentTask ) {
      taskName = `${parentTask}:${taskName}`;
    }
    if (Object.keys(taskImpl).indexOf('callback') > -1) {
      const taskFn = taskImpl.callback;
      gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask), taskFn, getOptions(taskImpl));
    } else if ( typeof taskImpl === 'function' || isTaskListObject(taskImpl) ) {
      const taskFn = typeof taskImpl === 'function' ? taskImpl : function(done) {
        return rs.use(gulp)(...(getTasks(taskImpl.tasks)).concat(done));
      };
      gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask), taskFn, getOptions(taskImpl));
    } else {
      addTasksToGulp(gulp, rs, taskImpl, taskName);
    }
  }
}

export = function gulpAddTasks(gulpInstance): any {
  if ( !looksLikeGulp(gulpInstance) ) {
    throw new Error('An instance of gulp is required as the first argument');
  }

  return function(...taskObjects) {
    const runSequence = require('run-sequence');
    const gulp = looksLikeGulpHelp(gulpInstance) ? gulpInstance : require('gulp-help')(gulpInstance);

    taskObjects
      .forEach((taskObject: ITaskOptions) => {
        addTasksToGulp(gulp, runSequence, taskObject);
      });

    return gulp;
  };
}
