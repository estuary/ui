import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { RouteTitles } from 'src/lang/en-US/RouteTitles';

export const Captures: Record<string, string> = {
    'captureTable.header': `Captures`,
    'capturesTable.title': `Your Captures`,
    'capturesTable.cta.new': `New Capture`,
    'capturesTable.filterLabel': `Filter captures`,
    'capturesTable.delete.removeCollectionsOption': `Delete all collections associated with this capture. Collections used by active tasks will be skipped.`,
    'capturesTable.ctaGroup.aria': `capture table available actions`,
    'capturesTable.cta.materialize': `${CTAs['cta.materialize']} ${CommonMessages['terms.collections']}`,
    'captures.message1': `Click "New Capture" to get started.`,
    'captures.message2': `You'll be guided through the process of defining, testing, and publishing a {docLink}.`,
    'captures.message2.docLink': `capture`,
    'captures.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,

    // Create
    'captureCreate.status.success': `${CommonMessages['common.success']}`,
    'captureCreate.heading': `${RouteTitles['routeTitle.captureCreate']}`,
    'captureCreate.details.heading': `1. Capture Details`,
    'captureCreate.ctas.materialize': `Materialize Collections`,
    'captureCreate.instructions': `Provide a unique name and specify a source system for your capture. Fill in the required details and click "${CTAs['cta.generateCatalog.capture']}" to test the connection.`,
    'captureCreate.missingConnectors': `No connectors are installed. You must install a source connector to create a capture.`,
    'captureCreate.tenant.label': `Prefix`,
    'captureCreate.config.source.doclink': `Connector Help`,
    'captureCreate.config.source.homepage': `Home`,
    'captureCreate.save.failed': `Capture creation failed. See below for details:`,
    'captureCreate.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureCreate.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.capture']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureCreate.collections.heading': `3. Output Collections`,
    'captureCreate.collectionSelector.heading': `Collection Selector`,
    'captureCreate.collectionSelector.instructions': `The collections bound to your capture. To update the configuration, please update the fields under the Config tab. To update the schema, click Edit under the Collection tab.`,

    'captureCreate.test.failedErrorTitle': `Configuration Test Failed`,
    'captureCreate.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration.`,

    'captureCreate.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreate.save.failure.errorTitle': `Capture Save Failed`,
    'captureCreate.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving capture`,
    'captureCreate.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureCreate.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureCreate.createNotification.title': `New Capture Created`,
    'captureCreate.createNotification.desc': `Your new capture is published and ready to be used.`,

    'captureCreate.test.waitMessage': `Please wait while we test your capture.`,
    'captureCreate.testNotification.title': `Test Successful`,
    'captureCreate.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,

    // Edit
    'captureEdit.heading': `${RouteTitles['routeTitle.captureEdit']}`,
    'captureEdit.details.heading': `1. Capture Details`,
    'captureEdit.ctas.materialize': `Materialize Collections`,
    'captureEdit.instructions': `The name and destination of your existing capture.`,
    'captureEdit.missingConnectors': `No connectors are installed. You must install a source connector to edit a capture.`,
    'captureEdit.tenant.label': `Prefix`,
    'captureEdit.config.source.doclink': `Connector Help`,
    'captureEdit.config.source.homepage': `Home`,
    'captureEdit.save.failed': `Capture edit failed. See below for details:`,
    'captureEdit.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureEdit.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above or edit the JSON file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureEdit.collections.heading': `3. Target Collections`,
    'captureEdit.collectionSelector.heading': `Collection Selector`,
    'captureEdit.collectionSelector.instructions': `The collections bound to your existing capture. To update the configuration, please update the fields under the Config tab. To update the schema, click Edit under the Collection tab.`,

    'captureEdit.test.failedErrorTitle': `Configuration Test Failed`,
    'captureEdit.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration.`,

    'captureEdit.save.failedErrorTitle': `Capture Save Failed`,
    'captureEdit.save.failure.errorTitle': `Capture Save Failed`,
    'captureEdit.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving capture`,
    'captureEdit.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureEdit.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureEdit.createNotification.title': `Edited Capture Saved`,
    'captureEdit.createNotification.desc': `Your edited capture is published and ready to be used.`,

    'captureEdit.test.waitMessage': `Please wait while we test your capture.`,
    'captureEdit.testNotification.title': `Test Successful`,
    'captureEdit.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,

    // Capture Interval
    'captureInterval.header': `Polling Interval`,
    'captureInterval.message': `Controls how often the Capture will check for new data. Intervals are relative to the start of an invocation and not its completion.`,
    'captureInterval.tooltip': `If the interval is five minutes, and an invocation of the capture finishes after two minutes, then the next invocation will be started after three additional minutes.`,
    'captureInterval.input.label': `Interval`,
    'captureInterval.input.description': `The default polling interval is {value}.`,
    'captureInterval.input.seconds': `seconds`,
    'captureInterval.input.minutes': `minutes`,
    'captureInterval.input.hours': `hours`,
    'captureInterval.input.interval': `interval`,
    'captureInterval.error.updateFailed': `Polling interval update failed`,
    'captureInterval.error.intervalFormat': `Intervals must be formatted as [0-9]+(s|m|h).`,
};
