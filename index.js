const reject = require('lodash.reject');

function isAssignmentArg(arg) {
    return arg.match(/^-?[^-]+=.+$/);
}

function startsWithDash(arg) {
    return arg.match(/^--?[^-]+/gim);
}

/**
 * Exclude all 'flags' from list of arguments passed to a script via the terminal
 * @param  {Array<String>} procArgs - cli args list {OPTIONAL; defaults to process.argv}
 * @return {Array<String}  cli args with flags excluded
 */
const cliArgsMinusFlags = (procArgs = process.argv) => {
    return reject(procArgs, (arg, idx, procArgsOrig) => {
        return (startsWithDash(arg) && !(isAssignmentArg(arg)));
    });
}

module.exports = cliArgsMinusFlags;
