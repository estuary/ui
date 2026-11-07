import { authenticatedRoutes } from 'src/app/routes';
import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Navigation } from 'src/lang/en-US/Navigation';

export const Authentication: Record<string, string> = {
    'login.login.message': `Get started with ${CommonMessages.productName}`,
    'login.register.message': `Get started with ${CommonMessages.productName}`,

    'login.register.perks1': `{emphasis} required`,

    'login.register.perks2': `30 days {emphasis}`,
    'login.register.perks3': `Build streaming and batch ${CommonMessages['terms.dataFlow'].toLowerCase()}s fast, no code or infrastructure.`,

    'login.register.perks4': `Move data across 200+ sources and destinations instantly.`,

    'login.register.perks5': `Choose fully managed, BYOC, or private cloud to fit your needs.`,

    'login.register.alt.coalesce': `Coalesce`,
    'login.register.alt.resend': `Resend`,
    'login.register.alt.xometry': `Xometry`,
    'login.register.alt.recart': `Recart`,
    'login.register.alt.chili': `Chili Piper`,

    'login.sso.required.title': `SSO Required`,

    'login.sso.register.message.help': `${CTAs['cta.contactUs']}`,
    'login.sso.register.message.help.docPath': `${Navigation['helpMenu.contact.link']}`,

    'login.sso.message.help': `To enable Single Sign-On on your account {docLink}.`,
    'login.sso.message.help.docLink': `${CTAs['cta.contactUs']}`,
    'login.sso.message.help.docPath': `${Navigation['helpMenu.contact.link']}`,

    'login.signinFailed.message.default': `There was an issue finding and using an SSO provider for the domain "{domain}".`,

    'login.magicLink': 'Magic link sent. Please check your email.',

    'login.loginFailed.google': 'Failed to sign in with Google',
    'login.loginFailed.github': 'Failed to sign in with GitHub',
    'login.registerFailed.google': 'Failed to register with Google',
    'login.registerFailed.github': 'Failed to register with GitHub',

    // Tenant

    'tenant.grantDirective.message': `You now have {grantedCapability} access to the following tenant:`,

    'tenant.grantDirective.error.message.help': `For additional context, please {docLink}.`,
    'tenant.grantDirective.error.message.help.docLink': `${CTAs['cta.support']}`,
    'tenant.grantDirective.error.message.help.docPath': `${CommonMessages['support.email']}`,

    'tenant.usedSso.instructions': `To do so, ask an ${CommonMessages.company} admin at your company to go to the URL below and create an invite link which they can share with you.`,
    'tenant.usedSso.instructions.fullPath': `${window.location.origin}${authenticatedRoutes.admin.accessGrants.fullPath}`,

    // No Grants
};
