const { createHash } = require('crypto');
const { readFileSync, rmSync } = require('fs');
const Downloader = require('nodejs-file-downloader');

// Set to false if you do not want the tmp files deleted
const DELETE_TMP_AT_END = true;

// Stand alone folder so we can clear everything out at the end
const TEMP_FOLDER = './scripts/tmp/logRocketIntegrity';

// Helper functions
const sectionBreak = '-------------------------';
const taskDone = '********** END **********';
const cleanUp = () => {
    if (DELETE_TMP_AT_END) {
        console.log(`cleaning up "${TEMP_FOLDER}"`);
        rmSync(TEMP_FOLDER, { recursive: true });
    }

    console.log(taskDone);
};
const downloadLatestScript = async (downloadURL) => {
    const downloader_script = new Downloader({
        cloneFiles: false, // overwrite
        directory: TEMP_FOLDER,
        fileName: 'logRocket.js',
        url: downloadURL,
    });

    const downloadedScript = await downloader_script.download();
    return downloadedScript;
};

// Read env variables
const ENCODING = process.env.VITE_LOGROCKET_SHA_ENCODING;
const CURRENT_SHA = process.env.VITE_LOGROCKET_SHA;
const LATEST_URL = process.env.VITE_LOGROCKET_URL;

// Generate integrity string
const getIntegrity = (hash) => `${ENCODING}-${hash}`;
const currentIntegrity = getIntegrity(CURRENT_SHA);

(async () => {
    try {
        console.log('********** START **********');

        console.log(`fetching latest Log Rocket script from "${LATEST_URL}"`);
        const { filePath, downloadStatus } = await downloadLatestScript(
            LATEST_URL
        );
        if (downloadStatus !== 'COMPLETE') {
            console.error(`fetching did not complete "${downloadStatus}"`);
            cleanUp();
            return;
        }

        console.log('fetched', { filePath, downloadStatus });
        console.log(sectionBreak);

        const buff = readFileSync(filePath);
        const latestHash = createHash(ENCODING).update(buff).digest('base64');
        const latestIntegrity = getIntegrity(latestHash);
        const usingLatest = latestIntegrity === currentIntegrity;

        console.log(`current : ${currentIntegrity}`);
        console.log(`latest  : ${latestIntegrity}`);
        console.log(sectionBreak);

        if (usingLatest) {
            console.log(`no update required`);
            cleanUp();
            return;
        }

        console.log('UPDATE REQUIRED!');
        console.log('copy value below into .env');
        console.log(`VITE_LOGROCKET_SHA=${latestHash}`);
        console.log('sectionBreak');

        console.log('cleaning up tmp');
        cleanUp();
    } catch (error) {
        console.error('installLogRocket:error', error);
        cleanUp();
    }
})();
