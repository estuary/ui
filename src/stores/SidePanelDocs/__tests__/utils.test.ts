import { describe, expect, test } from 'vitest';

import { isTrustedDocsUrl } from 'src/stores/SidePanelDocs/utils';

describe('isTrustedDocsUrl', () => {
    test.each([
        'https://go.estuary.dev/source-google-ads',
        'https://docs.estuary.dev/reference/Connectors/',
        'https://estuary.dev/docs',
    ])('allows %s', (url) => {
        expect(isTrustedDocsUrl(url, 'estuary.dev')).toBe(true);
    });

    test.each([
        'https://go.estuary.dev.evil.com/attacker-docs',
        'https://evil.com/docs?estuary.dev',
        'https://evil.com/estuary.dev',
        'https://evilestuary.dev/docs',
        'https://evil.com/docs',
        'http://go.estuary.dev/source-google-ads',
        'javascript:alert(1)//estuary.dev',
        'not a url estuary.dev',
    ])('rejects %s', (url) => {
        expect(isTrustedDocsUrl(url, 'estuary.dev')).toBe(false);
    });

    test('rejects everything when no trusted host is configured', () => {
        expect(isTrustedDocsUrl('https://go.estuary.dev/x', '')).toBe(false);
    });

    test('allows http for local docs development', () => {
        expect(isTrustedDocsUrl('http://localhost:3000/x', 'localhost')).toBe(
            true
        );
    });
});
