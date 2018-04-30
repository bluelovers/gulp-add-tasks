import runSequence from 'gulp-run-seq-unique/run-sequence';
import * as gulpHelp from 'gulp-help';
import * as gulp from 'gulp';
export interface ITaskObject {
    aliases?: string[];
    description?: string;
    options?: ITaskOptions;
    tasks?: ITasksSequence;
    deps?: Array<string>;
    callback?: ITaskCallback;
}
export interface ITaskObjectList {
    default?: ITaskObject | ITaskCallback;
    [key: string]: ITaskObjectList | ITaskCallback | ITaskObject;
}
export interface ITaskCallback extends Function {
    (done?: any): void | any | Promise<any | void>;
}
export interface ITaskOptions {
    options?: any;
    aliases?: string[];
}
export interface IExportDefault extends Function {
    (...taskObjects: any[]): any;
}
export interface ITasksSequence extends Array<string | string[]> {
    [index: number]: string | string[];
}
declare const SEP = ":";
export declare function looksLikeGulp(gulp: any): boolean;
export declare function looksLikeGulpHelp(gulp: any): boolean;
export declare function getOptions(impl: any | ITaskOptions): ITaskOptions;
export declare function isTaskListObject(impl?: any): boolean;
export declare function getTasks(tasks: any | ITasksSequence, parentTask?: string, cache?: IGulpAddTasksOptions): ITasksSequence;
export declare function prefixTasks(tasks?: ITasksSequence | any, parentTask?: string, cache?: IGulpAddTasksOptions): Array<string>;
export declare function validTaskObject(taskObject: ITaskObject): false | ITaskObject;
export declare function addTasksToGulp(gulp: any, rs: any, taskObject: ITaskObjectList, parentTask?: string, cache?: IGulpAddTasksOptions): void;
export interface IGulpAddTasksOptions {
    root?: string;
    sep?: string;
    runSequence?: any;
    gulpHelp?: any;
}
export declare const defaultGulpAddTasksOptions: IGulpAddTasksOptions;
export interface IGulpHelp extends gulp.Gulp {
    task: IGulpHelpTask;
}
export interface IGulpHelpTask {
    help: any;
    [index: string]: any;
}
export declare function gulpAddTasks(gulpInstance: any, parentTaskName?: string | string[], options?: IGulpAddTasksOptions): (...taskObjects: ITaskObjectList[]) => IGulpHelp;
export { gulpAddTasks as init, runSequence, gulpHelp, SEP };
export default gulpAddTasks;
