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
const port = 3001;
const homedir = process.env.HOME;
const schemaStorage = './schema-local-cache/';
const requestStorage = './requests/';
const catalogStorage = requestStorage + '/captures/';
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
    console.log('Writing new file ' + testFolder + fileName);
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

///////////////////////////////////
//  █▀▀ ▄▀█ ▀█▀ ▄▀█ █░░ █▀█ █▀▀  //
//  █▄▄ █▀█ ░█░ █▀█ █▄▄ █▄█ █▄█  //
///////////////////////////////////
// Creation
app.post('/catalog', (req, res) => {
    console.log('Capture creationg started');

    try {
        const captureName = req.body.name;
        const type = req.body.type;
        const newConfig = `discover-${type}.config.yaml`;
        const newCatalog = `discover-${type}.flow.yaml`;
        const configPath = flowDevDirectory + newConfig;
        const catalogPath = flowDevDirectory + newCatalog;
        const configAlreadyExists = fs.existsSync(configPath);
        const catalogAlreadyExists = fs.existsSync(catalogPath);

        if (configAlreadyExists) {
            res.status(400);
            res.json({
                message: `There is already a config started with this source : "${configPath}"`,
            });
        } else if (catalogAlreadyExists) {
            res.status(400);
            res.json({
                message: `There is already a catalog with this source : "${catalogPath}"`,
            });
        } else {
            writeResponseToFileSystem(
                flowDevDirectory,
                newConfig,
                json2yaml.stringify(req.body.config)
            );

            var flowShell = pty.spawn(
                `flowctl`,
                ['discover', `--image=${req.body.image}`],
                {
                    cwd: flowDevDirectory,
                    encoding: 'utf8',
                }
            );

            flowShell.onData((data) => {
                console.log('FlowCTL Responded : ', data);
                const successString = 'Created a Flow catalog';

                if (data.includes(successString)) {
                    console.log(' -  - Flow file created');
                    setTimeout(() => {
                        const file = fs.readFileSync(catalogPath, {
                            encoding: 'ascii',
                        });
                        const responseData = yaml.load(file, {
                            json: true,
                        });

                        res.status(200);
                        res.json(responseData);
                        flowShell.kill();
                    }, 1500); //Just give the fs a second to write file
                } else {
                    const fatalString = 'fatal';
                    const errorString = 'Error:';
                    const validationString = 'validating';

                    let message;

                    if (data.includes(fatalString)) {
                        console.log(' -  - Fatal Error');
                        message = 'There was a fatal error running flowctl.';
                    } else if (data.includes(errorString)) {
                        if (data.includes(validationString)) {
                            console.log(' -  - Validation Failure');
                            message =
                                'There was some validation issues found while running flowctl.';
                        } else {
                            console.log(' -  - Non-fatal Error');
                            message = data.split(errorString)[1];
                        }
                    } else {
                        message =
                            "Something went wrong - but we're not sure what.";
                    }
                    res.status(500);
                    res.json({
                        message: message,
                    });
                    flowShell.kill();
                }
            });
        }
    } catch (error) {
        if (flowShell && flowShell.kill()) {
            flowShell.kill();
        }
        hugeFailure(res, error);
    }
});

// Apply
app.post('/catalog/apply', (req, res) => {
    var flowShell = pty.spawn(
        `flowctl`,
        ['apply', `--source=discover-${req.body.type}.flow.yaml`],
        {
            cwd: flowDevDirectory,
            encoding: 'utf8',
        }
    );

    flowShell.onData((data) => {
        console.log('FlowCTL Apply Responded : ', data);
        const compileString = 'compile /workspace';
        const errorString = 'error';
        const successString = 'no clue what this is yet';

        if (data.includes(successString)) {
            console.log(' -  - Flow file created');
            setTimeout(() => {
                res.status(200);
                res.json({
                    message: 'made it',
                });
                flowShell.kill();
            }, 1500); //Just give the fs a second to write file
        } else {
            if (data.includes(compileString)) {
                // do nothing - wait for more data
            } else if (data.includes(errorString)) {
                let message = 'Flowctl apply ran into an issue : ';
                res.status(500);
                res.json({
                    message: message + data,
                });
                flowShell.kill();
            }
        }
    });
});

app.post('/test-catalog', (req, res) => {
    console.log('Capture Creation Called');
    console.log(' - config sent', req.body);

    try {
        const newFile = `${req.name}.json`;
        const fileAlreadyExists = fs.existsSync(catalogStorage + newFile);

        if (fileAlreadyExists === true) {
            res.status(400);
            res.json({
                message: `There is already a Capture with the name "${newFile}".`,
            });
        } else {
            writeResponseToFileSystem(
                catalogStorage,
                newFile,
                JSON.stringify(req.body.config)
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

app.get('/test-captures/all', (req, res) => {
    const captureFiles = fs.readdirSync(catalogStorage);
    const allCaptures = [];

    captureFiles.forEach((file) => {
        // Clean up file name stuff
        const sourceName = file.replace('.json', '');

        // Fetch the files
        const fileName = catalogStorage + file;
        const data = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

        // Parse then store into cache
        allCaptures.push({
            name: sourceName,
            type: data.image,
        });
    });

    sendResponse(res, allCaptures);
});

/////////////////////////////////////////
//  ▄▀█ █▀█ █▀█ ▄▄ █▀ ▀█▀ ▄▀█ █▀█ ▀█▀  //
//  █▀█ █▀▀ █▀▀ ░░ ▄█ ░█░ █▀█ █▀▄ ░█░  //
/////////////////////////////////////////
app.listen(port, () => {
    console.log('');
    console.log(`Example app listening at http://localhost:${port}`);
});
