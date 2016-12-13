const isArray = require('lodash.isarray');
const isObject = require('lodash.isobject');
const reject = require('lodash.reject');
const isEqual = require('lodash.isequal');

const defaultOpts = {
    // options: true | false
    keepLonelyDashes: false,
    // options: 'all' | 'none' | 'noflag'
    assignments: 'all',
}


/********************************* MODULE LOGIC HELPER FUNCTIONS **********************************/
/**
 * Returns false for any arg containing an =
 * @param  {string} arg - CLI argument string - check for =
 */
const isAnyAssignmentArg = (arg) => {
    return !!arg.match(/.*=.*/g);
}

const isAssignmentFlagArg = (arg) => {
    return !!arg.match(/^--?(([a-zA-Z0-9_]+.*)|("[a-zA-Z0-9_]+.*")|('[a-zA-Z0-9_]+.*'))=.+$/);
}

const notAssignmentFlagArg = (arg) => {
    return !isAssignmentFlagArg(arg);
}

const startDashesThenNonDashes = (arg) => {
    return !!arg.match(/^--?[a-zA-Z0-9_]+/gim);
}

const startsWithDash = (arg) => {
    return !!arg.match(/^-/gim);
}

const isStandaloneDashes = (arg) => {
    return !!arg.match(/^--?-?$/gim);
}

/******************** MODULE SCAFFOLDING HELPERS (ARGUMENTS, VALIDATION, ETC.) ********************/
/**
 * Remove dashes, underscores, and uppercase values from options, and removes trailing "s".
 * (Note: sort of a dirty solution, but I was feeling lazy)
 *
 * @param  {String} opt - option string
 * @return {String} cleaned option string
 */
function cleanOpt(opt) {
    return opt.toLowerCase().split('-').join('').split('_').join('').split(/s$/mi).join('')
}

/**
 * Validate options object. Throw if invalid
 * @param  {Object} opts
 */
function validateOpts(opts) {
    switch(cleanOpt(opts.assignments)) {
        case "all":
        case "noflag":
        case "none":
            return 'ok';
        default:
            throw new TypeError(
                'opts.assignments must be a string equal to "all", "none", or "noFlags"'
            );
    }
}

const isOptsInArgOneToFilterArgv = (argvs, opts) => {
    return ((!isArray(argvs)) && (isObject(argvs)) && (isEqual(opts, defaultOpts)));
}

/**
 * Alter and reposition arguments passed to filteredArgv if needed.
 * If options object given but no cli arguments list, reassign options arg to receive
 * content of first argument (argvs).
 * Clean the value of assignments option.
 *
 * @param  {Array | Object} argvs
 * @param  {Object} opts
 * @return {Object}
 */
function normalizefilteredArgvArguments(argvs, opts) {
    // reassign accordingly if only options were passed in
    if (isOptsInArgOneToFilterArgv(argvs, opts)) {
        opts = Object.assign({}, defaultOpts, argvs);
        argvs = process.argv;
    }
    validateOpts(opts);
    opts.assignments = cleanOpt(opts.assignments);
    return { cleanArgvs: argvs, cleanOpts: opts };
}

/***************************************** MAIN FUNCTION ******************************************/
/**
 * Exclude all 'flags' from list of arguments passed to a script via the terminal
 * @param  {Array<String>} argvs - cli args list {OPTIONAL; defaults to process.argv}
 * @param  {Object} opts - options object
 *
 * @return {Array<String}  cli args with flags excluded
 */
const filteredArgv = (argvs = process.argv, opts = defaultOpts) => {
    const { cleanArgvs, cleanOpts } = normalizefilteredArgvArguments(argvs, opts);

    const output = reject(cleanArgvs, (arg) => {
        const startDashPlusOther = startDashesThenNonDashes(arg);
        if (cleanOpts.assignments === 'all' && isAnyAssignmentArg(arg)) return false;
        if ((cleanOpt(cleanOpts.assignments) === 'noflag') && isAssignmentFlagArg(arg)) return true;
        if ((cleanOpts.assignments === 'none') && isAnyAssignmentArg(arg)) return true;
        if (isStandaloneDashes(arg)) return !cleanOpts.keepLonelyDashes;
        if (startDashesThenNonDashes(arg)) return true;
    });
    return output;
}

/********************************************* EXPORT *********************************************/

module.exports = (process.env.__FILTER_ARGV_MOCHA_MODULE_TESTING__)
    ? {
        filteredArgv,
        startDashesThenNonDashes,
        startsWithDash,
        isAssignmentFlagArg,
        isStandaloneDashes
    } 
    : { filteredArgv }
