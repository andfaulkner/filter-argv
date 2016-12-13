# process-argv-minus-flags
Return process.argv with any flag arguments passed via the CLI excluded.

Flag arguments are defined as any parameters beginning with - or --, followed by 1 or non-dash (or space) character.

##Usage

    //my-script.js
    const processArgvMinusFlags = require('process-argv-minus-flags');

    const contentArgsOnly = processArgvMinusFlags();

    console.log(contentArgsOnly)
    // if the script was run with:
    //    node my-script.js --verbose
    //          --> output --> ["node", "my-script.js"]
    //    node my-script.js
    //          --> output --> ["node", "my-script.js"]
    //    my-script.js --verbose create-component SidebarGrid
    //          --> output --> ["my-script.js", "create-component", "SidebarGrid"]
    //    my-script.js --verbose create-component SidebarGrid --debug
    //          --> output --> ["my-script.js", "create-component", "SidebarGrid"]
    //    my-script.js --verbose create-component --name=SidebarGrid --debug
    //          --> output --> ["my-script.js", "create-component", "--name=SidebarGrid"]
    //          - the module doesn't exclude


A trivial little utility, but one I found myself creating again and again across projects.
