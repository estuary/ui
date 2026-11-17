import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Captures: Record<string, string> = {
    'capturesTable.title': `Your Captures`,

    'capturesTable.filterLabel': `Filter captures`,
    'capturesTable.delete.removeCollectionsOption': `Delete all collections associated with this capture. Collections used by active tasks will be skipped.`,

    'captures.message1': `Click "New Capture" to get started.`,
    'captures.message2': `You'll be guided through the process of defining, testing, and publishing a {docLink}.`,
    'captures.message2.docLink': `capture`,
    'captures.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,

    // Create
    'captureCreate.details.heading': `1. Capture Details`,
    'captureCreate.instructions': `Provide a unique name and specify a source system for your capture. Fill in the required details and click "${CTAs['cta.generateCatalog.capture']}" to test the connection.`,
    'captureCreate.missingConnectors': `No connectors are installed. You must install a source connector to create a capture.`,
    'captureCreate.finalReview.instructions': `The following ${CommonMessages.spec} was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.capture']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureCreate.collections.heading': `3. Output Collections`,

    'captureCreate.test.failedErrorTitle': `Configuration Test Failed`,

    'captureCreate.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreate.save.failure.errorTitle': `Capture Save Failed`,
    'captureCreate.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureCreate.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureCreate.createNotification.title': `New Capture Created`,
    'captureCreate.createNotification.desc': `Your new capture is published and ready to be used.`,

    'captureCreate.test.waitMessage': `Please wait while we test your capture.`,
    'captureCreate.testNotification.title': `Test Successful`,
    'captureCreate.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,

    // Edit
    'captureEdit.details.heading': `1. Capture Details`,
    'captureEdit.instructions': `The name and destination of your existing capture.`,
    'captureEdit.missingConnectors': `No connectors are installed. You must install a source connector to edit a capture.`,
    'captureEdit.finalReview.instructions': `The following ${CommonMessages.spec} was generated from the details you provided. To make changes, you can enter new values in the form above or edit the JSON file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureEdit.collections.heading': `3. Target Collections`,

    'captureEdit.test.failedErrorTitle': `Configuration Test Failed`,

    'captureEdit.save.failedErrorTitle': `Capture Save Failed`,
    'captureEdit.save.failure.errorTitle': `Capture Save Failed`,
    'captureEdit.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureEdit.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureEdit.createNotification.title': `Edited Capture Saved`,
    'captureEdit.createNotification.desc': `Your edited capture is published and ready to be used.`,

    'captureEdit.test.waitMessage': `Please wait while we test your capture.`,
    'captureEdit.testNotification.title': `Test Successful`,
    'captureEdit.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,

    // Capture Interval

    'captureInterval.input.description': `The default polling interval is {value}.`,
    'captureInterval.error.updateFailed': `Polling interval update failed`,
};
