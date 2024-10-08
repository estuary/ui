import { CommonMessages } from './CommonMessages';

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
    'routeTitle.login': `Manage Your Data Pipelines`,
    'routeTitle.login.prefix': `${CommonMessages.productName} Dashboard`,

    'routeTitle.login.sso': `Secure Access to Your Account`,
    'routeTitle.login.sso.prefix': `${CommonMessages.productName} SSO Login`,

    'routeTitle.register': `Build Data Pipelines`,
    'routeTitle.register.prefix': `Register for ${CommonMessages.productName}`,
};
