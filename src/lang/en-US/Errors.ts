import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const Errors: Record<string, string> = {
    'error.title': `${CommonMessages['common.errors.heading']}`,
    'error.reason.fetchFailed': `There was a network issue while contacting our servers. Please make sure your network is available and try again.`,

    'error.instructions': `If the issue persists please {docLink}.`,
    'error.instructions.docLink': `${CTAs['cta.support']}`,
    'error.instructions.docPath': `${CommonMessages['support.email']}`,

    'error.fallBack': `no error details to display`,

    // Custom Errors
    'custom.prefixedName.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']}. Please contact an administrator.`,
    'custom.prefixedName.prefix.missing': `please select an organization`,
    'custom.prefixedName.prefix.invalid': `may only include ${CommonMessages['catalogName.limitations']} separated by forward slashes`,
    'custom.prefixedName.name.missing': `please provide a name`,
    'custom.prefixedName.name.unclean': `cannot contain ./ or ../`,
    'custom.prefixedName.name.endingSlash': `cannot end with /`,
    'custom.prefixedName.name.invalid': `may only include ${CommonMessages['catalogName.limitations']} separated by forward slashes`,

    // Draft Errors
    // Also used to SkimProjectionErrors
    'errors.preface.totalCount': `Displaying {displaying} of {total, plural, one {# error} other {# errors}} `,

    // Error Boundry

    // Page Not Found

    // Full Page
    'fullPage.instructions': `Please try again. If the error persists, {docLink}`,
    'fullPage.instructions.docLink': `${CTAs['cta.support']}`,
    'fullPage.instructions.docPath': `${CommonMessages['support.email']}`,

    // Supabase
    'supabase.poller.failed.title': `${CommonMessages['common.failedFetch']}`,
    'supabase.poller.failed.message': `We encountered a problem retrieving the status of this action. Please check your network connection and try again.`,
};
