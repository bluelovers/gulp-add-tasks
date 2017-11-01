/**
 * Created by user on 2017/8/27/027.
 */

import { relative, expect } from './_local-dev';
import { init, getTasks, prefixTasks } from '../src';
import * as runSequence from 'run-sequence';
import { Gulp } from 'gulp';

import taskList, { expect as taskListExpect } from './demo/seq';

describe(relative(__filename), () =>
{
	let gulpInstance;

	let parentTasks = 'gulp-add-tasks2';

	beforeEach(() =>
	{
		gulpInstance = init(new Gulp, parentTasks, {
			runSequence: runSequence,
		})(taskList);
	});

	describe(`check:seq`, () =>
	{
		taskListExpect.forEach(([name, expectation], index, array) =>
		{
			let label = `${name} = ${(expectation as string[]).join(' , ')}`;

			name = prefixTasks(name as any, parentTasks);
			expectation = prefixTasks(expectation as any, parentTasks);

			it(label, function (done)
			{
				const gulp = gulpInstance;
				//console.log(gulpInstance.tasks);

				expect(gulpInstance.tasks[name as string]).to.be.exist;

				let cache = {
					/**
					 * true order of task run
					 */
					events: [],
				};

				function finish(e)
				{
					gulp.removeListener('task_stop', onTaskEnd);
					gulp.removeListener('task_err', onError);
				}

				function onError(err)
				{
					finish(err);
				}

				function onTaskEnd(event)
				{
					cache.events.push(event.task)
				}

				gulp.on('task_stop', onTaskEnd);
				gulp.on('task_err', onError);

				gulpInstance.run(name, function ()
				{
					let expectation2 = array_unique(expectation as string[]);

					//console.log(this.seq, expectation2);
					//console.log(cache);

					this.seq.sort();
					expectation2.sort();

					//console.log(name, this.tasks[name as string], this.seq);
					expect(this.seq).to.deep.equal(expectation2);
					expect(cache.events).to.deep.equal(expectation);

					done();
				});
			})
		});
	});

});

function array_unique(arr: any[])
{
	return arr.filter(function (elem, pos)
	{
		return arr.indexOf(elem) == pos;
	})
}
