import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Transforms: Record<string, string> = {
    'newTransform.language.ts': `Typescript`,

    'newTransform.errors.collection': `Select source collections`,
    'newTransform.errors.name': `Name your Derived Collection`,

    'newTransform.errors.draftSpecCreateFailed': `Creating Specification Failed`,
    'newTransform.errors.draftSpecUpdateFailed': `Updating Specification Failed`,

    'newTransform.config.description': `This is a placeholder for a section description`,
    'newTransform.config.tab.advancedSettings': `Advanced`,
    'newTransform.config.tab.basicSettings': `General`,

    'newTransform.schema.description': `Edit the templated derivation schema below.`,

    'newTransform.finalReview.instructions': `The following ${CommonMessages.spec} was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.next']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'newTransform.save.failedErrorTitle': `Derivation Save Failed`,
    'newTransform.save.failure.errorTitle': `Derivation Save Failed`,
    'newTransform.save.waitMessage': `Please wait while we test, save, and publish your derivation.`,

    'newTransform.createNotification.title': `New Derivation Created`,
    'newTransform.createNotification.desc': `Your new derivation is published and ready to be used.`,

    // Many of the "newTransform.steps.n.___" keys are dynamically constructed in:
    //  ui/src/components/derivation/Create/InstructionStep.tsx
    // The supported types are listed in:
    //  /ui/src/components/derivation/Create/types.ts > InstructionStepProps

    'newTransform.steps.1': `Install Estuary's {emphasis} CLI`,
    'newTransform.steps.1.emphasis': `flowctl`,
    'newTransform.steps.1.linked': `See how to {docLink} our CLI tool.`,
    'newTransform.steps.1.linked.docLink': `install`,
    'newTransform.steps.1.linked.docPath': `https://docs.estuary.dev/concepts/flowctl/#installation-and-setup`,

    'newTransform.steps.2': `Authenticate your account`,
    'newTransform.steps.2.code': `flowctl auth login`,
    'newTransform.steps.2.linked': `Opens the ${CommonMessages['productName']} Dashboard. Paste the displayed access token into the terminal to {docLink}.`,
    'newTransform.steps.2.linked.docLink': `authenticate`,
    'newTransform.steps.2.linked.docPath': `https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli`,

    'newTransform.steps.3': `Select created draft`,
    'newTransform.steps.3.code': `flowctl draft select --id {draftId}`,
    'newTransform.steps.3.linked': `Sets your derivation as your active {docLink}.`,
    'newTransform.steps.3.linked.docLink': `draft`,
    'newTransform.steps.3.linked.docPath': `https://docs.estuary.dev/guides/flowctl/edit-draft-from-webapp/#identify-the-draft-and-pull-it-locally`,

    'newTransform.steps.4': `Create default file structure`,
    'newTransform.steps.4.code': `flowctl draft develop`,
    'newTransform.steps.4.details': `Creates the specification's file structure in your working directory.`,

    'newTransform.steps.5': `Edit your draft`,
    'newTransform.steps.5.details': `Edit the deepest-nested {emphasis} file and its associated SQL or TypeScript transformation files to describe your derived collection.`,
    'newTransform.steps.5.details.emphasis': `flow.yaml`,
    'newTransform.steps.5.linked': `Learn more about constructing {docLink}.`,
    'newTransform.steps.5.linked.docLink': `derivations`,
    'newTransform.steps.5.linked.docPath': `https://docs.estuary.dev/concepts/derivations/`,

    'newTransform.steps.6': `Save`,
    'newTransform.steps.6.details': `Syncs your local copy back to the global draft.`,
    'newTransform.steps.6.code': `flowctl draft author --source flow.yaml`,

    'newTransform.steps.7': `Publish`,
    'newTransform.steps.7.details': `Publishes the draft to your ${CommonMessages['productName']} catalog. This may take a few minutes.`,
    'newTransform.steps.7.code': `flowctl draft publish`,
};
