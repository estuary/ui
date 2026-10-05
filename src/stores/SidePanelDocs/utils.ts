// Only embed docs whose parsed hostname is the trusted host or a subdomain of it.
//  A raw substring check would accept hosts like `estuary.dev.evil.com`.
export const isTrustedDocsUrl = (url: string, trustedHost: string) => {
    if (!trustedHost) {
        return false;
    }

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    const host = trustedHost.toLowerCase();
    const hostnameMatches =
        parsed.hostname === host || parsed.hostname.endsWith(`.${host}`);

    // Plain http is only allowed for local docs development
    const protocolAllowed =
        parsed.protocol === 'https:' ||
        (parsed.protocol === 'http:' && host === 'localhost');

    return hostnameMatches && protocolAllowed;
};
