import { CommonMessages } from './CommonMessages';

const defaultDescription =
    'Access the Estuary Flow dashboard to manage real-time data pipelines, integrations, and configurations in one place.';

export const RouteTitles: Record<string, string> = {
    'routeTitle.home': `Welcome`,
    'routeTitle.dashboard': `Dashboard`,
    'routeTitle.admin': `Admin`,
    'routeTitle.admin.accessGrants': `Access Grants`,
    'routeTitle.admin.api': `CLI - API`,
    'routeTitle.admin.billing': `Billing`,
    'routeTitle.admin.connectors': `Connectors`,
    'routeTitle.admin.settings': `Settings`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captureDetails': `Capture Details`,
    'routeTitle.captureEdit': `Edit Capture`,
    'routeTitle.captures': `${CommonMessages['terms.sources']}`,
    'routeTitle.collections': `Collections`,
    'routeTitle.collectionCreate': `Create Transformation`,
    'routeTitle.collectionDetails': `Collection Details`,
    'routeTitle.dataPlaneAuthReq': `Data Plane Authorization Checkpoint`,
    'routeTitle.directives': `Directives`,
    'routeTitle.details': `Details`,
    'routeTitle.error.entityNotFound': `Entity Not Found`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.noGrants': `Signed Up`,
    'routeTitle.legal': `Legal`,
    'routeTitle.materializationCreate': `Create Materialization`,
    'routeTitle.materializationDetails': `Materialization Details`,
    'routeTitle.materializationEdit': `Edit Materialization`,
    'routeTitle.materializations': `${CommonMessages['terms.destinations']}`,
    'routeTitle.registration': `Registration`,

    // The routes with custom prefix values
    //  The strings are generated in login/Basic.tsx
    'routeTitle.login': `Manage Your Data Pipelines`,
    'routeTitle.login.prefix': `${CommonMessages.productName} Dashboard`,
    'routeTitle.login.ogDescription': `${defaultDescription}`,

    'routeTitle.login.sso.ogTitle': `Estuary Flow SSO Login | Secure Access to Your Account`,
    'routeTitle.login.sso.ogDescription': `Log in securely to Estuary Flow using Single Sign-On (SSO) and manage your data pipelines with ease.`,

    'routeTitle.register': `Build Data Pipelines`,
    'routeTitle.register.prefix': `Register for ${CommonMessages.productName}`,
    'routeTitle.register.ogTitle': `Register for Estuary Flow | Build Data Pipelines`,
    'routeTitle.register.ogDescription': `Create your free Estuary Flow account and start building real-time data pipelines with ease. No credit card required, and enjoy a 30-day free trial`,

    'routeTitle.default.ogDescription': `${defaultDescription}`,
};
