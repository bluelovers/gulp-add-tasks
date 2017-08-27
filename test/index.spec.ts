
import { expect } from 'chai';
import addTasks from '..';

describe('add-tasks', () => {
  let gulpInstance;

  beforeEach(() => {
    gulpInstance = require('gulp');
  });

  it('throws an error if non-gulp instance as first arg', () => {
    expect(() => addTasks({})).to.throw();
  });

  it('returns an instance of gulp-help', () => {
    const gulp = addTasks(gulpInstance)();
    [
      'dest',
      'src',
      'task',
      'watch'
    ].forEach((fn: string) => {
      expect(gulp).to.respondTo(fn);
    });

    expect(gulp.tasks.help).to.not.be.undefined;
  });

  it('adds tasks to gulp with a mapped function object', () => {
    const gulp = addTasks(gulpInstance)({
      build() {
        console.log('hello');
      }
    });

    expect(gulp.tasks.build).to.not.be.undefined;
  });

  it('adds tasks to gulp with task-list structure', () => {
    const gulp = addTasks(gulpInstance)({
      transpile: {
        description: 'Build assets',
        tasks: [
          'babel',
          'copy'
        ]
      }
    });

    expect(gulp.tasks.transpile).to.not.be.undefined;
  });

  describe('recursive task adding', () => {
    [
      [
        'adds tasks 1 level deep',
        {
          copy: {
            dist: function() {
              console.log('copying to dist');
            }
          }
        },
        'copy:dist'
      ],
      [
        'adds tasks 2 levels deep',
        {
          copy: {
            dist: {
              other: function() {
                console.log('copying to dist/other');
              }
            }
          }
        },
        'copy:dist:other'
      ]
    ].forEach(([description, taskList, expectation]) => {
      it(`${description}`, () => {
        const gulp = addTasks(gulpInstance)(taskList);
        expect(gulp.tasks[`${expectation}`]).to.not.be.undefined;
      });
    });
  });

  /*
  it.only('can use a function for the tasks property', () => {
  });
  */
});
