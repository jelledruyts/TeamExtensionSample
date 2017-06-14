import os = require('os');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

async function run() {
    try {
        // Path input.
        let workingFolder = tl.getPathInput('workingFolder', false /* optional */, false /* do not check that path exists */);
        if (workingFolder) {
            tl.debug(`Setting working folder to '${workingFolder}'`);
            tl.mkdirP(workingFolder);
            tl.cd(workingFolder);
        }

        // Boolean input.
        let messageIsMultiLine = tl.getBoolInput('messageIsMultiLine', true /* required */);

        // Regular input.
        let message = messageIsMultiLine ? tl.getInput('messageMultiLine', true) : tl.getInput('messageSingleLine', true);

        // Picklist input.
        let format = tl.getInput('format', true);
        if (format === 'upperCase') {
            tl.debug('Transforming message to upper case.');
            message = message.toUpperCase();
        }
        else if (format === 'lowerCase') {
            tl.debug('Transforming message to lower case.');
            message = message.toLowerCase();
        }
        tl.debug(`Final message: ${message}`);

        let lines = message.split(/\r\n|\r|\n/g);
        tl.debug(`Echoing ${lines.length} line(s)`);
        lines.forEach(async line => {
            // Run a tool.
            let tool: trm.ToolRunner;
            let isWindows = os.type() == 'Windows_NT';
            if (isWindows) {
                tool = tl.tool(tl.which('cmd'));
                tool.arg('/c');
                if (line.trim().length === 0) {
                    tool.arg('echo.');
                } else {
                    tool.arg('echo ' + line);
                }
            }
            else {
                tool = tl.tool(tl.which('echo'));
                tool.arg(line);
            }
            let exitCode = await tool.exec();
        });
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();