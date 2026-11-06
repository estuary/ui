// Browser storage left behind by PostHog projects we no longer use. The old
// SDK config stored the first URL a user landed on (which could carry an
// invite link's grantToken) in a cookie on the parent domain, so it is sent to
// every subdomain until it expires. Nothing rewrites these after the switch,
// so they expire at most 365 days after it ships; remove a token from this list
// after that.
//
// Only list tokens explicitly. Other sites on the parent domain may run their
// own PostHog with their own cookie, which a wildcard would delete.
const RETIRED_POSTHOG_TOKENS: readonly string[] = [
    // Retired in favour of a new project when analytics moved to an allowlist
    'phc_f0PRTM1hKZA6qHa6O3n01chjvC3PMy4wG72gnfXyL7t',
];

// The host and each parent domain, e.g. a.b.example.com -> [a.b.example.com,
// b.example.com, example.com]. A cookie can only be deleted with the domain
// it was set on, and the browser ignores attempts on a public suffix.
export const cookieDomains = (hostname: string): string[] => {
    const parts = hostname.split('.');
    return parts.slice(0, -1).map((_, i) => parts.slice(i).join('.'));
};

const cookieNames = (): string[] =>
    document.cookie
        .split(';')
        .map((pair) => pair.split('=')[0].trim())
        .filter(Boolean);

const removeStorageKeys = (
    storage: () => Storage,
    matches: (key: string) => boolean
) => {
    try {
        const store = storage();
        const keys: string[] = [];
        for (let i = 0; i < store.length; i += 1) {
            const key = store.key(i);
            if (key !== null && matches(key)) {
                keys.push(key);
            }
        }
        keys.forEach((key) => store.removeItem(key));
    } catch {
        // Storage can be unavailable (private mode, blocked site data)
    }
};

export const purgeRetiredPostHogStorage = (
    tokens: readonly string[] = RETIRED_POSTHOG_TOKENS
) => {
    if (typeof window === 'undefined' || tokens.length === 0) {
        return;
    }

    const matches = (key: string) => tokens.some((t) => key.includes(t));
    const domains = cookieDomains(window.location.hostname);

    cookieNames()
        .filter(matches)
        .forEach((name) => {
            document.cookie = `${name}=; Max-Age=0; path=/`;
            domains.forEach((domain) => {
                document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
            });
        });

    removeStorageKeys(() => window.localStorage, matches);
    removeStorageKeys(() => window.sessionStorage, matches);
};
