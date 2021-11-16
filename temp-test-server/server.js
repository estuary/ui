/** @format */

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import shellJS from 'shelljs';
import allSources from './allSources.js';

const { exec } = shellJS;

const testFolder = './schema-local-cache/';
const captureFolder = './captures-created/';

const schemaFiles = fs.readdirSync(testFolder);
let schemaMemoryCache = {};

function cleanUpSchema(data) {
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
        response = JSON.parse(cleanUpSchema(data));
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

function populateSourceInMemory(name, data) {
    const labelName = removePrefix(name);

    return (schemaMemoryCache[name] = {
        label: labelName,
        description: `This is the ${name} description. It is used for stuff.`,
        schema: data,
        version: 'we need something like this',
    });
}

function parseDataAndStoreInCache(key, data) {
    const parsedData = safeJSONParse(data);
    return populateSourceInMemory(key, parsedData);
}

function sendResponse(res, body, status) {
    res.status(status | 200);
    res.send(body);
}

function writeResponseToFileSystem(testFolder, fileName, fileContent) {
    console.log('Writing to', testFolder + fileName);
    fs.writeFileSync(testFolder + fileName, fileContent, 'utf-8');
}

function getSourcesListFromCache(allSources) {
    const allSourceKeys = Object.keys(allSources);
    return allSourceKeys.map((key) => {
        const label = allSources[key].label;
        return { key, label };
    });
}

function saveSchemaResponse(name, stdout, res) {
    const response = parseDataAndStoreInCache(name, stdout);
    writeResponseToFileSystem(
        testFolder,
        `${name}.json`,
        JSON.stringify(response.schema)
    );
    sendResponse(res, response.schema.spec.connectionSpecification);
}

schemaFiles.forEach((file) => {
    // Clean up file name stuff
    const sourceName = file.replace('.json', '');

    // Fetch the files
    const fileName = testFolder + file;
    const data = fs.readFileSync(fileName, 'utf-8');

    // Parse then store into cache
    parseDataAndStoreInCache(sourceName, data);
});

console.log('------------------------------');
console.log('|Sources ready during startup');
getSourcesListFromCache(schemaMemoryCache).map((val) => {
    console.log(`|- ${val.label}`);
});
console.log('------------------------------');

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
    const airByteCommand = `docker run --rm airbyte/${name}:latest spec`;
    const estuaryCommand = `docker run --rm ghcr.io/estuary/${name}:dev spec`;
    const cachedSchema = schemaMemoryCache[`${name}`];

    if (cachedSchema) {
        console.log(' - source cached', cachedSchema);
        sendResponse(res, cachedSchema.schema.spec.connectionSpecification);
    } else {
        console.log(' - source needs fetching');
        console.log(' - - executing ', estuaryCommand);
        exec(estuaryCommand, (error, stdout, stderr) => {
            if (error !== 0) {
                console.log(' - - - Estuary does not have this connector');
                console.log(' - - - - - executing ', airByteCommand);
                exec(airByteCommand, (error, stdout, stderr) => {
                    if (error !== 0) {
                        console.log('Issue fetching', [error, stdout, stderr]);
                        sendResponse(res, stderr, 500);
                    } else {
                        saveSchemaResponse(name, stdout, res);
                    }
                });
            } else {
                saveSchemaResponse(name, stdout, res);
            }
        });
    }
});

app.post('/capture', (req, res) => {
    console.log('Capture Creation Called');
    console.log(' - config sent', req.body);

    if (true) {
        writeResponseToFileSystem(
            captureFolder,
            req.body.captureName,
            JSON.stringify(req.body.airbyteSource)
        );
        res.status(200);
        res.end('success');
    } else {
        res.status(500);
        res.end('failure');
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
    console.log(`Example app listening at http://localhost:${port}`);
});
