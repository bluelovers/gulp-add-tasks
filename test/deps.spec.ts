/**
 * Created by user on 2017/8/27/027.
 */

import { relative, expect } from './_local-dev';
import { init, getTasks, prefixTasks } from '..';

describe(relative(__filename), () =>
{
	let gulpInstance;

	beforeEach(() =>
	{
		gulpInstance = require('gulp');
	});

	let taskList = {
		copy: {

			'a': () =>
			{

			},

			b: {
				deps: [
					':a',
				],
			},

			'c': () =>
			{

			},

			d: {
				deps: [
					':a',
				],

				tasks: [
					':c',
					[
						':b',
					]
				],
			},
		}
	};

	it(`check:deps`, () =>
	{
		const gulp = init(gulpInstance)(taskList);
		expect(gulp).to.be.exist;

		[
			[
				'copy:a',
				[],
			],
			[
				'copy:b',
				[
					'copy:a'
				],
			],
			[
				'copy:c',
				[

				],
			],
			[
				'copy:d',
				[
					'copy:a'
				],
			],
		].forEach(([name, expectation], index, array) =>
		{
			let task = gulp.tasks[`${name}`];

			//console.log(name, task);

			expect(task).to.be.exist;
			expect(task.dep).to.deep.equal(expectation);

		});
	})

});
