/*********************************** IMPORT THIRD-PARTY MODULES ***********************************/
const isArray = require('lodash.isarray');
const isObject = require('lodash.isobject');
const reject = require('lodash.reject');
const isEqual = require('lodash.isequal');

/***************************************** CONFIGURATION ******************************************/
const defaultOpts = {
    // options: true | false
    keepLonelyDashes: false,
    // options: 'all' | 'none' | 'noflag'
    assignments: 'all',
    // options: true | false
    flags: false,
    // options: true | false
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

const isOptsInArgOneOfFilterArgv = (argvs, opts) => {
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
    if (isOptsInArgOneOfFilterArgv(argvs, opts)) {
        opts = Object.assign({}, defaultOpts, argvs);
        argvs = process.argv;
    }
    if (isEqual(opts, defaultOpts)) {
        opts = Object.assign({}, defaultOpts, opts);
    }
    validateOpts(opts);
    opts.assignments = cleanOpt(opts.assignments);
    return { cleanArgvs: argvs, cleanOpts: opts };
}


/************************************** PSEUDO-STATE MACHINE **************************************/
/**
 * Determine the CLI arg type:
 *     'lonely-dashes' | 'assignment-flag' | 'assignment-normal' | 'flag' | 'normal'
 * @param  {String} arg - CLI argument
 * @return {String{ENUM}} - CLI arg type. Acts as an enum.
 */
const setState = (arg) => {
    if (isStandaloneDashes(arg)) {
        return 'lonely-dashes';
    }
    if (isAssignmentFlagArg(arg)) {
        return 'assignment-flag';
    }
    if (isAnyAssignmentArg(arg) && !isAssignmentFlagArg(arg)) {
        return 'assignment-normal';
    }
    if (startDashesThenNonDashes(arg)) {
        return 'flag';
    }
    if (!isStandaloneDashes(arg) && !isAssignmentFlagArg(arg) && !startDashesThenNonDashes(arg)) {
        return 'normal';
    }

    console.error(new TypeError(`unknown argument type passed on command line: ${arg}`));
    throw new TypeError(`unknown argument type passed on command line: ${arg}`);
}

/**
 * Determine whether to keep the argument in the output by comparing the CLI arg
 * type against the chosen options.
 */
const resolveOptsToState = (state, opts) => {
    switch(state) {
        case "lonely-dashes":
            return opts.keepLonelyDashes;
        case "assignment-flag":
            return (opts.assignments !== 'none' && opts.assignments !== 'noflag');
        case "assignment-normal":
            return (opts.assignments !== 'none');
        case "flag":
            return opts.flags;
        case "normal":
            return opts.standardArgs;
        default:
            throw new TypeError('resolveOptsToState: Unknown CLI argument type, unknown state');
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
    return reject(cleanArgvs, (arg) => !resolveOptsToState(setState(arg), cleanOpts));
}


/************************************* CONVENIENCE FUNCTIONS **************************************/
/**
 * Return assignment-related arguments of all types (both flag and standard)
 * @param  {Array<String>} argvs - cli args list {OPTIONAL; defaults to process.argv}
 * @return {Array<String>} list of assignment args (args with =) from the CLI args list
 */
const getAssignmentArgsOnly = (argvs = process.argv) => {
    return filterArgv(argvs, {
        flags: false,
        standardArgs: false,
        assignments: 'all',
        keepLonelyDashes: false
    });
};

/**
 * Return flag arguments from CLI args list
 * @param  {Array<String>} argvs - cli args list {OPTIONAL; defaults to process.argv}
 * @return {Array<String>} list of flags (--aasdf, -B style arguments) from the CLI args list
 */
const getStandardFlags = (argvs = process.argv) => {
    return filterArgv(argvs, {
        flags: true,
        standardArgs: false,
        assignments: 'none',
        keepLonelyDashes: false
    });
}


/********************************************* EXPORT *********************************************/
module.exports = (process.env.__FILTER_ARGV_MOCHA_MODULE_TESTING__)
    ? {
        filterArgv,
        getAssignmentArgsOnly,
        getStandardFlags,
        startDashesThenNonDashes,
        startsWithDash,
        isAssignmentFlagArg,
        isStandaloneDashes,
        validateOpts,
    } 
    : {
        filterArgv,
        getAssignmentArgsOnly,
        getStandardFlags,
      }
