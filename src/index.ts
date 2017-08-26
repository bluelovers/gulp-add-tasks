export interface ITaskObject
{
	aliases?: string[];
	description?: string;
	options?: ITaskOptions;
	tasks?: ITasksSequence;

	deps?: Array<string>;
	callback?: ITaskCallback;
}

export interface ITaskCallback extends Function
{
	(done?): void | any | Promise<any | void>;
}

export interface ITaskOptions
{
	options?: any;
	aliases?: string[];
}

export interface IExportDefault extends Function
{
	(...taskObjects);
}

export interface ITasksSequence extends Array<string | string[]>
{
	[index: number]: string | string[];
}

function looksLikeGulp(gulp): boolean
{
	return !!(gulp.task && gulp.watch && gulp.src && gulp.dest);
}

function looksLikeGulpHelp(gulp): boolean
{
	return !!(gulp.tasks.help);
}

function getOptions(impl: any | ITaskOptions): ITaskOptions
{
	const options = (impl.options || {}) as ITaskOptions;
	if (options.options || options.aliases)
	{
		return options;
	}
	return {
		options: impl.options || {},
		aliases: impl.aliases || []
	};
}

function isTaskListObject(impl: any = {}): boolean
{
	return Object.keys(impl).indexOf('tasks') > -1;
}

function getTasks(tasks: any | ITasksSequence, parentTask: string = ''): ITasksSequence
{
	if (typeof tasks === 'function')
	{
		tasks = tasks() as ITasksSequence;
	}

	for (let i in tasks)
	{
		if (Array.isArray(tasks[i]))
		{
			tasks[i] = prefixTasks(tasks[i], parentTask);
		}
		else if (typeof tasks[i] == 'string')
		{
			tasks[i] = prefixTasks([tasks[i]], parentTask)[0];
		}
	}

	return tasks || [];
}

export function prefixTasks(tasks: ITasksSequence = [], parentTask: string = ''): Array<string>
{
	if (tasks && !Array.isArray(tasks))
	{
		tasks = [tasks as any] as ITasksSequence;
	}

	return (tasks || []).map(function (v: string)
	{
		if (typeof v !== 'string') return v;

		return v.indexOf(':') === 0 ? parentTask + v : v;
	});
}

function addTasksToGulp(gulp, rs, taskObject: ITaskObject, parentTask: string = ''): void
{
	for (let taskName in taskObject)
	{
		const taskImpl = taskObject[taskName];
		if (parentTask)
		{
			taskName = `${parentTask}:${taskName}`;
		}
		if (Object.keys(taskImpl).indexOf('callback') > -1)
		{
			let taskFn: ITaskCallback;

			if (isTaskListObject(taskImpl))
			{
				taskFn = async function (): Promise<any | void>
				{
					await new Promise(function (resolve, reject)
					{
						rs.use(gulp)(...((getTasks(taskImpl.tasks, parentTask) as Array<any>).concat(resolve)))
					});

					await taskImpl.callback();
				};
			}
			else
			{
				taskFn = taskImpl.callback;
			}

			gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask), taskFn, getOptions(taskImpl));
		}
		else if (typeof taskImpl === 'function' || isTaskListObject(taskImpl))
		{
			const taskFn: ITaskCallback = typeof taskImpl === 'function' ? taskImpl : function (done)
			{
				return rs.use(gulp)(...(getTasks(taskImpl.tasks, parentTask)).concat(done));
			};
			gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask), taskFn, getOptions(taskImpl));
		}
		else
		{
			addTasksToGulp(gulp, rs, taskImpl, taskName);
		}
	}
}

export function gulpAddTasks(gulpInstance, parentTaskName: string = ''): IExportDefault
{
	if (!looksLikeGulp(gulpInstance))
	{
		throw new Error('An instance of gulp is required as the first argument');
	}

	return function (...taskObjects)
	{
		const runSequence = require('run-sequence');
		const gulp = looksLikeGulpHelp(gulpInstance) ? gulpInstance : require('gulp-help')(gulpInstance);

		taskObjects
			.forEach((taskObject: ITaskOptions) =>
			{
				addTasksToGulp(gulp, runSequence, taskObject, parentTaskName);
			});

		return gulp;
	};
}

export default gulpAddTasks;
