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

	it('check:prefixTasks', () =>
	{
		let parentTasks = 'gulp-add-tasks2';

		[
				[
					['a'],
					['a']
				],
				[
					'a',
					['a']
				],
				[
					[':b'],
					[`${parentTasks}:b`]
				],
				[
					':b',
					[`${parentTasks}:b`]
				],
				[
					[
						':c',
						':d',
						1
					],
					[
						`${parentTasks}:c`,
						`${parentTasks}:d`,
						1
					]
				],
			]
			.forEach(([task, expectation]) =>
			{
				expect(prefixTasks(task as any, parentTasks)).to.deep.equal(expectation);
			})
		;
	});

	it('check:getTasks', () =>
	{
		let parentTasks = 'gulp-add-tasks2';

		[
				[
					['a'],
					['a']
				],
				[
					[':b'],
					[`${parentTasks}:b`]
				],
				[
					[
						':c',
						':d',
					],
					[
						`${parentTasks}:c`,
						`${parentTasks}:d`,
					]
				],
				[
					[
						':c',
						':d',
						[
							':e',
							':f',
						],
					],
					[
						`${parentTasks}:c`,
						`${parentTasks}:d`,
						[
							`${parentTasks}:e`,
							`${parentTasks}:f`,
						]
					]
				],
			]
			.forEach(([task, expectation]) =>
			{
				expect(getTasks(task as any, parentTasks)).to.deep.equal(expectation);
			})
		;
	});

});
