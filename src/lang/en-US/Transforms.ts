import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Errors } from 'src/lang/en-US/Errors';

export const Transforms: Record<string, string> = {
    'newTransform.modal.title': `Derive A New Collection`,
    'newTransform.language.title': `Language`,
    'newTransform.language.sql': `SQL`,
    'newTransform.language.ts': `Typescript`,
    'newTransform.baseConfig.sourceCollections.label': `Source Collections`,
    'newTransform.baseConfig.sqlTemplates.label': `SQL Templates`,
    'newTransform.collection.label': `Derived Collection Name`,
    'newTransform.errors.collection': `Select source collections`,
    'newTransform.errors.name': `Name your Derived Collection`,
    'newTransform.errors.prefixMissing': `No prefix selected`,
    'newTransform.errors.namePattern': `Name does not match pattern`,
    'newTransform.errors.nameInvalid': `Invalid entity name`,
    'newTransform.errors.nameMissing': `Missing entity name`,
    'newTransform.errors.urlNotGenerated': `We failed to generate your draft. ${Errors['error.tryAgain']}`,
    'newTransform.errors.draftSpecCreateFailed': `Creating Specification Failed`,
    'newTransform.errors.draftSpecUpdateFailed': `Updating Specification Failed`,
    'newTransform.stepper.step1.label': `Select source collections`,
    'newTransform.stepper.step2.label': `Transformation Language`,
    'newTransform.stepper.step3.label': `Write transformations`,
    'newTransform.instructions1': `You will be set up with an environment to create a
                            transformation.`,
    'newTransform.instructions2': `Create your query and use the CLI to
                            continue, e.g`,
    'newTransform.button.cta': `Create Draft`,

    'newTransform.config.header': `Database`,
    'newTransform.config.description': `This is a placeholder for a section description`,
    'newTransform.config.tab.advancedSettings': `Advanced`,
    'newTransform.config.tab.basicSettings': `General`,
    'newTransform.config.advancedSettings.header': `Advanced Internal State Settings`,
    'newTransform.config.transform.header': `Transforms`,
    'newTransform.config.transform.addDialog.header': `Add Transform`,
    'newTransform.config.migration.header': `Migrations`,
    'newTransform.config.message.listEmpty': `Click on the plus sign above to add a {contentType}.`,
    'newTransform.config.alert.noTransformSelected': `No transform selected.`,

    'newTransform.schema.header': `Schema`,
    'newTransform.schema.description': `Edit the templated derivation schema below.`,
    'newTransform.schema.cta.generatePreview': `Preview`,
    'newTransform.schema.dataPreview.header': `Data Preview`,

    'newTransform.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.next']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'newTransform.editor.streaming.header': `Streaming`,
    'newTransform.editor.streaming.description': `Used for selecting columns and creating aggregations`,
    'newTransform.editor.streaming.cta.generatePreview': `Preview`,
    'newTransform.editor.streaming.advancedSettings': `Advanced Streaming Settings`,
    'newTransform.editor.streaming.shuffleKeys.header': `Shuffle Keys`,
    'newTransform.editor.streaming.shuffleKeys.tooltip': `Select a key from your source collection schemas to help scale joins`,

    'newTransform.editor.preview.header': `Data Preview`,
    'newTransform.editor.preview.description': `This is a placeholder for a section description`,
    'newTransform.editor.preview.noPreviewGenerated': `Click PREVIEW to sample your derivation.`,

    'newTransform.save.failedErrorTitle': `Derivation Save Failed`,
    'newTransform.save.failure.errorTitle': `Derivation Save Failed`,
    'newTransform.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving derivation`,
    'newTransform.save.waitMessage': `Please wait while we test, save, and publish your derivation.`,

    'newTransform.createNotification.title': `New Derivation Created`,
    'newTransform.createNotification.desc': `Your new derivation is published and ready to be used.`,

    'newTransform.steps.message': `Now that you’ve created a derivation draft, you will need to continue development locally or in a cloud environment. Follow these steps to edit and publish your derivation.`,

    'newTransform.steps.1': `Install Estuary’s flowctl CLI.`,
    'newTransform.steps.1.details': `See {docLink} for installation instructions.`,
    'newTransform.steps.1.details.docLink': `docs`,
    'newTransform.steps.1.details.docPath': `https://docs.estuary.dev/concepts/flowctl/#installation-and-setup`,

    'newTransform.steps.2': `Authenticate your account`,
    'newTransform.steps.2.code': `flowctl auth login`,
    'newTransform.steps.2.details': `Opens the Flow Dashboard and allows you to copy your access token so you can paste it into the terminal. {docLink}`,
    'newTransform.steps.2.details.docLink': `docs`,
    'newTransform.steps.2.details.docPath': `https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli`,

    'newTransform.steps.3': `Select created draft`,
    'newTransform.steps.3.code': `flowctl draft select --id {draftId}`,
    'newTransform.steps.3.details': `Allows you to continue working on your derivation specification on your local system. {docLink}`,
    'newTransform.steps.3.details.docLink': `docs`,
    'newTransform.steps.3.details.docPath': `https://docs.estuary.dev/guides/flowctl/edit-specification-locally/#edit-source-files-and-re-publish-specifications`,

    'newTransform.steps.4': `Create default file structure`,
    'newTransform.steps.4.code': `flowctl draft develop`,
    'newTransform.steps.4.details': `Creates a new file structure in your working directory. Edit the deepest-nested {emphasis} file and its associated SQL or TypeScript transformation files to describe your desired transformed collection. Learn more about constructing your {docLink}.`,
    'newTransform.steps.4.learnMore': `Learn more about constructing {docLink}.`,
    'newTransform.steps.4.learnMore.docLink': `derivations`,
    'newTransform.steps.4.learnMore.docPath': `https://docs.estuary.dev/concepts/derivations/`,
    'newTransform.steps.4.details.emphasis': `flow.yaml`,

    'newTransform.steps.5': `Save`,
    'newTransform.steps.5.details': `Syncs the local work to the global draft so all entities in the draft are imported.`,
    'newTransform.steps.5.code': `flowctl draft author --source flow.yaml`,

    'newTransform.steps.6': `Publish`,
    'newTransform.steps.6.details': `Publishes the changes to Flow. This can take a little while to complete depending on the changes.`,
    'newTransform.steps.6.code': `flowctl draft publish`,
};
