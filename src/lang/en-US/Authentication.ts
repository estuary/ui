import { authenticatedRoutes } from 'src/app/routes';
import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Navigation } from 'src/lang/en-US/Navigation';

export const Authentication: Record<string, string> = {
    'login.documentAcknowledgement': `By accessing ${CommonMessages.productName} you agree to our {terms} and {privacy}.`,
    'login.jwtExpired': 'Your authorization has expired. Please sign in again.',
    'login.userNotFound.onRefresh':
        'Unable to find user. Please sign in again.',

    'login.tabs.login': `Sign In`,
    'login.tabs.register': `Register`,
    'login.magicLink.login.message': `Please use your work email address to sign in and continue to ${CommonMessages.productName}.`,
    'login.login.message': `Get started with ${CommonMessages.productName}`,
    'login.register.message': `Get started with ${CommonMessages.productName}`,

    'login.register.perks1.emphasis': `No credit card`,
    'login.register.perks1': `{emphasis} required`,
    'login.register.perks2.emphasis': `free trial`,
    'login.register.perks2': `30 days {emphasis}`,
    'login.register.perks3': `Build streaming and batch data flows fast, no code or infrastructure.`,
    'login.register.perks3.emphasis': ``,
    'login.register.perks4': `Move data across 200+ sources and destinations instantly.`,
    'login.register.perks4.emphasis': ``,
    'login.register.perks5': `Choose fully managed, BYOC, or private cloud to fit your needs.`,
    'login.register.perks5.emphasis': ``,

    'login.register.marketing.title': `${CommonMessages.productName} is the Universal Data Layer for real-time streaming and batch data integration`,
    'login.register.quote.name': `Jonni Lundy`,
    'login.register.quote.employment': `COO, Resend`,
    'login.register.quote.body': `"${CommonMessages.company} transformed how we operationalize our data for fraud, security, support, and beyond. Instead of unreliable, expensive backfills, we have real-time visibility into platform activity. The proactive support and hands-on approach make all the difference."`,

    'login.register.alt.coalesce': `Coalesce`,
    'login.register.alt.resend': `Resend`,
    'login.register.alt.xometry': `Xometry`,
    'login.register.alt.recart': `Recart`,
    'login.register.alt.chili': `Chili Piper`,

    'login.magicLink.register.message': `Please use your work email address to register and continue to ${CommonMessages.productName}.`,

    'login.sso': `Single Sign-On (SSO) Successful`,
    'login.sso.back': `Back to Sign In`,
    'login.sso.header': `Enter your company email to access ${CommonMessages.productName} via Single Sign-On.`,

    'login.sso.separator': `Or to register with Single Sign-On`,

    'login.sso.register.message.help': `${CTAs['cta.contactUs']}`,
    'login.sso.register.message.help.docPath': `${Navigation['helpMenu.contact.link']}`,

    'login.sso.message.help': `To enable Single Sign-On on your account {docLink}.`,
    'login.sso.message.help.docLink': `${CTAs['cta.contactUs']}`,
    'login.sso.message.help.docPath': `${Navigation['helpMenu.contact.link']}`,

    'login.companyEmail.description': `Please enter your company email`,
    'login.companyEmail.label': `Company Email`,
    'login.signinFailed.message.default': `There was an issue finding and using an SSO provider for the domain "{domain}".`,

    'login.magicLink': 'Magic link sent. Please check your email.',
    'login.magicLink.failed': 'Failed. Please try again.',
    'login.magicLink.verifyOTP': 'Already have an OTP code?',
    'login.magicLink.requestOTP': 'Request a magic link',

    'login.email.description': `Any valid email you want to use to sign in with`,
    'login.email.label': `Email`,

    'login.token.description': `This can be found in the magic link email`,
    'login.token.label': `OTP`,

    'login.separator': 'or',
    'login.loginFailed': 'Failed to sign in',
    'login.loginFailed.google': 'Failed to sign in with Google',
    'login.loginFailed.github': 'Failed to sign in with GitHub',
    'login.registerFailed': 'Failed to register',
    'login.registerFailed.google': 'Failed to register with Google',
    'login.registerFailed.github': 'Failed to register with GitHub',
    'login.userNotFound': 'User not found. Please sign up below.',

    'login.progress.indicator': 'Step {step} of {totalSteps}',

    'login.marketPlace.loggedOut': `To apply marketplace subscription, please login below.`,

    // Legal
    'legal.heading': `Legal Stuff`,
    'legal.heading.outdated': `Updated Legal Stuff`,
    'legal.message': `Please use the links below to open and review the documents before you continue.`,
    'legal.message.outdated': `There have been changes to our legal documents you need to review. Please use the links below to view the documents before you continue.`,
    'legal.docs.terms': `Terms of Service`,
    'legal.docs.privacy': `Privacy Policy`,
    'legal.docs.accept': 'I accept the {privacy} and {terms}',
    'legal.docs.errorTitle': 'Please accept',
    'legal.docs.errorMessage':
        'Before you can continue using the application you must accept the listed documents.',
    'legal.error.failedToFetch.message': `There was an issue while checking if you have accepted the latest {privacy} and {terms}.`,

    // Tenant
    'tenant.message.1': `The organization name will be used as a prefix for everything you create within Estuary. It will only be public if you share data with other organizations.`,

    'tenant.expectations': `You can use ${CommonMessages['catalogName.limitations']}`,
    'tenant.expectations.error': `Sorry, only letters(a-z), numbers(0-9), periods(.), underscores(_), and hyphens(-) allowed.`,

    'tenant.input.label': `Organization Name`,
    'tenant.input.placeholder': `acmeCo`,
    'tenant.errorMessage.empty': `You must provide an organization name before continuing.`,
    'tenant.errorMessage.invalid': `Your organization name is invalid.`,
    'tenant.origin.errorMessage.empty': `Please let us know where you heard about us.`,
    'tenant.warningMessage.problematic': `Looks like your organization name contains "test". This is generally not recommended as you cannot rename your organization later.`,

    'tenant.docs.message': `To see a detailed explanation please view our {link}`,
    'tenant.docs.message.link': `https://docs.estuary.dev/concepts/catalogs/#namespace`,

    'tenant.customer.quote': `We're a big fan of Estuary's real-time, no code model. It's magic that we're getting real time data without much effort and we don't have to spend time thinking about broken pipelines. We've also experienced fantastic support!`,

    'tenant.origin.radioGroup.label': `Where did you hear about ${CommonMessages.company}?`,

    'tenant.origin.radio.browserSearch.label': `Google / Search Engine`,
    'tenant.origin.radio.socialMedia.label': `Social Media`,
    'tenant.origin.radio.ai.label': `AI Assistant`,
    'tenant.origin.radio.paidAdvertising.label': `Online Ads`,
    'tenant.origin.radio.content.label': `Blog`,
    'tenant.origin.radio.referral.label': `Word of Mouth`,
    'tenant.origin.radio.webinar.label': `Webinar`,
    'tenant.origin.radio.reddit.label': `Reddit`,
    'tenant.origin.radio.linkedIn.label': `LinkedIn`,
    'tenant.origin.radio.other.label': `Other`,

    'tenant.grantDirective.header': `You've been invited to a ${CommonMessages['terms.tenant']}`,
    'tenant.grantDirective.message': `You're invited to receive {grantedCapability} access to the following tenant:`,

    'tenant.grantDirective.error.header': `Unable to Provision Access`,
    'tenant.grantDirective.error.message': `A problem was encountered provisioning access to the requested tenant. The access link could have been single-use or revoked by an administrator of the tenant.`,
    'tenant.grantDirective.error.message.help': `For additional context, please {docLink}.`,
    'tenant.grantDirective.error.message.help.docLink': `${CTAs['cta.support']}`,
    'tenant.grantDirective.error.message.help.docPath': `${CommonMessages['support.email']}`,

    'tenant.marketplace.header': `Apply marketplace subscription`,
    'tenant.marketplace.message': `Select the tenant that you want the marketplace subscription applied to.`,
    'tenant.marketplace.error.header': `Unable to apply marketplace subscription`,
    'tenant.marketplace.error.message': `A problem was encountered connecting the Google Marketplace subscription to the requested tenant.`,

    'tenant.error.failedToFetch.message': `There was an issue while checking if you have access to a tenant.`,

    'tenant.usedSso.title': `Successfully Authenticated`,
    'tenant.usedSso.message': `Your account was created successfully and can be added to your organization's ${CommonMessages.company} tenant.`,
    'tenant.usedSso.instructions': `To do so, ask an ${CommonMessages.company} admin at your company to go to the URL below and create an invite link which they can share with you.`,
    'tenant.usedSso.instructions.fullPath': `${window.location.origin}${authenticatedRoutes.admin.accessGrants.fullPath}`,

    // Registration
    'register.heading': `We're currently accepting Beta partners.`,
    'register.main.message': `Please enter your information and our team will approve your account.`,
    'register.label.fullName': `Full Name`,
    'register.label.email': `Email`,
    'register.label.company': `Company`,
    'register.label.intendedUse': `Describe your use case.`,
    'register.existingAccount': `Already have an account?`,

    // No Grants
    'noGrants.main.message': `Our team is reviewing your account and will get back to you shortly.`,
    'noGrants.main.title': `Thanks For Signing Up`,
};
