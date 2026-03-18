import type {
    BindingFieldSelection,
    StoreWithFieldSelection,
} from 'src/stores/Binding/slices/FieldSelection';

import { createStore } from 'zustand/vanilla';

import {
    getHydrationStatus,
    getStoreWithFieldSelectionSettings,
    isHydrating,
} from 'src/stores/Binding/slices/FieldSelection';
import { MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS } from 'src/utils/entity-utils';

vi.mock('src/services/shared', () => ({
    logRocketEvent: vi.fn(),
}));

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const mockSelection = (
    overrides: Partial<BindingFieldSelection> = {}
): BindingFieldSelection => ({
    groupBy: {
        liveGroupByKey: [],
        value: { explicit: [], implicit: [] },
    },
    hasConflicts: false,
    hydrating: false,
    status: 'VALIDATION_REQUESTED',
    validationAttempts: 0,
    validationFailed: false,
    value: {},
    ...overrides,
});

const createTestStore = (
    initialSelections: Record<string, BindingFieldSelection> = {}
) => {
    const store = createStore<StoreWithFieldSelection>((set) =>
        getStoreWithFieldSelectionSettings(set as any)
    );

    if (Object.keys(initialSelections).length > 0) {
        store.setState({ selections: initialSelections });
    }

    return store;
};

// ----------------------------------------------------------------------------
// isHydrating
// ----------------------------------------------------------------------------

describe('isHydrating', () => {
    test('returns false when status is HYDRATED', () => {
        expect(isHydrating('HYDRATED')).toBe(false);
    });

    test('returns true for all non-HYDRATED statuses', () => {
        expect(isHydrating('VALIDATION_REQUESTED')).toBe(true);
        expect(isHydrating('VALIDATING')).toBe(true);
        expect(isHydrating('SERVER_UPDATE_REQUESTED')).toBe(true);
        expect(isHydrating('RESET_REQUESTED')).toBe(true);
        expect(isHydrating('SERVER_UPDATING')).toBe(true);
    });
});

// ----------------------------------------------------------------------------
// getHydrationStatus — state machine transitions
// ----------------------------------------------------------------------------

describe('getHydrationStatus', () => {
    describe('state machine transitions', () => {
        test('HYDRATED > SERVER_UPDATE_REQUESTED', () => {
            expect(getHydrationStatus('HYDRATED')).toBe(
                'SERVER_UPDATE_REQUESTED'
            );
        });

        test('HYDRATED + reset > RESET_REQUESTED', () => {
            expect(getHydrationStatus('HYDRATED', true)).toBe(
                'RESET_REQUESTED'
            );
        });

        test('SERVER_UPDATE_REQUESTED > SERVER_UPDATING', () => {
            expect(getHydrationStatus('SERVER_UPDATE_REQUESTED')).toBe(
                'SERVER_UPDATING'
            );
        });

        test('RESET_REQUESTED > SERVER_UPDATING', () => {
            expect(getHydrationStatus('RESET_REQUESTED')).toBe(
                'SERVER_UPDATING'
            );
        });

        test('SERVER_UPDATING > VALIDATION_REQUESTED', () => {
            expect(getHydrationStatus('SERVER_UPDATING')).toBe(
                'VALIDATION_REQUESTED'
            );
        });

        test('VALIDATION_REQUESTED > VALIDATING', () => {
            expect(getHydrationStatus('VALIDATION_REQUESTED')).toBe(
                'VALIDATING'
            );
        });

        test('VALIDATING > HYDRATED', () => {
            expect(getHydrationStatus('VALIDATING')).toBe('HYDRATED');
        });

        test('undefined > VALIDATION_REQUESTED (default entry point)', () => {
            expect(getHydrationStatus(undefined)).toBe('VALIDATION_REQUESTED');
        });
    });

    describe('forcedStatus overrides current status', () => {
        // terminateHydrationCycle passes forcedStatus='HYDRATED' to end the cycle early
        test('forced HYDRATED terminates any in-progress status', () => {
            expect(getHydrationStatus('VALIDATING', false, 'HYDRATED')).toBe(
                'HYDRATED'
            );
            expect(
                getHydrationStatus('VALIDATION_REQUESTED', false, 'HYDRATED')
            ).toBe('HYDRATED');
            expect(
                getHydrationStatus('SERVER_UPDATING', false, 'HYDRATED')
            ).toBe('HYDRATED');
            expect(
                getHydrationStatus('SERVER_UPDATE_REQUESTED', false, 'HYDRATED')
            ).toBe('HYDRATED');
        });

        test('forced VALIDATION_REQUESTED re-queues from any status', () => {
            expect(
                getHydrationStatus('VALIDATING', false, 'VALIDATION_REQUESTED')
            ).toBe('VALIDATION_REQUESTED');
            expect(
                getHydrationStatus('HYDRATED', false, 'VALIDATION_REQUESTED')
            ).toBe('VALIDATION_REQUESTED');
        });

        test('forcedStatus takes precedence over reset flag', () => {
            expect(
                getHydrationStatus('HYDRATED', true, 'VALIDATION_REQUESTED')
            ).toBe('VALIDATION_REQUESTED');
        });
    });
});

// ----------------------------------------------------------------------------
// trackValidationAttempt
// ----------------------------------------------------------------------------

describe('trackValidationAttempt', () => {
    test('increments validationAttempts on first call', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({ validationAttempts: 0 }),
        });

        store.getState().trackValidationAttempt(uuid);

        expect(store.getState().selections[uuid].validationAttempts).toBe(1);
    });

    test('does not increment beyond MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({
                validationAttempts: MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS,
            }),
        });

        store.getState().trackValidationAttempt(uuid);
        store.getState().trackValidationAttempt(uuid);
        store.getState().trackValidationAttempt(uuid);
        store.getState().trackValidationAttempt(uuid);

        expect(store.getState().selections[uuid].validationAttempts).toBe(
            MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS
        );
    });

    test('does not throw or mutate state for an unknown bindingUUID', () => {
        const store = createTestStore();

        expect(() =>
            store.getState().trackValidationAttempt('nonexistent')
        ).not.toThrow();
        expect(store.getState().selections).toEqual({});
    });

    test('only affects the targeted binding', () => {
        const target = 'target-uuid';
        const other = 'other-uuid';
        const store = createTestStore({
            [target]: mockSelection({ validationAttempts: 0 }),
            [other]: mockSelection({ validationAttempts: 0 }),
        });

        store.getState().trackValidationAttempt(target);

        expect(store.getState().selections[target].validationAttempts).toBe(1);
        expect(store.getState().selections[other].validationAttempts).toBe(0);
    });
});

// ----------------------------------------------------------------------------
// setValidationFailure
// ----------------------------------------------------------------------------

describe('setValidationFailure', () => {
    test('marks binding as validationFailed', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({ validationFailed: false }),
        });

        store.getState().setValidationFailure([uuid]);

        expect(store.getState().selections[uuid].validationFailed).toBe(true);
    });

    test('resets validationAttempts to 0', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({
                validationAttempts: MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS,
            }),
        });

        store.getState().setValidationFailure([uuid]);

        expect(store.getState().selections[uuid].validationAttempts).toBe(0);
    });

    test('serverUpdateFailed=true resolves status to HYDRATED immediately', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({ status: 'VALIDATING' }),
        });

        store.getState().setValidationFailure([uuid], true);

        expect(store.getState().selections[uuid].status).toBe('HYDRATED');
    });

    test('without serverUpdateFailed, advances status normally from VALIDATING', () => {
        const uuid = 'binding-uuid';
        const store = createTestStore({
            [uuid]: mockSelection({ status: 'VALIDATING' }),
        });

        store.getState().setValidationFailure([uuid]);

        // VALIDATING > HYDRATED is the normal transition
        expect(store.getState().selections[uuid].status).toBe('HYDRATED');
    });

    test('handles multiple UUIDs in one call', () => {
        const uuid1 = 'binding-1';
        const uuid2 = 'binding-2';
        const store = createTestStore({
            [uuid1]: mockSelection({ validationAttempts: 1 }),
            [uuid2]: mockSelection({ validationAttempts: 1 }),
        });

        store.getState().setValidationFailure([uuid1, uuid2]);

        expect(store.getState().selections[uuid1].validationFailed).toBe(true);
        expect(store.getState().selections[uuid1].validationAttempts).toBe(0);
        expect(store.getState().selections[uuid2].validationFailed).toBe(true);
        expect(store.getState().selections[uuid2].validationAttempts).toBe(0);
    });
});
