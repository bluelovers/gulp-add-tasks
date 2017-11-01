//import runSequence from 'gulp-run-seq-unique/run-sequence';
import * as runSequence from 'run-sequence';
import * as gulpHelp from 'gulp-help';
import * as gulp from 'gulp';

export interface ITaskObject
{
	aliases?: string[];
	description?: string;
	options?: ITaskOptions;
	tasks?: ITasksSequence;

	deps?: Array<string>;
	callback?: ITaskCallback;
}

export interface ITaskObjectList
{
	default?: ITaskObject | ITaskCallback;

	[key: string]: ITaskObjectList | ITaskCallback | ITaskObject;
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

const SEP = ':';

export function looksLikeGulp(gulp): boolean
{
	return !!(gulp.task && gulp.watch && gulp.src && gulp.dest);
}

export function looksLikeGulpHelp(gulp): boolean
{
	return !!(gulp.tasks.help);
}

export function getOptions(impl: any | ITaskOptions): ITaskOptions
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

export function isTaskListObject(impl: any = {}): boolean
{
	return Object.keys(impl).indexOf('tasks') > -1;
}

export function getTasks(tasks: any | ITasksSequence,
	parentTask: string = '',
	cache: IGulpAddTasksOptions = defaultGulpAddTasksOptions
): ITasksSequence
{
	if (typeof tasks === 'function')
	{
		tasks = tasks() as ITasksSequence;
	}

	for (let i in tasks)
	{
		if (Array.isArray(tasks[i]))
		{
			tasks[i] = prefixTasks(tasks[i], parentTask, cache);
		}
		else if (typeof tasks[i] == 'string')
		{
			tasks[i] = prefixTasks([tasks[i]], parentTask, cache)[0];
		}
	}

	return tasks || [];
}

export function prefixTasks(tasks: ITasksSequence | any = [],
	parentTask: string = '',
	cache: IGulpAddTasksOptions = defaultGulpAddTasksOptions
): Array<string>
{
	if (tasks && !Array.isArray(tasks))
	{
		tasks = [tasks as any];
	}

	return (tasks || []).map(function (v: string)
	{
		if (typeof v !== 'string') return v;

		if (!cache.sep)
		{
			return v;
		}

		if (cache.root !== '' && v.indexOf(`~${cache.sep}`) === 0)
		{
			return v.replace(`~${cache.sep}`, `${cache.root}${cache.sep}`)
		}

		if (v.indexOf(cache.sep) === 0)
		{
			if (parentTask === '')
			{
				return v.substr(cache.sep.length);
			}

			return parentTask + v;
		}

		return v;
	});
}

export function validTaskObject(taskObject: ITaskObject): false | ITaskObject
{
	let type = typeof taskObject;

	if (type === 'function')
	{
		return taskObject;
	}

	if (type === 'object')
	{
		for (let k of Object.keys(taskObject))
		{
			if (['function', 'object', 'string'].includes(typeof taskObject[k]))
			{
				return taskObject;
			}
		}
	}

	return false;
}

export function addTasksToGulp(gulp,
	rs,
	taskObject: ITaskObjectList,
	parentTask: string = '',
	cache: IGulpAddTasksOptions = defaultGulpAddTasksOptions
): void
{
	for (let taskName in taskObject)
	{
		const taskImpl = taskObject[taskName] as ITaskObject;

		if (parentTask)
		{
			taskName = `${parentTask}:${taskName}`;
		}

		if (Object.keys(taskImpl).indexOf('callback') > -1)
		{
			let taskFn: ITaskCallback;

			if (isTaskListObject(taskImpl))
			{
				taskFn = async function (...argv): Promise<any | void>
				{
					await new Promise(function (resolve, reject)
					{
						rs.use(gulp)(...((getTasks(taskImpl.tasks, parentTask, cache) as Array<any>).concat(resolve)))
					});

					await taskImpl.callback.call(this, ...argv);
				};
			}
			else
			{
				taskFn = taskImpl.callback;
			}

			gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask, cache), taskFn, getOptions(taskImpl));
		}
		else if (typeof taskImpl === 'function' || isTaskListObject(taskImpl))
		{
			const taskFn: ITaskCallback = typeof taskImpl === 'function' ? taskImpl : function (done)
			{
				return rs.use(gulp)(...(getTasks(taskImpl.tasks, parentTask, cache)).concat(done));
			};
			gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask, cache), taskFn, getOptions(taskImpl));
		}
		else if (Object.keys(taskImpl).indexOf('deps') > -1)
		{
			gulp.task(taskName, taskImpl.description, prefixTasks(taskImpl.deps, parentTask, cache), () => {}, getOptions(taskImpl));
		}
		else if (!validTaskObject(taskImpl))
		{
			let { inspect } = require('util');

			throw new TypeError(`argument:taskObject ${inspect(taskImpl)} not a valid ITaskObject`);
		}
		else
		{
			addTasksToGulp(gulp, rs, taskImpl as ITaskObjectList, taskName, cache);
		}
	}
}

export interface IGulpAddTasksOptions
{
	root?: string;
	sep?: string;

	runSequence?;
}

export const defaultGulpAddTasksOptions = {

	sep: SEP,
	runSequence: runSequence,

} as IGulpAddTasksOptions;

export interface IGulpHelp extends gulp.Gulp
{
	task: IGulpHelpTask;
}

export interface IGulpHelpTask
{
	help;

	[index: string]: any;
}

export function gulpAddTasks(gulpInstance,
	parentTaskName: string | string[] = '',
	options: IGulpAddTasksOptions = defaultGulpAddTasksOptions
)
{
	if (!looksLikeGulp(gulpInstance))
	{
		throw new Error('An instance of gulp is required as the first argument');
	}

	if (Array.isArray(parentTaskName))
	{
		parentTaskName = parentTaskName.join(options.sep ? options.sep : SEP);
	}

	const cache = Object.assign({

		root: parentTaskName,

	}, defaultGulpAddTasksOptions, options) as IGulpAddTasksOptions;

	let fn = function (...taskObjects): IGulpHelp
	{
		const gulp = looksLikeGulpHelp(gulpInstance) ? gulpInstance : gulpHelp(gulpInstance);

		gulp.options = gulp.options || {};
		gulp.options.gulpAddTasks = cache;

		taskObjects
			.forEach((taskObject: ITaskObjectList) =>
			{
				addTasksToGulp(gulp, cache.runSequence, taskObject, parentTaskName as string, cache);
			});

		return gulp;
	};

	return fn;
}

export { gulpAddTasks as init, runSequence, gulpHelp, SEP };

export default gulpAddTasks;
