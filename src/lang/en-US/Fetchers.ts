export const Fetchers: Record<string, string> = {
    'fetcher.grants.error.message': `There was an issue while checking your user grants.`,
    'fetcher.tenants.error.message': `There was an issue while checking what tenants you have access to.`,

    // Data Plane Auth Req
    'dataPlaneAuthReq.error.message': `Authorization to access {catalogPrefix} failed: {error}`,
    'dataPlaneAuthReq.waiting.message': `Please wait while we authorize access to {catalogPrefix}. You will be redirected shortly.`,

    // MCP Auth Req
    'mcpAuthReq.loading': `Checking the authorization request...`,
    'mcpAuthReq.header': `Connect {clientName} to Estuary?`,
    // The host is called out separately and deliberately: an application's name
    // is whatever its client-metadata document claims, while the host that
    // served that document is not something an impostor can choose.
    'mcpAuthReq.identity': `{clientName} identifies itself using a client-metadata document served by {clientHost}. Only continue if you recognize that address.`,
    'mcpAuthReq.explanation': `Approving lets this application read and change your Estuary catalog with the same access you have. You can revoke it at any time from Admin -> CLI & API.`,
    'mcpAuthReq.cta.approve': `Approve`,
    'mcpAuthReq.error.missingParams': `This authorization link is missing required parameters.`,
    'mcpAuthReq.error.untrustedAdapter': `Refusing to authorize {adapter}: it is not a recognized Estuary MCP server. This link may not be genuine.`,
    'mcpAuthReq.error.unknownRequest': `This authorization request is unknown or has expired. Start the connection again from your MCP client.`,
    'mcpAuthReq.error.unreachableAdapter': `Could not reach the Estuary MCP server: {error}`,
    'mcpAuthReq.error.mintFailed': `Could not issue a credential for this application.`,
};
