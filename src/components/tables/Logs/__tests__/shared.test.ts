import type { LogLevels } from 'src/components/tables/Logs/types';
import type { OpsLogFlowDocument } from 'src/types';

import {
    logMatchesFilter,
    toFilteredIndex,
} from 'src/components/tables/Logs/shared';

const doc = (level: LogLevels, uuid: string): OpsLogFlowDocument => ({
    _meta: { uuid },
    level,
    message: '',
    ts: '',
});

describe('logMatchesFilter', () => {
    test('all shows every level', () => {
        expect(logMatchesFilter('debug', 'all')).toBe(true);
        expect(logMatchesFilter('info', 'all')).toBe(true);
    });

    test('warn shows warnings and errors only', () => {
        expect(logMatchesFilter('error', 'warn')).toBe(true);
        expect(logMatchesFilter('warn', 'warn')).toBe(true);
        expect(logMatchesFilter('info', 'warn')).toBe(false);
    });

    test('error shows errors only', () => {
        expect(logMatchesFilter('error', 'error')).toBe(true);
        expect(logMatchesFilter('warn', 'error')).toBe(false);
    });
});

describe('toFilteredIndex', () => {
    // Unfiltered rows: 0 fake oldest, 1-5 documents, 6 fake newest
    const documents = [
        doc('info', 'a'),
        doc('error', 'b'),
        doc('info', 'c'),
        doc('info', 'd'),
        doc('error', 'e'),
    ];

    test('leaves indexes alone when nothing is filtered', () => {
        expect(toFilteredIndex(documents, 'all', 3)).toBe(3);
    });

    test('keeps a visible target on the same row', () => {
        // 'e' is unfiltered index 5 and the second visible row (index 2)
        expect(toFilteredIndex(documents, 'error', 5)).toBe(2);
    });

    test('moves a hidden target to the next visible row', () => {
        // 'c' (index 3) is hidden, so the target becomes 'e'
        expect(toFilteredIndex(documents, 'error', 3)).toBe(2);
    });

    test('maps the fake newest row, and past it, onto the filtered fake newest row', () => {
        expect(toFilteredIndex(documents, 'error', 6)).toBe(3);
        expect(toFilteredIndex(documents, 'error', 7)).toBe(3);
    });

    test('points at the fake newest row when nothing matches', () => {
        const noErrors = [doc('info', 'a'), doc('info', 'b')];

        expect(toFilteredIndex(noErrors, 'error', 2)).toBe(1);
    });
});
