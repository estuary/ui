import { Errors } from 'src/lang/en-US/Errors';

export const JsonForms: Record<string, string> = {
    'jsonForms.clearInput': `Clear input field`,

    // Group
    'jsonForms.clearGroup': `Clear {label}`,
    'jsonForms.clearGroup.message': `Remove this group and all children.`,

    // Custom Renderers
    'dateTimePicker.button.ariaLabel': `Open date time picker for {label}`,
    'dateTimePicker.picker.currentStep': `Selecting: {currentStep}`,
    'dateTimePicker.picker.footer': `Timezone: UTC`,
    'datePicker.button.ariaLabel': `Open date picker for {label}`,
    'informational.sshEndpoint.title': `All Estuary traffic comes from a group of IPs that can be whitelisted:`,
    'informational.sshEndpoint.ipv4': `34.121.207.128, 35.226.75.135, 34.68.62.148`,
    'informational.sshEndpoint.ipv6': `does not support IPv6`,
    'timePicker.button.ariaLabel': `Open time picker for {label}`,

    // Multi-line Secret
    'multiLineSecret.openDialog.cta': `Use secret from file`,

    // File Upload Dialog
    'fileUpload.dropzone.instruction': `Drag and drop a file here, or click to browse`,
    'fileUpload.dropzone.maxSize': `Max file size: 5 MB`,
    'fileUpload.dropzone.error.tooLarge': `File exceeds the 5 MB size limit.`,

    // OAuth
    'oauth.error.credentialsMissing': `need to complete OAuth`,
    'oauth.instructions': `Authenticate your {provider} account by clicking below. A pop up will open where you can authorize access. No data will be accessed during authorization.`,
    'oauth.fetchAuthURL.error': `We failed to fetch the proper URL to start OAuth. ${Errors['error.tryAgain']}`,
    'oauth.authentication.denied': `To use OAuth as your authentication you must allow our app access to your {provider} account.`,
    'oauth.accessToken.error': `There was an issue attempting to get the access token from {provider}. ${Errors['error.tryAgain']}`,
    'oauth.emptyData.error': `We failed to get the data we need to populate the {provider} OAuth configuration. ${Errors['error.tryAgain']}`,
    'oauth.authenticated': `Authenticated`,
    'oauth.unauthenticated': `Not Authenticated`,
    'oauth.authenticate': `Authenticate your {provider} account`,
    'oauth.remove': `Remove`,
    'oauth.edit.message': `If you edit your endpoint config and want to continue using OAuth you must reauthenticate.`,
    'oauth.windowOpener.error.dialog.title': `OAuth Failed`,
    'oauth.windowOpener.error.title': `Cannot reach parent window`,
    'oauth.windowOpener.error.message1': `We are unable to communicate with the window that opened the OAuth pop up. The window may have been closed.`,
    'oauth.windowOpener.error.message2': `Please close this dialog and try again.`,
};
