import fs from 'fs-extra';
import path from 'path';
import { run } from "../../src/lib/utils";

describe('E2E Tests', () => {

    ['abxpython', 'abx_all','nodejs', 'python', 'powershell', "node:12", "node:14", "powercli:12-powershell-7.1", "powercli:11-powershell-6.2"]
    .map(runtime => runtime.replace(/[:\-.]/g, "_"))
    .filter(runtime => fs.existsSync(path.join('test', 'e2e', runtime)))
    .forEach(runtime => {
        describe(`Packaging ${runtime}`, () => {
            const processCwd = process.cwd();

            beforeEach(`Cleaning up ${runtime}`, async () => {
                process.chdir(processCwd);
                await run([{cmd: 'npm', args: ['run', 'clean']}], path.join('test', 'e2e', runtime))
            })

            it(`Packaging ${runtime}`, async () => {
                const projectDir = path.resolve('test', 'e2e', runtime);
                process.chdir(projectDir);
                const environment = ["abxpython", "abx_all", "nodejs", "python", "powershell"].indexOf(runtime) != -1 ? "abx": "vro";

                // Add the commands to run in sequence here
                const commands = [
                    [{cmd: '../../../bin/polyglotpkg', args:['-e', environment]}],
                    [{cmd: 'echo', args: ['Command 2']}],
                    [{cmd: 'echo', args: ['Command 3']}]
                ];

                for (const command of commands) {
                    await run(command);
                }
            })

        })
    })

});

