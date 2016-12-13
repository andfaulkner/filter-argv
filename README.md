# filter-argv
Utilities for filtering raw process.argv content (i.e. arguments passed via the CLI). Easily extract or exclude flag arguments (e.g. -v, --debug), assignment arguments (e.g. name=meeka, --age=14), standard args (e.g. create-component, load, repl), lonely dashes ('-', '--'), and any combination of argument types.

##Quick examples

    input:
        npm run my-script -- create-component HelloWorld --verbose --debug name=meeka --type=puppy

    in my-script:

        const { filterArgv } = require('filter-argv');

        filterArgv();
            // => ['my-script', 'create-component', 'HelloWorld', 'name=meeka', '--type=puppy']

        filterArgv(process.argv);
            // => ['my-script', 'create-component', 'HelloWorld', 'name=meeka', '--type=puppy']

        filterArgv({ keepLonelyDashes: true });
            // => ['my-script', '--', 'create-component', 'HelloWorld', 'name=meeka', '--type=puppy']

        filterArgv({ keepLonelyDashes: true, assignments: 'none' });
            // => ['my-script', '--', 'create-component', 'HelloWorld']

        filterArgv({ assignments: 'noflag' });
            // => ['my-script', 'create-component', 'HelloWorld', 'name=meeka']

        filterArgv({ standardArgs: false, assignments: 'all' });
            // => ['name=meeka', '--type=puppy']

        filterArgv({ flags: true, standardArgs: false });
            // => ['--verbose', '--debug', 'name=meeka', '--type=puppy']

        filterArgv({ flags: true, standardArgs: false, assignments: 'noflag' });
            // => ['--verbose', '--debug', 'name=meeka']

        filterArgv({ flags: true, standardArgs: false, assignments: 'noflag', keepLonelyDashes: true });
            // => ['--', --verbose', '--debug', 'name=meeka']


##Type signatures

### filterArgv: (processArg?: Array\<String\>, opts?: Options) => Array\<String\>

*   processArg: optional parameter containing a string array, presumably process.argv or a modified form of it. However, any array of strings can be used - it is not limited to process.argv
    *   by default, returns a duplicate of the array with all flag arguments removed.
    *   if no value is passed, defaults to the current value of process.argv
    *   note: if you're parsing process.argv, for convenience you can simply pass in the Options object at this argument. The module will detect it, assign options correctly, & automatically parse the contents of process.argv.

*   opts: (type Options): Provides options for filtering the process arguments.  By default, excludes flag CLI args (e.g. -a, --gbr) not used for assignment (e.g. --name=meeka, -type=puppy).
    *   opts.flags: true | false                          Default: false
        *   if true, keep flags in the returned process.argv object
    *   opts.standardArgs: true | false                   Default: true
        *   if true, keep standard (non-flag, non-assignment) arguments in the output (e.g. meeka, puppy)
    *   opts.assignments: 'all' | 'none' | 'no-flags'     Default: all
        *   'all': keep all assignment args (e.g. --name=meeka, age=43, --etc=ok)
        *   'none': exclude all assignment args
        *   'no-flags': exclude assignment args that are also flags (e.g. --name=meeka)
    *   opts.keepLonelyDashes: true | false               Default: false
        *   if true, keep isolated dashes ('-', '--', '---') in the output


Examples

    //my-script.js
    const { filterArgv } = require('filter-argv');

    const contentArgsOnly = filterArgv();
    console.log(contentArgsOnly);

The output of the above example will vary based on how the script was run (from the terminal). e.g.:

    input:   node my-script.js --verbose
    output:  ["node", "my-script.js"]

    input:   node my-script.js
    output:  ["node", "my-script.js"]

    input:   my-script.js --verbose create-component SidebarGrid
    output:  ["my-script.js", "create-component", "SidebarGrid"]
 
    input:   my-script.js --verbose create-component SidebarGrid --debug
    output:  ["my-script.js", "create-component", "SidebarGrid"]

    input:   my-script.js --verbose create-component --name=SidebarGrid --debug
    output:  ["my-script.js", "create-component", "--name=SidebarGrid"]

Other filterArgv examples :

    const contentArgsOnly = filterArgv(process.argv); // mainly for explicitness
    const contentArgsOnly = filterArgv(['hello', '--flag', 'custom', 'array', 'example']); 
    const contentArgsOnly = filterArgv({
        assignments: 'noflag',
        flags: true,
        standardArgs: false,
        keepLonelyDashes: true
    }); 


### getStandardFlags: (argv?: Array<String>) => Array<String>
Convenience function to return a list of the flags in an arguments list. e.g.

    getStandardFlags(['--verbose', 'reth', '--asdf=fghj', '--debug', 'boo']);
        // => ['--verbose', '--debug']


### getAssignmentArgsOnly: (argv?: Array<String>) => Array<String>
Convenience function to return a list of the assignment args in an arguments list. e.g.

    getAssignmentArgsOnly(['--verbose', 'reth', '--asdf=fghj', '--debug', 'boo', 'type=Bear']);
        // => ['--asdf=fghj', 'type=Bear']



----

(A trivial utility for sure, but one I found myself creating again and again across projects)
