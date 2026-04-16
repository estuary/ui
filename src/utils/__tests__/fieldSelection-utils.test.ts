import type { FieldOutcome, RejectOutput, SelectOutput } from 'src/types/wasm';

import { RejectReason, SelectReason } from 'src/types/wasm';

import {
    DEFAULT_RECOMMENDED_FLAG,
    getExpandedFieldSelection,
    getFieldSelection,
    hasFieldConflict,
    isFieldSelectionType,
    isSelectedField,
    isUnselectedField,
    mapAlgorithmToRecommendedValue,
    mapRecommendedValueToAlgorithm,
} from 'src/utils/fieldSelection-utils';

const makeSelect = (reason = SelectReason.USER_DEFINED): SelectOutput => ({
    detail: '',
    reason: { type: reason },
});

const makeReject = (reason = RejectReason.USER_EXCLUDES): RejectOutput => ({
    detail: '',
    reason: { type: reason },
});

const makeOutcome = (overrides: Partial<FieldOutcome> = {}): FieldOutcome => ({
    field: 'test_field',
    ...overrides,
});

// ----------------------------------------------------------------------------
// isSelectedField
// ----------------------------------------------------------------------------

describe('isSelectedField', () => {
    test('returns true when select is set and reject is not', () => {
        expect(isSelectedField(makeOutcome({ select: makeSelect() }))).toBe(true);
    });

    test('returns false when both select and reject are set', () => {
        expect(isSelectedField(makeOutcome({ select: makeSelect(), reject: makeReject() }))).toBe(false);
    });

    test('returns false when neither is set', () => {
        expect(isSelectedField(makeOutcome())).toBe(false);
    });

    test('returns false when only reject is set', () => {
        expect(isSelectedField(makeOutcome({ reject: makeReject() }))).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// isUnselectedField
// ----------------------------------------------------------------------------

describe('isUnselectedField', () => {
    test('returns true when reject is set and select is not', () => {
        expect(isUnselectedField(makeOutcome({ reject: makeReject() }))).toBe(true);
    });

    test('returns false when both are set', () => {
        expect(isUnselectedField(makeOutcome({ select: makeSelect(), reject: makeReject() }))).toBe(false);
    });

    test('returns false when neither is set', () => {
        expect(isUnselectedField(makeOutcome())).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// hasFieldConflict
// ----------------------------------------------------------------------------

describe('hasFieldConflict', () => {
    test('returns true when both select and reject are set', () => {
        expect(hasFieldConflict(makeOutcome({ select: makeSelect(), reject: makeReject() }))).toBe(true);
    });

    test('returns false when only one is set', () => {
        expect(hasFieldConflict(makeOutcome({ select: makeSelect() }))).toBe(false);
        expect(hasFieldConflict(makeOutcome({ reject: makeReject() }))).toBe(false);
    });

    test('returns false when neither is set', () => {
        expect(hasFieldConflict(makeOutcome())).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// isFieldSelectionType
// ----------------------------------------------------------------------------

describe('isFieldSelectionType', () => {
    test('returns true for valid selection types', () => {
        expect(isFieldSelectionType('default')).toBe(true);
        expect(isFieldSelectionType('exclude')).toBe(true);
        expect(isFieldSelectionType('require')).toBe(true);
    });

    test('returns false for unknown strings', () => {
        expect(isFieldSelectionType('unknown')).toBe(false);
        expect(isFieldSelectionType('')).toBe(false);
    });

    test('returns false for non-string values', () => {
        expect(isFieldSelectionType(null)).toBe(false);
        expect(isFieldSelectionType(42)).toBe(false);
        expect(isFieldSelectionType({})).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// getFieldSelection
// ----------------------------------------------------------------------------

describe('getFieldSelection', () => {
    const outcome = makeOutcome({ field: 'col_a', select: makeSelect() });

    test('assigns mode "default" for a selected field with no fieldsStanza', () => {
        const result = getFieldSelection([outcome]);
        expect(result['col_a'].mode).toBe('default');
    });

    test('assigns mode null for an unselected field with no fieldsStanza', () => {
        const unselected = makeOutcome({ field: 'col_b' });
        const result = getFieldSelection([unselected]);
        expect(result['col_b'].mode).toBeNull();
    });

    test('assigns mode "exclude" when field is in fieldsStanza.exclude', () => {
        const result = getFieldSelection([outcome], { recommended: true, exclude: ['col_a'] });
        expect(result['col_a'].mode).toBe('exclude');
    });

    test('assigns mode "require" for a field in modern fieldsStanza.require', () => {
        const result = getFieldSelection(
            [outcome],
            { recommended: true, require: { col_a: {} }, exclude: [] }
        );
        expect(result['col_a'].mode).toBe('require');
        expect(result['col_a'].meta).toEqual({});
    });

    test('assigns mode "require" for a field in legacy fieldsStanza.include', () => {
        const result = getFieldSelection(
            [outcome],
            { recommended: true, include: { col_a: { value: 1 } }, exclude: [] }
        );
        expect(result['col_a'].mode).toBe('require');
        expect(result['col_a'].meta).toEqual({ value: 1 });
    });

    test('exclude takes priority over require', () => {
        const result = getFieldSelection(
            [outcome],
            { recommended: true, require: { col_a: {} }, exclude: ['col_a'] }
        );
        expect(result['col_a'].mode).toBe('exclude');
    });

    test('attaches the matching projection when provided', () => {
        const projection = { field: 'col_a', ptr: '/col_a', inference: {} } as any;
        const result = getFieldSelection([outcome], undefined, [projection]);
        expect(result['col_a'].projection).toBe(projection);
    });
});

// ----------------------------------------------------------------------------
// getExpandedFieldSelection
// ----------------------------------------------------------------------------

describe('getExpandedFieldSelection', () => {
    test('returns empty array for undefined input', () => {
        expect(getExpandedFieldSelection(undefined)).toEqual([]);
    });

    test('marks a field as isGroupByKey when in explicit list', () => {
        const selections = {
            value: {
                col_a: { field: 'col_a', mode: 'default', outcome: makeOutcome({ field: 'col_a', select: makeSelect() }) },
            },
            groupBy: { value: { explicit: ['col_a'], implicit: [] } },
        } as any;
        const result = getExpandedFieldSelection(selections);
        expect(result[0].isGroupByKey).toBe(true);
    });

    test('falls back to implicit list when explicit is empty', () => {
        const selections = {
            value: {
                col_a: { field: 'col_a', mode: 'default', outcome: makeOutcome({ field: 'col_a', select: makeSelect() }) },
            },
            groupBy: { value: { explicit: [], implicit: ['col_a'] } },
        } as any;
        const result = getExpandedFieldSelection(selections);
        expect(result[0].isGroupByKey).toBe(true);
    });

    test('marks a field as not isGroupByKey when absent from both lists', () => {
        const selections = {
            value: {
                col_b: { field: 'col_b', mode: null, outcome: makeOutcome({ field: 'col_b' }) },
            },
            groupBy: { value: { explicit: ['col_a'], implicit: [] } },
        } as any;
        const result = getExpandedFieldSelection(selections);
        expect(result[0].isGroupByKey).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// mapRecommendedValueToAlgorithm
// ----------------------------------------------------------------------------

describe('mapRecommendedValueToAlgorithm', () => {
    test.each([
        [0, 'depthZero'],
        [1, 'depthOne'],
        [2, 'depthTwo'],
        [true, 'depthUnlimited'],
    ])('maps %s → %s', (input, expected) => {
        expect(mapRecommendedValueToAlgorithm(input as any)).toBe(expected);
    });

    test('returns null for unrecognized values', () => {
        expect(mapRecommendedValueToAlgorithm(null)).toBeNull();
        expect(mapRecommendedValueToAlgorithm(undefined)).toBeNull();
        expect(mapRecommendedValueToAlgorithm(false)).toBeNull();
        expect(mapRecommendedValueToAlgorithm(99)).toBeNull();
    });
});

// ----------------------------------------------------------------------------
// mapAlgorithmToRecommendedValue
// ----------------------------------------------------------------------------

describe('mapAlgorithmToRecommendedValue', () => {
    test.each([
        ['depthZero', 0],
        ['depthOne', 1],
        ['depthTwo', 2],
        ['depthUnlimited', true],
    ] as const)('maps %s → %s', (input, expected) => {
        expect(mapAlgorithmToRecommendedValue(input, undefined)).toBe(expected);
    });

    test('falls back to provided fieldsRecommended when algorithm is null', () => {
        expect(mapAlgorithmToRecommendedValue(null, 2)).toBe(2);
        expect(mapAlgorithmToRecommendedValue(undefined, false)).toBe(false);
    });

    test('falls back to DEFAULT_RECOMMENDED_FLAG when algorithm and fieldsRecommended are both absent', () => {
        expect(mapAlgorithmToRecommendedValue(null, undefined)).toBe(DEFAULT_RECOMMENDED_FLAG);
    });
});
