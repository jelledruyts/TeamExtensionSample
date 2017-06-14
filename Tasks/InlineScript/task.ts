import os = require('os');
import path = require('path');
import uuid = require('uuid');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

async function run() {
    try {
        let isWindows = os.type() == 'Windows_NT';
        let scriptPath = path.join(tl.getVariable('System.DefaultWorkingDirectory'), 'script-' + uuid.v1());
        if (isWindows) {
            scriptPath += '.bat';
        }
        else {
            scriptPath += '.sh';
        }
        try {
            let script = tl.getInput('script', true);
            if (isWindows) {
                let echoOff = tl.getBoolInput('echoOff', false);
                if (echoOff) {
                    script = "@ECHO OFF\r\n" + script;
                }
            }

            tl.debug(`Creating temporary script file '${scriptPath}'`)
            tl.writeFile(scriptPath, script);

            let workingFolder = tl.getPathInput('workingFolder', false, false);
            if (workingFolder) {
                tl.debug(`Setting working folder to '${workingFolder}'`);
                tl.mkdirP(workingFolder);
                tl.cd(workingFolder);
            }

            let failOnStandardError = tl.getBoolInput('failOnStandardError', false);

            let tool;
            if (isWindows) {
                tool = tl.tool(tl.which(scriptPath, true));
            }
            else {
                tool = tl.tool(tl.which('bash', true));
                tool.arg(scriptPath);
            }

            await tool.exec(<trm.IExecOptions>{ failOnStdErr: failOnStandardError });
        }
        finally {
            tl.debug(`Deleting temporary script file '${scriptPath}'`)
            tl.rmRF(scriptPath);
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();