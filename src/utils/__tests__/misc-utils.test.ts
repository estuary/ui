import {
    appendWithForwardSlash,
    getPathWithParams,
    hasLength,
    JOURNAL_READ_ERRORS,
    JOURNAL_READ_WARNINGS,
    journalStatusIsError,
    journalStatusIsWarning,
    normalizeCatalogName,
    splitPathAndName,
    stripPathing,
} from 'src/utils/misc-utils';

describe('stripPathing', () => {
    test('returns the final segment after the last slash', () => {
        expect(stripPathing('acme/captures/my-capture')).toBe('my-capture');
    });

    test('returns just the name when there is a single slash', () => {
        expect(stripPathing('acme/my-capture')).toBe('my-capture');
    });

    test('returns the tenant (including slash) when tenantOnly is true', () => {
        expect(stripPathing('acme/captures/my-capture', true)).toBe('acme/');
    });

    test('returns empty string unchanged', () => {
        expect(stripPathing('')).toBe('');
    });
});

describe('splitPathAndName', () => {
    test('splits path and name at the last slash', () => {
        expect(splitPathAndName('acme/captures/my-capture')).toEqual([
            'acme/captures/',
            'my-capture',
        ]);
    });

    test('splits a single-segment path', () => {
        expect(splitPathAndName('acme/my-capture')).toEqual([
            'acme/',
            'my-capture',
        ]);
    });

    test('returns empty array for empty string', () => {
        expect(splitPathAndName('')).toEqual([]);
    });
});

describe('hasLength', () => {
    test('returns true for a non-empty string', () => {
        expect(hasLength('hello')).toBe(true);
    });

    test('returns true for a non-empty array', () => {
        expect(hasLength([1, 2, 3])).toBe(true);
    });

    test('returns false for an empty string', () => {
        expect(hasLength('')).toBe(false);
    });

    test('returns false for an empty array', () => {
        expect(hasLength([])).toBe(false);
    });

    test('returns false for null', () => {
        expect(hasLength(null)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(hasLength(undefined)).toBe(false);
    });
});

describe('appendWithForwardSlash', () => {
    test('appends a slash when value does not end with one', () => {
        expect(appendWithForwardSlash('acme')).toBe('acme/');
    });

    test('does not double-append when value already ends with slash', () => {
        expect(appendWithForwardSlash('acme/')).toBe('acme/');
    });

    test('returns empty string unchanged', () => {
        expect(appendWithForwardSlash('')).toBe('');
    });
});

describe('getPathWithParams', () => {
    test('appends an object of params as a query string', () => {
        const result = getPathWithParams('/api/data', {
            page: '1',
            limit: '10',
        });
        expect(result).toContain('/api/data?');
        expect(result).toContain('page=1');
        expect(result).toContain('limit=10');
    });

    test('accepts a URLSearchParams instance', () => {
        const params = new URLSearchParams({ foo: 'bar' });
        expect(getPathWithParams('/api/data', params)).toBe(
            '/api/data?foo=bar'
        );
    });
});

describe('journalStatusIsWarning', () => {
    test('returns true for known warning statuses', () => {
        JOURNAL_READ_WARNINGS.forEach((status) => {
            expect(journalStatusIsWarning(status as any)).toBe(true);
        });
    });

    test('returns false for unknown statuses', () => {
        expect(journalStatusIsWarning('UNKNOWN_STATUS' as any)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(journalStatusIsWarning(undefined)).toBe(false);
    });
});

describe('journalStatusIsError', () => {
    test('returns true for known error statuses', () => {
        JOURNAL_READ_ERRORS.forEach((status) => {
            expect(journalStatusIsError(status)).toBe(true);
        });
    });

    test('returns false for unknown statuses', () => {
        expect(journalStatusIsError('UNKNOWN_STATUS')).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(journalStatusIsError(undefined)).toBe(false);
    });
});

describe('normalizeCatalogName', () => {
    test('replaces spaces with underscores', () => {
        expect(normalizeCatalogName('hello world')).toBe('hello_world');
    });

    test('replaces multiple whitespace characters', () => {
        expect(normalizeCatalogName('a b\tc')).toBe('a_b_c');
    });

    test('returns string without whitespace unchanged', () => {
        expect(normalizeCatalogName('nospaces')).toBe('nospaces');
    });

    test('handles empty string', () => {
        expect(normalizeCatalogName('')).toBe('');
    });

    test('keeps letters, numbers, dashes, underscores, periods and slashes', () => {
        expect(normalizeCatalogName('acmeCo/prod_v2/anvils-1.0/')).toBe(
            'acmeCo/prod_v2/anvils-1.0/'
        );
    });

    test('drops an apostrophe', () => {
        expect(normalizeCatalogName("acmeCo/account's/")).toBe(
            'acmeCo/accounts/'
        );
    });

    test('drops punctuation and symbols', () => {
        expect(normalizeCatalogName('acmeCo/(one)+two@three#/')).toBe(
            'acmeCo/onetwothree/'
        );
    });

    test('converts accented Latin letters to ASCII counterparts', () => {
        expect(normalizeCatalogName('acmeCo/café/søren/Crème Brûlée/')).toBe(
            'acmeCo/cafe/soren/Creme_Brulee/'
        );
    });

    test('strips non-Latin letters and non-ASCII numbers', () => {
        expect(normalizeCatalogName('acmeCo/日本Приключения੫൬٢½⑩prod/')).toBe(
            'acmeCo/prod/'
        );
    });

    test('removes decomposed accents', () => {
        expect(normalizeCatalogName('acmeCo/cafe\u0301/')).toBe('acmeCo/cafe/');
    });

    test('strips emoji, control characters, zero-width characters and uncomposed marks', () => {
        expect(normalizeCatalogName('acmeCo/😀\u0000\u200B\u0301prod/')).toBe(
            'acmeCo/prod/'
        );
    });

    test('returns an empty string when nothing is allowed', () => {
        expect(normalizeCatalogName('!@#$%')).toBe('');
    });
});
