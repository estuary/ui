import cors from 'cors';
import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import json2yaml from 'json2yaml';
import * as pty from 'node-pty';
import path from 'path';
import shellJS from 'shelljs';
import estuarySources from './allSources.js';

const { exec } = shellJS;

//////////////////////////////
//  █▀▀ █▀█ █▄░█ █▀▀ █ █▀▀  //
//  █▄▄ █▄█ █░▀█ █▀░ █ █▄█  //
//////////////////////////////
const port = 3001;
const homedir = process.env.HOME;
const tmp = './tmp/';
const schemaStorage = './schema-local-cache/';
const flowDevDirectory = tmp;
const capturesDirectory = tmp + 'captures/';
const tenants = [
    'acmeCo',
    'foo/bar',
    'buz/testing',
    'testing',
    'admin',
    'account',
    'faint',
    'auction',
    'crown',
    'head',
    'compound',
    'wardrobe',
    'consensus',
    'marathon',
    'district',
    'attraction',
    'fine',
    'advantage',
    'seat',
    'prize',
    'familiar',
    'equal',
    'night',
    'camp',
];

// Make this global so we can kill it at anytime without passing it around.
let flowShell;

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
    labelName = labelName.replaceAll('-', ' ');

    return labelName;
}

function writeResponseToFileSystem(testFolder, fileName, fileContent) {
    console.log('Writing new file ' + testFolder + fileName);

    if (!fs.existsSync(testFolder)) {
        fs.mkdirSync(testFolder, { recursive: true }, (error) => {
            if (error) throw error;
        });
    }

    fs.writeFileSync(testFolder + fileName, fileContent, 'utf-8');
}

function saveSchemaResponse(image, name, fetchedOn, stdout, res) {
    const pargedResponse = safeJSONParse(stdout);
    const data = {};

    data.details = {
        label: name.startsWith('source-') ? removePrefix(name) : name,
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
    let fileName = schemaStorage;
    let response;

    if (name.includes('/')) {
        fileName = fileName + getSourceNameFromPath(name);
    } else {
        fileName = fileName + name;
    }

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

function fetchSchemaWithPath(path) {
    const cachedFile = attemptCacheRead(path);
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
        const dockerRun = `docker run --rm ${path} spec`;

        console.log(' - source needs fetching');
        console.log(' - - executing ', dockerRun);
        response = new Promise((resolve, reject) => {
            exec(dockerRun, (error, stdout, stderr) => {
                if (error !== 0) {
                    reject({
                        data: null,
                        error: stderr,
                    });
                } else {
                    resolve({
                        image: path,
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
    console.log('OH NO', error);
    res.status(500);
    res.json({
        message: 'Massive failure and we are not sure why. Sorry.',
        errors: [error],
    });

    if (flowShell && flowShell.kill) {
        flowShell.kill();
    }
}

//https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push({
                name: dirPath.replace(capturesDirectory, '').replace('/', ''),
                path: path.join(dirPath, '/', file),
                type: file
                    .replace('.flow.yaml', '')
                    .replace('.config.yaml', ''),
            });
        }
    });

    return arrayOfFiles;
}

// Capture helpers
function generatePaths(captureName, capturePathOrType) {
    const workingDirectory = `${capturesDirectory}${captureName}/`;
    let type;
    let response = {};

    if (capturePathOrType.startsWith('source-')) {
        type = capturePathOrType;
    } else {
        console.log('Full path sent back. Cleaning up', capturePathOrType);
        type = getSourceNameFromPath(capturePathOrType);
    }

    console.log('Generating paths', {
        captureName,
        type,
    });

    response.newConfig = `discover-${type}.config.yaml`;
    response.newCatalog = `discover-${type}.flow.yaml`;
    response.configPath = workingDirectory + response.newConfig;
    response.catalogPath = workingDirectory + response.newCatalog;
    response.workingDirectory = workingDirectory;

    return response;
}
function checkIfCaptureAlreadyExists(captureName, type) {
    const paths = generatePaths(captureName, type);
    let message = null;

    if (fs.existsSync(paths.configPath)) {
        message = `There is already a config named "${captureName}". It can be found at : "${paths.configPath}"`;
    } else if (fs.existsSync(paths.catalogPath)) {
        message = `There is already a Capture named "${captureName}". It can be found at : "${paths.catalogPath}"`;
    } else if (fs.existsSync(paths.workingDirectory)) {
        message = `There is already a capture with the name "${captureName}". It can be found at : "${paths.workingDirectory}"`;
    }

    return message;
}
function returnSpecificError(res, message, errors) {
    const resErrors = errors && errors.length > 0 ? errors : [];
    res.status(500);
    res.json({
        errors: resErrors,
        message: message,
    });

    if (flowShell && flowShell.kill) {
        flowShell.kill();
    }
}
function flowctlFailure(res, data) {
    const dockerString = 'docker:';
    const fatalString = 'fatal';
    const errorString = 'Error:';
    const validationString = 'validating';

    let message;
    let errors = [];

    if (data.data) {
        if (data.data.includes(dockerString)) {
            console.log(' -  - Docker Error');
            errors.push(data.data.split(dockerString)[1]);
            message = 'Flowctl had an issue due to the container';
        } else if (data.data.includes(fatalString)) {
            console.log(' -  - Fatal Error');
            message = 'Flowctl ran into a fatal error.';
        } else if (data.data.includes(errorString)) {
            if (data.data.includes(validationString)) {
                console.log(' -  - Validation Failure');
                message = 'Flowctl ran into a validation issue.';
            } else {
                console.log(' -  - Non-fatal Error');
                errors.push(data.data.split(errorString)[1]);
                message = 'Flowctl ran into a non-fatal error';
            }
        } else {
            message = 'Something went wrong.';
        }
    } else {
        message = 'Something went wrong.';
    }

    returnSpecificError(res, message, errors);
}
function runDiscover(res, captureName, config, image, paths) {
    console.log('Running discover for ', image);
    const discoverPromise = new Promise((resolve, reject) => {
        writeResponseToFileSystem(
            paths.workingDirectory,
            paths.newConfig,
            json2yaml.stringify(config)
        );

        flowShell = pty.spawn(`flowctl`, ['discover', `--image=${image}`], {
            cwd: paths.workingDirectory,
        });

        flowShell.onData((data) => {
            console.log('FlowCTL Responded : ', data);
            const successString = 'Created a Flow catalog';

            if (data.includes(successString)) {
                console.log(' -  - Flow file created');
                setTimeout(() => {
                    const fileString = fs
                        .readFileSync(paths.catalogPath, {
                            encoding: 'ascii',
                        })
                        .toString()
                        .replaceAll('acmeCo', captureName);

                    writeResponseToFileSystem(
                        paths.workingDirectory,
                        paths.newCatalog,
                        fileString
                    );

                    const responseData = yaml.load(
                        fs.readFileSync(paths.catalogPath, {
                            encoding: 'ascii',
                        })
                    );

                    flowShell.kill();
                    resolve({
                        path: paths.workingDirectory + paths.newCatalog,
                        data: responseData,
                    });
                }, 1500); //Just give the filesystem a second to write file
            } else {
                reject({
                    data,
                });
            }
        });
    });

    return discoverPromise;
}
function captureCreation(req, res) {
    console.log('starting capture creation');
    return new Promise((resolve, reject) => {
        const captureName = `${req.body.tenantName}/${req.body.captureName}`;
        const image = req.body.sourceImage;
        const config = req.body.config;

        const paths = generatePaths(captureName, image);
        try {
            const errorMessage = checkIfCaptureAlreadyExists(
                captureName,
                image
            );

            if (errorMessage) {
                reject({
                    message: errorMessage,
                });
            } else {
                runDiscover(res, captureName, config, image, paths)
                    .then((data) => {
                        resolve({
                            path: paths.workingDirectory + paths.newCatalog,
                            data: data,
                        });
                    })
                    .catch((data) => {
                        reject({
                            data,
                        });
                    });
            }
        } catch (error) {
            reject({
                error: error,
            });
        }
    });
}

function getSourceNameFromPath(value) {
    const path = value;
    return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf(':'));
}

function cleanUpTmp() {
    fs.rmSync(tmp, {
        recursive: true,
    });
}

/////////////////////////////////////////
//  ▄▀█ █▀█ █▀█ ▄▄ █▀ █▀▀ ▀█▀ █░█ █▀█  //
//  █▀█ █▀▀ █▀▀ ░░ ▄█ ██▄ ░█░ █▄█ █▀▀  //
/////////////////////////////////////////
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/////////////////////////////////
//  █▀ █▀█ █░█ █▀█ █▀▀ █▀▀ █▀  //
//  ▄█ █▄█ █▄█ █▀▄ █▄▄ ██▄ ▄█  //
/////////////////////////////////
app.get('/sources/all', (req, res) => {
    const allSourcesWithLabels = estuarySources.map((source) => {
        const key = source;
        const label = removePrefix(source);

        return { key, label };
    });
    sendResponse(res, allSourcesWithLabels);
});

//Replaced with the one below using path
app.get('/source/:sourceName', (req, res) => {
    const name = req.params.sourceName;
    const schema = fetchSchema(name);

    schema
        .then((schema) => {
            if (schema && schema.data) {
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
                errors: [],
                message: 'No sources could be found with that name.',
            });
        });
});

app.get('/source/path/:path', (req, res) => {
    const decodedPath = req.params.path;
    const schema = fetchSchemaWithPath(decodedPath);

    schema
        .then((schema) => {
            if (schema && schema.data) {
                saveSchemaResponse(
                    schema.image,
                    getSourceNameFromPath(decodedPath),
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
                errors: [],
                message: 'No sources could be found with that name.',
            });
        });
});

//////////////////////////////////////
//  █▀▀ ▄▀█ █▀█ ▀█▀ █░█ █▀█ █▀▀ █▀  //
//  █▄▄ █▀█ █▀▀ ░█░ █▄█ █▀▄ ██▄ ▄█  //
//////////////////////////////////////
app.get('/capture/', (req, res) => {
    console.log('Call to fetch create form schema');

    let schema = {
        title: 'Capture Details',
        type: 'object',
        required: ['tenantName', 'captureName', 'sourceType'],
        properties: {
            tenantName: {
                description: 'The tenant in which to create the capture.',
                type: 'string',
                enum: [],
            },
            captureName: {
                description: 'Name of the capture - must be unique.',
                type: 'string',
                minLength: 1,
                maxLength: 1000,
            },
            sourceType: {
                type: 'string',
                oneOf: [],
            },
            sourceImage: {
                description:
                    'Image you would like us to pull. SHA256 (do not include the SHA256 prefix) or path (whatever will work with a docker pull command)',
                type: 'string',
                onOf: [
                    {
                        type: 'string',
                        pattern: '^[A-Fa-f0-9]{64}$',
                    },
                    {
                        type: 'string',
                        pattern: '^[1]{12}$',
                    },
                ],
            },
        },
    };

    // This would get populated based on what tenants the user has access to.
    schema.properties.tenantName.enum = [
        'acmeCo/',
        'estuary/',
        'examples/',
        'test/',
    ];

    estuarySources.forEach((source) => {
        const title = removePrefix(source);
        const estuaryPath = `ghcr.io/estuary/${source}:dev`;

        schema.properties.sourceType.oneOf.push({
            const: estuaryPath,
            title,
        });
    });

    schema.properties.sourceType.oneOf.push({
        const: 'custom',
        title: `I'll provide an image`,
    });

    res.status(200);
    res.json(schema);
});

app.post('/capture/test', (req, res) => {
    console.log('Capture test started', req.body);

    captureCreation(req, res)
        .then((data) => {
            const errors = [];

            const collections = data.data.data.collections;
            const hasCollections =
                collections && Object.keys(collections).length > 0;

            const captures = data.data.data.captures;
            const bindings = captures[`${Object.keys(captures)[0]}`].bindings;
            const hasBindings = bindings && bindings.length > 0;

            if (!hasCollections) {
                errors.push(`No data found in your source.`);
            }

            if (!hasBindings) {
                errors.push(`Your bindings are empty.`);
            }

            if (errors.length > 0) {
                res.status(400);
                res.json({
                    errors: errors,
                    message: 'There was an issue generating your catalog.',
                });
            } else {
                res.status(200);
                res.json(data);
            }
        })
        .catch((data) => {
            if (data.error) {
                hugeFailure(res, data.error);
            } else if (data.message) {
                returnSpecificError(res, data.message);
            } else {
                flowctlFailure(res, data.data);
            }
        })
        .finally(() => {
            cleanUpTmp();
        });
});

app.post('/capture/save', (req, res) => {
    console.log('Capture creation started');
    const captureName = req.body.name;
    const type = req.body.type;
    const paths = generatePaths(captureName, type);

    writeResponseToFileSystem(
        paths.workingDirectory,
        paths.newCatalog,
        JSON.stringify(req.body.config)
    );

    res.status(200);
    res.send(JSON.stringify(req.body.config));
});

app.get('/captures/all', (req, res) => {
    console.log('Getting list of all captures');

    const captureFiles = getAllFiles(capturesDirectory);
    const allCaptures = [];

    captureFiles.forEach((file) => {
        // Parse then store into cache
        allCaptures.push({
            path: file.path,
            name: file.file,
        });
    });

    sendResponse(res, captureFiles);
});

///////////////////////////////////
//  █▀▀ ▄▀█ ▀█▀ ▄▀█ █░░ █▀█ █▀▀  //
//  █▄▄ █▀█ ░█░ █▀█ █▄▄ █▄█ █▄█  //
///////////////////////////////////
// TODO : no real dev has been done on this yet
app.post('/catalog/apply', (req, res) => {
    console.log('apply called ', req.body);
    flowShell = pty.spawn(`flowctl`, ['apply', `--source=${req.body.path}`], {
        cwd: flowDevDirectory,
        encoding: 'utf8',
    });

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
                let errorMessage = data;

                let message = `Flowctl apply ran into an issue :`;
                res.status(500);
                res.json({
                    errors: [errorMessage],
                    message: message,
                });
                flowShell.kill();
            }
        }
    });
});

////////////////////////////////
//  █▀ █▀▀ █░█ █▀▀ █▀▄▀█ ▄▀█  //
//  ▄█ █▄▄ █▀█ ██▄ █░▀░█ █▀█  //
////////////////////////////////
app.get('/schema/', (req, res) => {
    flowShell = pty.spawn(`flowctl`, ['json-schema'], {
        cwd: flowDevDirectory,
        encoding: 'ascii',
    });

    // TODO - this blows up right now because the data isn't read all in at once.
    flowShell.onData((data) => {
        console.log('FlowCTL JSON-Schema Responded : ', data);

        flowShell.kill();
        res.status(200);
        res.json({
            data: JSON.parse(data),
        });
    });
});

////////////////////////////////////
//  ▀█▀ █▀▀ █▄░█ ▄▀█ █▄░█ ▀█▀ █▀  //
//  ░█░ ██▄ █░▀█ █▀█ █░▀█ ░█░ ▄█  //
////////////////////////////////////
//https://gabrieleromanato.name/nodejs-autocomplete-in-expressjs-with-jquery-ui
app.get('/test-tenants/', (req, res) => {
    const s = req.query.s.trim();
    const results = [];

    try {
        tenants.sort().forEach((tenant, index) => {
            if (tenant.includes(s)) {
                results.push({
                    id: index,
                    name: `${tenant}/`,
                });
            }
        });
    } catch (err) {
        console.log(err);
    }

    res.json(results);
});

/////////////////////////////////////////
//  ▄▀█ █▀█ █▀█ ▄▄ █▀ ▀█▀ ▄▀█ █▀█ ▀█▀  //
//  █▀█ █▀▀ █▀▀ ░░ ▄█ ░█░ █▀█ █▀▄ ░█░  //
/////////////////////////////////////////
app.listen(port, () => {
    console.log('');
    console.log(`Example app listening at http://localhost:${port}`);
    console.log(`Flow directory     : ${flowDevDirectory}`);
    console.log(`Captures directory : ${capturesDirectory}`);
});
