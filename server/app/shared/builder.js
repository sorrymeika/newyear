
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const fsPromises = fs.promises;

function createBuilder(project, app) {
    let logs = [];
    const { id: projectId, path: projectPath, gitUrl } = project;

    function log(...args) {
        logs.push(args.join(' '));
        console.log(...args);
    }

    function flushLogs() {
        const res = logs;
        logs = [];
        return res;
    }

    function getLogs() {
        return logs;
    }

    async function doAutoConfig(autoConfig, buildFn) {
        const packageJson = JSON.parse(await fsPromises.readFile(path.join(projectPath, 'package.json'), 'utf-8'));

        log('start autoconfig!');

        const config = {
            version: packageJson.version
        };

        await Promise.all(autoConfig.map((conf) => {
            return new Promise((resolve, reject) => {
                fs.readFile(conf.template, 'utf-8', (err, text) => {
                    if (err) return reject(err);

                    text = text.replace(/\${(\w+?)}/g, (match, key) => {
                        return config[key];
                    });
                    const destFile = conf.destFile;

                    fs.writeFile(destFile, text, 'utf8', (err) => {
                        if (err) return reject(err);

                        resolve();
                    });
                });
            });
        }));

        log('autoconfig finished!');

        await buildFn();
    }

    function execCommand(command, args, options) {
        return new Promise((resolve) => {
            log(`start exec command: '${[command, ...args].join(' ')}'`);

            const cmd = childProcess.spawn(command, args, {
                cwd: projectPath,
                env: project.type === 1 ? { ...process.env, NODE_ENV: 'development' } : process.env,
                ...options
            });

            cmd.stdout.on('data', (data) => {
                log(data.toString('utf8'));
            });

            cmd.stderr.on('data', (data) => {
                log(data.toString('utf8'));
            });

            cmd.on('close', (code) => {
                log(`exec command '${[command, ...args].join(' ')}' exited with code ${code}`);
                resolve();
            });
        });
    }

    let running = false;
    let success;

    async function buildProject() {
        if (running) return;
        running = true;
        success = false;
        logs = ['start build!', JSON.stringify(project)];

        await app.mysql.query('update project set status=2 where id=?', [projectId]);

        await execCommand('git', ['clone', gitUrl], {
            cwd: projectPath
                .replace(/[/]$/, '')
                .replace(/[^/]+$/, '')
        });

        await execCommand('git', ['fetch', '--all']);
        await execCommand('git', ['reset', '--hard', 'origin/master']);
        await execCommand('git', ['pull']);

        const buildConfigJson = JSON.parse(await fsPromises.readFile(path.join(projectPath, 'build-config/config.json'), 'utf-8'));

        log('read `build-config/config.json`!', JSON.stringify(buildConfigJson));

        const buildCommands = buildConfigJson.buildCommands;
        const autoConfig = (buildConfigJson.autoConfig || []).map(({ template, destFile }) => {
            return {
                template: path.join(projectPath, 'build-config/', template),
                destFile: path.join(projectPath, destFile)
            };
        });

        await doAutoConfig(autoConfig, async () => {
            log('exec build commands!');

            for (let i = 0; i < buildCommands.length; i++) {
                const [commandString, options] = Array.isArray(buildCommands[i]) ? buildCommands[i] : [buildCommands[i], {}];
                const commandArgs = commandString.split(/\s+/);
                const command = commandArgs.shift();

                if (options.cwd) {
                    options.cwd = path.join(projectPath, options.cwd);
                }

                await execCommand(command, commandArgs, options);
            }

            log('exec build commands finish!');
        });

        log('build finish!');
        running = false;
        success = true;
        await app.mysql.query('update project set status=1 where id=?', [projectId]);
    }

    return {
        build: () => {
            return buildProject()
                .catch(async e => {
                    log(e.message);

                    await app.mysql.query('update project set status=3 where id=?', [projectId]);

                    running = false;
                    success = false;
                });
        },
        flushLogs,
        getLogs,
        get running() {
            return running;
        },
        get success() {
            return success;
        }
    };
}

exports.createBuilder = createBuilder;