/**
 * Created by user on 2017/8/27/027.
 */

export default {
	'a': function ()
	{
		//console.debug(':a');
	},

	b: {
		deps: [
			':a',
		],
		callback()
		{
			//console.debug(':b');
		},
	},

	'c': {
		deps: [
			':b',
		],
		callback(done)
		{
			setTimeout(() =>
			{
				//console.debug(':c');

				done();
			}, 500);
		},
	},

	d: {
		tasks: [
			':timeout-500',
		],
		callback()
		{
			//console.debug(':d');
		},
	},

	e: {
		tasks: [
			[':timeout-500'],
			[':async', ':d'],
		],

		deps: [
			':c',
		],

		callback()
		{
			//console.debug(':e');
		},
	},

	f: {
		tasks: [
			[':timeout-500'],
			[':d', ':async'],
		],

		deps: [
			':c',
		],

		callback()
		{
			//console.debug(':f');
		},
	},

	g: {
		deps: [
			':f',
		],

		callback()
		{
			//console.debug(':f');
		},
	},

	'timeout-500': (done) =>
	{
		setTimeout(() =>
		{
			//console.debug(':timeout-500');

			done();
		}, 500);
	},

	'async': async (done) =>
	{
		await new Promise(function (resolve, reject)
		{
			setTimeout(() =>
			{
				//console.debug(':async');

				resolve();
			}, 100);
		});
	},
};

export const expect = [
	[
		`:a`,
		[
			`:a`,
		],
	],
	[
		`:b`,
		[
			`:a`,
			`:b`,
		],
	],
	[
		`:c`,
		[
			':a',
			':b',
			':c',
		],
	],
	[
		`:d`,
		[
			':timeout-500',
			':d',
		],
	],
	[
		`:e`,
		[
			':a',
			':b',
			':c',
			':timeout-500',
			':async',
			':timeout-500',
			':d',
			':e',
		],
	],
	[
		`:f`,
		[
			':a',
			':b',
			':c',
			':timeout-500',
			':async',
			':timeout-500',
			':d',
			':f',
		],
	],
	[
		`:g`,
		[
			':a',
			':b',
			':c',
			':timeout-500',
			':async',
			':timeout-500',
			':d',
			':f',
			':g',
		],
	],
];
