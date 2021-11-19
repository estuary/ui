import cors from 'cors';
import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import json2yaml from 'json2yaml';
import * as pty from 'node-pty';
import shellJS from 'shelljs';
import allSources from './allSources.js';

const { exec } = shellJS;

//////////////////////////////
//  █▀▀ █▀█ █▄░█ █▀▀ █ █▀▀  //
//  █▄▄ █▄█ █░▀█ █▀░ █ █▄█  //
//////////////////////////////
const homedir = process.env.HOME;
const schemaStorage = './schema-local-cache/';
const requestStorage = './requests/';
const captureStorage = requestStorage + '/captures/';
const flowDevDirectory = homedir + '/stuff/test-flow/';

//////////////////////////////////
//  █░█ █▀▀ █░░ █▀█ █▀▀ █▀█ █▀  //
//  █▀█ ██▄ █▄▄ █▀▀ ██▄ █▀▄ ▄█  //
//////////////////////////////////
function getJSONFromStdOut(data) {
    // WARNING!!
    // This only works on the responses from docker via stdout.
    // It assumes the valid JSON is all on one line.

    // Split up each line
    let response = data.split('\n');

    // Find the first line that starts with a curly and can be parsed to contain a spec object
    response = response.filter(
        (lineString) =>
            lineString.startsWith('{') &&
            JSON.parse(lineString).hasOwnProperty('spec')
    )[0];

    return response;
}

function safeJSONParse(data) {
    let response;
    try {
        response = JSON.parse(data);
    } catch (error) {
        response = JSON.parse(getJSONFromStdOut(data));
    }

    return response;
}

function removePrefix(name) {
    const prefix = 'source-';
    let labelName = name;
    labelName = labelName.replace(prefix, '');
    labelName = labelName.replace('-', ' ');

    return labelName;
}

function writeResponseToFileSystem(testFolder, fileName, fileContent) {
    fs.writeFileSync(testFolder + fileName, fileContent, 'utf-8');
}

function saveSchemaResponse(image, name, fetchedOn, stdout, res) {
    const pargedResponse = safeJSONParse(stdout);
    const data = {};

    data.details = {
        label: removePrefix(name),
        image: image,
        fetchedOn: fetchedOn,
    };

    data.specification = pargedResponse;

    writeResponseToFileSystem(
        schemaStorage,
        `${name}.json`,
        JSON.stringify(data)
    );
    sendResponse(res, data);
}

function attemptCacheRead(name) {
    const fileName = schemaStorage + name;
    let response;

    try {
        const file = fs.readFileSync(`${fileName}.json`, 'utf-8');
        response = safeJSONParse(file);
    } catch (error) {
        response = null;
    }

    return response;
}

function fetchSchema(name) {
    const cachedFile = attemptCacheRead(name);
    let response;

    if (cachedFile) {
        console.log(' - source cached');
        response = new Promise((resolve) => {
            resolve({
                image: cachedFile.details.image,
                data: JSON.stringify(cachedFile.specification),
            });
        });
    } else {
        const dockerRun = 'docker run --rm __PATH__ spec';
        const estuaryPath = `ghcr.io/estuary/${name}:dev`;
        const estuaryCommand = dockerRun.replace('__PATH__', estuaryPath);

        console.log(' - source needs fetching');
        console.log(' - - executing ', estuaryCommand);
        response = new Promise((resolve, reject) => {
            exec(estuaryCommand, (error, stdout, stderr) => {
                if (error !== 0) {
                    const airBytePath = `airbyte/${name}:latest`;
                    const airByteCommand = dockerRun.replace(
                        '__PATH__',
                        airBytePath
                    );
                    console.log(' - - - Estuary does not have this connector');
                    console.log(' - - - - - executing ', airByteCommand);
                    exec(airByteCommand, (error, stdout, stderr) => {
                        if (error !== 0) {
                            reject({
                                data: null,
                                error: stderr,
                            });
                        } else {
                            resolve({
                                image: airBytePath,
                                data: stdout,
                            });
                        }
                    });
                } else {
                    resolve({
                        image: estuaryPath,
                        data: stdout,
                    });
                }
            });
        });
    }

    return response;
}

function sendResponse(res, body, status) {
    res.status(status | 200);
    res.send(body);
}

function hugeFailure(res, error) {
    console.log('OH NO');
    res.status(500);
    res.json({
        message: 'Massive failure and we are not sure why. Sorry.',
        error: error,
    });
}

/////////////////////////////////////////
//  ▄▀█ █▀█ █▀█ ▄▄ █▀ █▀▀ ▀█▀ █░█ █▀█  //
//  █▀█ █▀▀ █▀▀ ░░ ▄█ ██▄ ░█░ █▄█ █▀▀  //
/////////////////////////////////////////
const app = express();
app.use(cors());
app.use(express.json());

/////////////////////////////////
//  █▀ █▀█ █░█ █▀█ █▀▀ █▀▀ █▀  //
//  ▄█ █▄█ █▄█ █▀▄ █▄▄ ██▄ ▄█  //
/////////////////////////////////
app.get('/sources/all', (req, res) => {
    const allSourcesWithLabels = allSources.map((source) => {
        const key = source;
        const label = removePrefix(source);

        return { key, label };
    });
    sendResponse(res, allSourcesWithLabels);
});

app.get('/source/:sourceName', (req, res) => {
    const name = req.params.sourceName;
    const schema = fetchSchema(name);

    schema
        .then((schema) => {
            if (schema && schema.data) {
                console.log('lakjsdf', schema);
                saveSchemaResponse(
                    schema.image,
                    name,
                    Date.now(),
                    schema.data,
                    res
                );
            } else {
                hugeFailure(res);
            }
        })
        .catch(() => {
            res.status(400);
            res.json({
                message: 'No sources could be found with that name.',
            });
        });
});

app.get('/source-delete/:name', (req, res) => {
    const name = req.params.name;
    const schema = fetchSchema(name);
    const imagePath = schema.details.image;

    try {
        const flowShell = pty.spawn(
            `flowctl`,
            ['discover', `--image=${imagePath}`],
            {
                cwd: flowDevDirectory,
            }
        );

        flowShell.onData((data) => {
            const fatalString = 'fatal';
            const errorString = 'Error:';
            const successString = 'Creating a connector configuration stub at ';
            const validationString = 'validating';

            console.log('on data', data);

            if (data.includes(fatalString)) {
                hugeFailure(res, fatalString);
            } else if (data.includes(errorString)) {
                if (data.includes(validationString)) {
                    res.status(500);
                    res.json({
                        message:
                            'A capture has already been started with this type.',
                    });
                } else {
                    res.status(500);
                    res.json({
                        message: data.split(errorString)[1],
                    });
                }

                flowShell.kill();
            } else if (data.includes(successString)) {
                let defaultConfigPath = data
                    .split(successString)[1] //get part that contains path
                    .split('.yaml')[0] // remove anyting after file type
                    .concat('.yaml') // add back in the file type
                    .replace('/home/flow/project/', flowDevDirectory); //use real path

                console.log('defaultConfigPath =', defaultConfigPath);

                setTimeout(() => {
                    const file = fs.readFileSync(defaultConfigPath);
                    const defaults = yaml.load(file);
                    const responseData = {
                        details: schema.details,
                        defaults: defaults,
                        specification: schema.specification,
                    };

                    res.status(200);
                    res.json(responseData);
                    flowShell.kill();
                }, 3500); //Just give the fs a second to write file
            }
        });
    } catch (error) {
        hugeFailure(res, error);
    }
});

//////////////////////////////////////
//  █▀▀ ▄▀█ █▀█ ▀█▀ █░█ █▀█ █▀▀ █▀  //
//  █▄▄ █▀█ █▀▀ ░█░ █▄█ █▀▄ ██▄ ▄█  //
//////////////////////////////////////
app.get('/test-captures/all', (req, res) => {
    const captureFiles = fs.readdirSync(captureStorage);
    const allCaptures = [];

    captureFiles.forEach((file) => {
        // Clean up file name stuff
        const sourceName = file.replace('.json', '');

        // Fetch the files
        const fileName = captureStorage + file;
        const data = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

        // Parse then store into cache
        allCaptures.push({
            name: sourceName,
            type: data.image,
        });
    });

    sendResponse(res, allCaptures);
});

app.post('/test-capture', (req, res) => {
    console.log('Capture Creation Called');
    console.log(' - config sent', req.body);

    try {
        const captureName = Object.keys(req.body)[0];
        const newFile = `${captureName}.json`;
        const fileAlreadyExists = fs.existsSync(captureStorage + newFile);

        if (fileAlreadyExists === true) {
            res.status(400);
            res.json({
                message: `There is already a Capture with the name "${captureName}".`,
            });
        } else {
            writeResponseToFileSystem(
                captureStorage,
                newFile,
                JSON.stringify(req.body)
            );
            res.status(200);
            res.end('success');
        }
    } catch (error) {
        res.status(500);
        res.json({
            message: `There was a server error.`,
        });
    }
});

app.post('/capture', (req, res) => {
    console.log('Real capture creation called');
    console.log(' - config sent', req.body);

    try {
        const captureName = req.body.name;
        const type = req.body.type;
        const newFile = `discover-${type}.config.yaml`;
        const filePath = flowDevDirectory + newFile;
        const fileAlreadyExists = fs.existsSync(filePath);

        if (fileAlreadyExists === true) {
            res.status(400);
            res.json({
                message: `There is already a config started - please remove and try again : "${filePath}"`,
            });
        } else {
            writeResponseToFileSystem(
                flowDevDirectory,
                newFile,
                json2yaml.stringify(req.body.config)
            );
            try {
                const flowShell = pty.spawn(
                    `flowctl`,
                    [
                        'discover',
                        `--image=${req.body.details.endpoint.airbyteSource.image}`,
                    ],
                    {
                        cwd: flowDevDirectory,
                    }
                );

                flowShell.onData((data) => {
                    const fatalString = 'fatal';
                    const errorString = 'Error:';
                    const successString =
                        'Creating a connector configuration stub at ';
                    const validationString = 'validating';

                    if (data.includes(fatalString)) {
                        hugeFailure(res, fatalString);
                    } else if (data.includes(errorString)) {
                        if (data.includes(validationString)) {
                            res.status(500);
                            res.json({
                                message: `Validation issue`,
                            });
                        } else {
                            res.status(500);
                            res.json({
                                message: data.split(errorString)[1],
                            });
                        }

                        flowShell.kill();
                    } else if (data.includes(successString)) {
                        let defaultConfigPath = data
                            .split(successString)[1] //get part that contains path
                            .split('.yaml')[0] // remove anyting after file type
                            .concat('.yaml') // add back in the file type
                            .replace('/home/flow/project/', flowDevDirectory); //use real path

                        console.log('defaultConfigPath =', defaultConfigPath);

                        setTimeout(() => {
                            const file = fs.readFileSync(defaultConfigPath);
                            const defaults = yaml.load(file);
                            const responseData = {
                                details: schema.details,
                                defaults: defaults,
                                specification: schema.specification,
                            };

                            res.status(200);
                            res.json(responseData);
                            flowShell.kill();
                        }, 3500); //Just give the fs a second to write file
                    }
                });
            } catch (error) {
                hugeFailure(res, error);
            }
        }
    } catch (error) {
        hugeFailure(res, error);
    }
});

///////////////////////////////////
//  █▀▀ ▄▀█ ▀█▀ ▄▀█ █░░ █▀█ █▀▀  //
//  █▄▄ █▀█ ░█░ █▀█ █▄▄ █▄█ █▄█  //
///////////////////////////////////
app.get('/catalog', (req, res) => {
    try {
        const flowShell = pty.spawn(`flowctl`, ['json-schema'], {
            cwd: flowDevDirectory,
            encoding: 'utf8',
        });

        flowShell.onData((data) => {
            console.log('data', data);

            if (data.includes('Error:')) {
                res.status(500);
                res.json({
                    message: data.split('Error:')[1],
                });
            } else {
                res.status(200);
                res.json({
                    message: data,
                });
            }
        });
    } catch (error) {
        hugeFailure(res, error);
    }
});

/////////////////////////////////////////
//  ▄▀█ █▀█ █▀█ ▄▄ █▀ ▀█▀ ▄▀█ █▀█ ▀█▀  //
//  █▀█ █▀▀ █▀▀ ░░ ▄█ ░█░ █▀█ █▀▄ ░█░  //
/////////////////////////////////////////
const port = 3001;
app.listen(port, () => {
    console.log('');
    console.log(`Example app listening at http://localhost:${port}`);
});
