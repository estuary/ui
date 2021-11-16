/** @format */

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import shellJS from 'shelljs';
import allSources from './allSources.js';

const { exec } = shellJS;

const testFolder = './schema-local-cache/';
const captureFolder = './captures-created/';

// This only work on the responses from docker / stdout.
//It assumes the valid JSON is all on one line
function getJSONFromStdOut(data) {
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

function sendResponse(res, body, status) {
    res.status(status | 200);
    res.send(body);
}

function writeResponseToFileSystem(testFolder, fileName, fileContent) {
    console.log('Writing to', testFolder + fileName);
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

    writeResponseToFileSystem(testFolder, `${name}.json`, JSON.stringify(data));
    sendResponse(res, data);
}

function attemptCacheRead(name) {
    const fileName = testFolder + name;
    let response;

    try {
        const file = fs.readFileSync(`${fileName}.json`, 'utf-8');
        response = safeJSONParse(file);
    } catch (error) {
        response = null;
    }

    return response;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/sources/all', (req, res) => {
    const allSourcesWithLabels = allSources.map((source) => {
        const key = source;
        const label = removePrefix(source);

        return { key, label };
    });
    sendResponse(res, allSourcesWithLabels);
});

app.get('/source/details/:sourceName', (req, res) => {
    const name = req.params.sourceName;
    const cachedFile = attemptCacheRead(name);

    if (cachedFile) {
        console.log(' - source cached', cachedFile);
        sendResponse(res, cachedFile);
    } else {
        const dockerRun = 'docker run --rm __PATH__ spec';
        const estuaryPath = `ghcr.io/estuary/${name}:dev`;
        const estuaryCommand = dockerRun.replace('__PATH__', estuaryPath);

        console.log(' - source needs fetching');
        console.log(' - - executing ', estuaryCommand);
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
                        sendResponse(res, stderr, 400);
                    } else {
                        saveSchemaResponse(
                            airBytePath,
                            name,
                            Date.now(),
                            stdout,
                            res
                        );
                    }
                });
            } else {
                saveSchemaResponse(estuaryPath, name, Date.now(), stdout, res);
            }
        });
    }
});

app.post('/capture', (req, res) => {
    console.log('Capture Creation Called');
    console.log(' - config sent', req.body);

    try {
        const captureName = Object.keys(req.body)[0];
        const newFile = `${captureName}.json`;
        const fileAlreadyExists = fs.existsSync(captureFolder + newFile);

        if (fileAlreadyExists === true) {
            res.status(400);
            res.json({
                message: `There is already a Capture with the name "${captureName}".`,
            });
        } else {
            writeResponseToFileSystem(
                captureFolder,
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

app.get('/captures/all', (req, res) => {
    const captureFiles = fs.readdirSync(captureFolder);
    const allCaptures = [];

    captureFiles.forEach((file) => {
        // Clean up file name stuff
        const sourceName = file.replace('.json', '');

        // Fetch the files
        const fileName = captureFolder + file;
        const data = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

        // Parse then store into cache
        allCaptures.push({
            name: sourceName,
            type: data.image,
        });
    });

    sendResponse(res, allCaptures);
});

const port = 3001;
app.listen(port, () => {
    console.log('');
    console.log(`Example app listening at http://localhost:${port}`);
});
