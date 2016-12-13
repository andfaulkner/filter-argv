const isArray = require('lodash.isarray');
const isObject = require('lodash.isobject');
const reject = require('lodash.reject');
const isEqual = require('lodash.isequal');

const defaultOpts = {
    // options: true | false
    keepLonelyDashes: false,
    // options: 'all' | 'none' | 'noflag'
    assignments: 'all',
    flags: false,
    standardArgs: true,
};


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
 * Alter and reposition arguments passed to filterArgv if needed.
 * If options object given but no cli arguments list, reassign options arg to receive
 * content of first argument (argvs).
 * Clean the value of assignments option.
 *
 * @param  {Array | Object} argvs
 * @param  {Object} opts
 * @return {Object}
 */
function normalizeFilterArgvArguments(argvs, opts) {
    // reassign accordingly if only options were passed in
    if (isOptsInArgOneToFilterArgv(argvs, opts)) {
        opts = Object.assign({}, defaultOpts, argvs);
        argvs = process.argv;
    }
    validateOpts(opts);
    opts.assignments = cleanOpt(opts.assignments);
    return { cleanArgvs: argvs, cleanOpts: opts };
}

const setState = (arg) => {
    console.log('arg:', arg);
    if (isStandaloneDashes(arg)) return 'lonely-dashes';
    if (isAssignmentFlagArg(arg)) return 'assignment-flag';
    if (isAnyAssignmentArg(arg) && !isAssignmentFlagArg(arg)) return 'assignment-normal';
    if (startDashesThenNonDashes(arg)) return 'flag';
    if (!isStandaloneDashes(arg) && !isAssignmentFlagArg(arg) && !startDashesThenNonDashes(arg)) return 'normal';
    console.error(new TypeError(`unknown argument type passed on command line: ${arg}`));
    throw new TypeError(`unknown argument type passed on command line: ${arg}`);
}

const resolveOptsToState = (state, opts) => {
    console.log('state:', state);
    switch(state) {
        case "lonely-dashes":
            console.log('case lonely-dashes returning');
            return opts.keepLonelyDashes;
        case "assignment-flag":
            console.log('case assignment-flag returning');
            return (opts.assignments !== 'none' && opts.assignments !== 'noflag');
        case "assignment-normal":
            console.log('case assignment-normal returning');
            return (opts.assignments !== 'none');
        case "flag":
            console.log('case flag returning');
            return opts.flags;
        case "normal":
            console.log('case normal returning');
            return opts.standardArgs;
      default:
            console.log('case default returning');
            return opts.standardArgs
    }
}


/***************************************** MAIN FUNCTION ******************************************/
/**
 * Exclude all 'flags' from list of arguments passed to a script via the terminal
 * @param  {Array<String>} argvs - cli args list {OPTIONAL; defaults to process.argv}
 * @param  {Object} opts - options object
 *
 * @return {Array<String}  cli args with flags excluded
 */
const filterArgv = (argvs = process.argv, opts = defaultOpts) => {
    const { cleanArgvs, cleanOpts } = normalizeFilterArgvArguments(argvs, opts);

    const output = reject(cleanArgvs, (arg) => {
        const state = setState(arg);
        console.log('\n\nstate:', state);
        const optState = resolveOptsToState(state, cleanOpts);
        console.log('optState:', optState);
        console.log('cleanOpts:', cleanOpts);
        return !optState;

        if (cleanOpts.flags === true) {
            if (startDashesThenNonDashes(arg)) return false;
        }
        if (cleanOpts.assignments === 'all' && isAnyAssignmentArg(arg)) return false;
        if ((cleanOpt(cleanOpts.assignments) === 'noflag') && isAssignmentFlagArg(arg)) return true;
        if ((cleanOpts.assignments === 'none') && isAnyAssignmentArg(arg)) return true;
        if (isStandaloneDashes(arg)) return !cleanOpts.keepLonelyDashes;
        
        if (cleanOpts.flags) {
            if (startDashesThenNonDashes(arg)) return false;
        } else if (!cleanOpts.flags) {
            if (startDashesThenNonDashes(arg)) return true
        }
    });
    return output;
}

const getAssignmentArgsOnly = (argvs = process.argv) => {
    const output = reject(cleanArgvs, (arg) => {

    });

}

/********************************************* EXPORT *********************************************/

module.exports = (process.env.__FILTER_ARGV_MOCHA_MODULE_TESTING__)
    ? {
        filterArgv,
        startDashesThenNonDashes,
        startsWithDash,
        isAssignmentFlagArg,
        isStandaloneDashes,
        validateOpts
    } 
    : { filterArgv }
