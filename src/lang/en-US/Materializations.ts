import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Materializations: Record<string, string> = {
    'materializationsTable.title': `Materializations`,
    'materializationsTable.cta.new': `New Materialization`,
    'materializationsTable.filterLabel': `Filter materializations`,
    'materializations.message1': `Click "New Materialization" to get started.`,
    'materializations.message2': `You'll be guided through the process of defining, testing, and publishing a {docLink}.`,
    'materializations.message2.docLink': `materialization`,
    'materializations.message2.docPath': `https://docs.estuary.dev/concepts/materialization/`,

    // Create
    'materializationCreate.details.heading': `1. Materialization Details`,
    'materializationCreate.collections.heading': `3. Source Collections`,
    'materializationCreate.finalReview.instructions': `The following ${CommonMessages.spec} was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.materialization']}" again. You can also edit the specification file directly. Click "${CTAs['cta.saveEntity']}," to proceed.`,
    'materializationCreate.instructions': `Provide a unique name and specify a destination system for your materialization. Fill in the required details and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationCreate.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be created.`,
    'materializationCreate.save.failure.errorTitle': `Materialization Save Failed`,

    'materializationCreate.generate.failure.errorTitle': `Materialization Preparation Failed`,

    'materializationCreate.resourceConfig.heading': `Resource Configuration`,
    'materializationCreate.save.failedErrorTitle': `Materialization Save Failed`,
    'materializationCreate.save.waitMessage': `Please wait while we test, save, and publish your materialization.`,

    'materializationCreate.createNotification.title': `New Materialization Created`,
    'materializationCreate.createNotification.desc': `Your materialization is published and ready to be used.`,

    'materializationCreate.test.waitMessage': `Please wait while we test your materialization.`,
    'materializationCreate.test.failedErrorTitle': `Materialization Test Failed`,

    'materializationCreate.testNotification.title': `Test Successful`,
    'materializationCreate.testNotification.desc': `Your materialization succeeded in a dry run and can be saved.`,

    // Edit
    'materializationEdit.details.heading': `1. Materialization Details`,
    'materializationEdit.collections.heading': `3. Source Collections`,
    'materializationEdit.finalReview.instructions': `The following ${CommonMessages.spec} was generated from the details you provided. To make changes, you can enter new values in the form above or edit the JSON file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,
    'materializationEdit.instructions': `The name and destination of your existing materialization.`,
    'materializationEdit.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be edited.`,
    'materializationEdit.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationEdit.save.failedErrorTitle': `Materialization Save Failed`,
    'materializationEdit.save.waitMessage': `Please wait while we test, save, and publish your materialization.`,

    'materializationEdit.createNotification.title': `Edited Materialization Saved`,
    'materializationEdit.createNotification.desc': `Your edited materialization is published and ready to be used.`,

    'materializationEdit.test.waitMessage': `Please wait while we test your materialization.`,
    'materializationEdit.test.failedErrorTitle': `Materialization Test Failed`,

    'materializationEdit.testNotification.title': `Test Successful`,
    'materializationEdit.testNotification.desc': `Your materialization succeeded in a dry run and can be saved.`,
};
