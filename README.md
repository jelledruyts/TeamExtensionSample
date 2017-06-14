# Getting Started

## Prerequisites

Install [Node.js](https://nodejs.org/en/) (this includes npm).

Install or upgrade npm to the latest version (optional):

```dos
npm install npm@latest -g
```

Install or update the TFX CLI:

```dos
npm install tfx-cli -g
```

Install or update TypeScript (optional):

```dos
npm install typescript -g
```

Install or update "typings" to get TypeScript typing files (optional):

```dos
npm install typings -g
```

## Prepare

Instruct git to ignore certain directories and files:
* All `node_modules` directories (on a build server, you should run `npm install` to restore packages)
* JavaScript files (as they are compiled from TypeScript)
* Runtime `.taskkey` files created when running tasks locally
* VSIX files (if you package the tasks into an extension file)

A typical `.gitignore` file could look like this:

```txt
node_modules
*.js
*.js.map
.taskkey
*.vsix
```

Create the `tsconfig.json` TypeScript Compiler Options file:

```dos
tsc --init
```

Change the `tsconfig.json` file:
* Change `target` to `es6` (for async/await support)
* Add an `include` for `**/task.ts` (to compile `task.ts` files in all subdirectories)

A minimal `tsconfig.json` file could look as follows:

```json
{
  "compilerOptions": {
    "target": "es6",
  },
  "include": [
    "**/task.ts"
  ]
}
```

## Create a Task

Scaffold a basic build/release task:

```dos
tfx build tasks create
```

This creates a directory for the task containing the `task.json` file (with a unique task id) as well as a sample implementation for Node.js (`sample.js`) and PowerShell (`sample.ps1`).

Change to the task directory and delete the sample implementations:

```dos
del sample.js
del sample.ps1
```

Edit the `task.json` file to set the `execution/Node/target` entry to `task.js` and remove the `execution/PowerShell3`entry.

Create a basic `package.json` file for npm:

```dos
npm init
```

Install the `vsts-task-lib` helper library:

```dos
npm install vsts-task-lib –-save
```

Install TypeScript definitions for dependencies (those for `vsts-task-lib` are included):

```dos
npm install @types/minimatch --save-dev
npm install @types/mockery --save-dev
npm install @types/node --save-dev
npm install @types/q --save-dev
npm install @types/semver --save-dev
npm install @types/shelljs --save-dev
npm install @types/uuid --save-dev
```

Create a new `task.ts` file and copy the following sample contents into it:

```javascript
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

async function run() {
    try {
        let message = tl.getInput('msg', false) || 'Hello, World!';
        let tool = tl.tool(tl.which('cmd'));
        tool.arg('/c');
        tool.arg('echo ' + message);
        let exitCode = await tool.exec();
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
```

Compile `task.ts` into `task.js`:

```dos
tsc
```

## Test a Task

Run Node on the compiled task:

```dos
node task.js
```

If you need variables to be passed to the task, set an environment variable prefixed with `INPUT_` and run again:

```dos
SET INPUT_MSG=How are you?
node task.js
```

## Resources

* Official guide: [Step by Step: Node Task with TypeScript API](https://github.com/Microsoft/vsts-task-lib/blob/master/node/docs/stepbystep.md)
* Colin's guide on Developing a custom Build vNext Task: [part 1](http://www.colinsalmcorner.com/post/developing-a-custom-build-vnext-task-part-1) and [part 2](http://www.colinsalmcorner.com/post/developing-a-custom-build-vnext-task-part-2)
