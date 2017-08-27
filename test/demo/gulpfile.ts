/**
 * Created by user on 2017/8/27/027.
 */

import { relative, expect } from '../_local-dev';
import { init, getTasks, prefixTasks } from '../..';
import * as runSequence from 'run-sequence';
import * as gulp from 'gulp';

let parentTasks = 'gulp-add-tasks2';

import taskList from './seq';

init(gulp, parentTasks)(taskList);
