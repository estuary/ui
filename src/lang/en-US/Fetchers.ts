export const Fetchers: Record<string, string> = {
    'fetcher.grants.error.message': `There was an issue while checking your user grants.`,
    'fetcher.tenants.error.message': `There was an issue while checking what tenants you have access to.`,

    // Data Plane Auth Req
    'dataPlaneAuthReq.error.message': `Authorization to access {catalogPrefix} failed: {error}`,
    'dataPlaneAuthReq.waiting.message': `Please wait while we authorize access to {catalogPrefix}. You will be redirected shortly.`,
};
