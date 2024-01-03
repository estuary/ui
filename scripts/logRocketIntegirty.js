const { createHash } = require('crypto');
const { readFileSync, rmSync } = require('fs');
const Downloader = require('nodejs-file-downloader');

// EDITABLE FIELDS - START ------------------
// Set to false if you do not want the tmp files deleted
const RM_TMP_AT_END = true;
// EDITABLE FIELDS - END ------------------

// Used to check if there are breaking changes
const CHANGE_LOG_URL = 'https://unpkg.com/logrocket/CHANGELOG.md';

// Stand alone folder so we can clear everything out at the end
const TEMP_FOLDER = './scripts/tmp/logRocketIntegrity';

// Helper functions
const sectionBreak = '-------------------------';
const taskDone = '********** END **********';
const exitTask = (exitCode) => {
    if (RM_TMP_AT_END) {
        rmSync(TEMP_FOLDER, { recursive: true });
    }

    console.log(taskDone);

    process.exit(exitCode);
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
            exitTask(1);
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
            console.log('\x1b[42m', ' USING LATEST ', '\x1b[0m');
            exitTask(0);
        }

        console.log('\x1b[41m', ' ! UPDATE REQUIRED ! ', '\x1b[0m');
        console.log(`VITE_LOGROCKET_SHA=${latestHash}`);
        console.log('\n');

        console.log('\x1b[43m', ' ! Check Change Log ! ', '\x1b[0m');
        console.log(`changelog: ${CHANGE_LOG_URL}`);
        console.log('\n');

        exitTask(1);
    } catch (error) {
        console.error('installLogRocket:error', error);
        exitTask(1);
    }
})();
