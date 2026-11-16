import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { LiveSpecsExtQueryWithSpec } from 'src/hooks/useLiveSpecsExt';
import type { BindingFieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { ResourceConfig } from 'src/stores/Binding/types';
import type { BuiltCollection } from 'src/types/schemaModels';

import { evaluate_field_selection } from '@estuary/flow-web';
import { renderHook, waitFor } from '@testing-library/react';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import useFieldSelection from 'src/hooks/fieldSelection/useFieldSelection';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';
import useValidateFieldSelection from 'src/hooks/fieldSelection/useValidateFieldSelection';
import { useBindingStore } from 'src/stores/Binding/Store';
import { FormStatus } from 'src/stores/FormState/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

vi.mock(import('src/api/draftSpecs'), async (importOriginal) => ({
    ...(await importOriginal()),
    modifyDraftSpec: vi.fn(),
}));
vi.mock('@estuary/flow-web', () => ({
    evaluate_field_selection: vi.fn(),
}));
vi.mock('src/components/editor/Store/hooks', () => ({
    useEditorStore_persistedDraftId: () => 'draft-id',
    useEditorStore_queryResponse_mutate: () => mutate,
    useEditorStore_queryResponse_draftSpecs: () => draftRows,
}));
vi.mock('src/context/EntityContext', () => ({
    useEntityType: () => 'materialization',
}));
vi.mock('src/hooks/useLiveSpecsExt', () => ({
    useEditorLiveSpec: () => liveRow,
}));
vi.mock('src/stores/FormState/hooks', () => ({
    useFormStateStore_status: () => FormStatus.TESTED,
}));
vi.mock('src/services/shared', () => ({
    logRocketEvent: vi.fn(),
}));

const collectionName = 'acme/shared';
const mutate = vi.fn();
let draftRows: DraftSpecQuery[];
let liveRow: LiveSpecsExtQueryWithSpec;

const collection = (field: string): BuiltCollection => ({
    ackTemplate: {},
    key: [`/${field}`],
    name: collectionName,
    partitionTemplate: {},
    projections: [{ field, ptr: `/${field}`, inference: { type: 'string' } }],
    uuidPtr: '/_meta/uuid',
    writeSchema: {},
});

const authoredBinding = (table: string, backfill: number) => ({
    source: collectionName,
    resource: { table, _meta: { path: ['public', table] } },
    fields: { require: { [`${table}_id`]: { original: true } } },
    backfill,
});

const builtSpec = (indirect: boolean) => {
    const collections = [collection('b_id'), collection('a_id')];

    return {
        ...(indirect ? { linkedCollections: collections } : {}),
        bindings: ['b', 'a'].map((table, index) => ({
            ...(indirect
                ? { collectionIndex: index }
                : { collection: collections[index] }),
            resourceConfig: { table },
            resourcePath: ['public', table],
            fieldSelection: { keys: [`${table}_id`] },
        })),
    };
};

const selection = (table: string): BindingFieldSelection => ({
    groupBy: {
        liveGroupByKey: [],
        value: { explicit: [`${table}_id`], implicit: [] },
    },
    hasConflicts: false,
    hydrating: false,
    status: 'HYDRATED',
    validationAttempts: 0,
    validationFailed: false,
    value: {
        [`${table}_id`]: {
            field: `${table}_id`,
            mode: 'require',
            outcome: { field: `${table}_id` },
            meta: { column: table },
        },
        ignored: {
            field: 'ignored',
            mode: 'exclude',
            outcome: { field: 'ignored' },
        },
    },
});

const resourceConfig = (
    binding: ReturnType<typeof authoredBinding>,
    bindingIndex: number
): ResourceConfig => ({
    data: binding.resource,
    errors: [],
    meta: {
        collectionName,
        bindingIndex,
        builtBindingIndex: -1,
        validatedBindingIndex: -1,
        liveBindingIndex: -1,
        liveBuiltBindingIndex: -1,
    },
});

const initialize = (liveIndirect = false, draftIndirect = false) => {
    const bindings = [authoredBinding('a', 2), authoredBinding('b', 7)];
    const draft: DraftSpecQuery = {
        catalog_name: 'acme/materialization',
        draft_id: 'draft-id',
        expect_pub_id: 'publication-id',
        spec_type: 'materialization',
        spec: { bindings, endpoint: { connector: { config: {} } } },
        built_spec: builtSpec(draftIndirect),
        validated: {
            bindings: ['a', 'b'].map((table) => ({
                resourcePath: ['public', table],
                constraints: { [`${table}_id`]: { type: 1 } },
            })),
        },
    };

    draftRows = [draft];
    liveRow = {
        id: 'live-id',
        catalog_name: draft.catalog_name,
        detail: '',
        last_pub_id: draft.expect_pub_id,
        reads_from: [],
        writes_to: [],
        spec_type: 'materialization',
        spec: { bindings: [...bindings].reverse() },
        built_spec: builtSpec(liveIndirect),
    };
    useBindingStore.setState({
        currentBinding: { uuid: 'a', collection: collectionName },
        bindings: { [collectionName]: ['a', 'b'] },
        resourceConfigs: {
            a: resourceConfig(bindings[0], 0),
            b: resourceConfig(bindings[1], 1),
        },
        recommendFields: { b: false },
        selections: { a: selection('a'), b: selection('b') },
    });
    useWorkflowStore.setState({
        collections: { [collectionName]: { spec: { key: ['/id'] } } } as never,
    });

    return draft;
};

beforeEach(() => {
    mutate.mockResolvedValue(undefined);
    vi.mocked(modifyDraftSpec).mockResolvedValue({
        data: [],
        error: null,
    } as never);
    vi.mocked(evaluate_field_selection).mockReturnValue({
        hasConflicts: false,
        outcomes: [{ field: 'b_id' }],
        selection: { keys: ['b_id'], document: '', fieldConfig: {} },
    });
});

describe('field selection writes', () => {
    test.each([false, true])(
        'updates the requested binding while another is selected (indirect: %s)',
        async (indirect) => {
            const draft = initialize(false, indirect);
            const before = structuredClone(draft.spec);
            useBindingStore.setState((state) => ({
                selections: {
                    ...state.selections,
                    b: { ...state.selections.b, status: 'SERVER_UPDATING' },
                },
            }));
            const { result } = renderHook(() =>
                useFieldSelection('b', collectionName)
            );

            await result.current.applyFieldSelection(draft);

            expect(modifyDraftSpec).toHaveBeenCalledExactlyOnceWith(
                {
                    ...before,
                    bindings: [
                        before.bindings[0],
                        {
                            ...before.bindings[1],
                            fields: {
                                recommended: false,
                                groupBy: ['b_id'],
                                require: { b_id: { column: 'b' } },
                                exclude: ['ignored'],
                            },
                        },
                    ],
                },
                {
                    draft_id: 'draft-id',
                    catalog_name: draft.catalog_name,
                    spec_type: 'materialization',
                }
            );
            expect(draft.spec).toEqual(before);
            expect(mutate).toHaveBeenCalledOnce();
        }
    );

    test.each(['failed', 'disabled', 'unresolved', 'ambiguous', 'moved'])(
        'does not write through a %s association',
        async (failure) => {
            const draft = initialize();
            const state = useBindingStore.getState();

            if (failure === 'failed') {
                state.setValidationFailure(['b'], true);
            } else if (failure === 'disabled') {
                state.toggleDisable([
                    { bindingUUID: 'b', bindingIndex: 1, val: true },
                ]);
            } else if (failure === 'unresolved') {
                draft.built_spec = { bindings: [] };
            } else if (failure === 'ambiguous') {
                draft.spec.bindings.push(
                    structuredClone(draft.spec.bindings[1])
                );
            } else {
                draft.spec.bindings.reverse();
            }
            const before = structuredClone(draft.spec);
            const { result } = renderHook(() =>
                useFieldSelection('b', collectionName)
            );

            await expect(
                result.current.applyFieldSelection(draft)
            ).rejects.toThrow('Field selection is unavailable');

            expect(modifyDraftSpec).not.toHaveBeenCalled();
            expect(mutate).not.toHaveBeenCalled();
            expect(draft.spec).toEqual(before);
        }
    );
});

describe('field selection validation', () => {
    test.each([
        [false, false],
        [false, true],
        [true, false],
        [true, true],
    ])(
        'uses the matched resource and its own collection (live indirect: %s, draft indirect: %s)',
        async (liveIndirect, draftIndirect) => {
            const draft = initialize(liveIndirect, draftIndirect);
            useBindingStore
                .getState()
                .advanceHydrationStatus('HYDRATED', 'b', undefined, true);

            renderHook(() => useValidateFieldSelection());

            await waitFor(() => {
                expect(useBindingStore.getState().selections.b.status).toBe(
                    'HYDRATED'
                );
            });
            expect(evaluate_field_selection).toHaveBeenCalledExactlyOnceWith({
                collection: { name: collectionName, model: { key: ['/id'] } },
                binding: {
                    live: liveRow.built_spec!.bindings[0],
                    model: draft.spec.bindings[1],
                    validated: draft.validated!.bindings[1],
                },
            });
            expect(useBindingStore.getState().selections.b).toMatchObject({
                validationFailed: false,
                groupBy: { value: { implicit: ['b_id'] } },
                value: {
                    b_id: { projection: collection('b_id').projections[0] },
                },
            });
            expect(useBindingStore.getState().selections.a).toEqual(
                selection('a')
            );
        }
    );

    test('marks unresolved enabled bindings failed without evaluating another resource', async () => {
        const draft = initialize();
        draft.built_spec = { bindings: [] };
        useBindingStore
            .getState()
            .advanceHydrationStatus('HYDRATED', 'b', undefined, true);

        renderHook(() => useValidateFieldSelection());

        await waitFor(() => {
            expect(useBindingStore.getState().selections.b).toMatchObject({
                status: 'HYDRATED',
                validationFailed: true,
            });
        });
        expect(evaluate_field_selection).not.toHaveBeenCalled();
        expect(useBindingStore.getState().selections.a).toEqual(selection('a'));
    });
});

test('a live result without bindings has no group-by key while indices refresh', () => {
    initialize();
    useBindingStore.setState((state) => ({
        resourceConfigs: {
            ...state.resourceConfigs,
            b: {
                ...state.resourceConfigs.b,
                meta: {
                    ...state.resourceConfigs.b.meta,
                    liveBuiltBindingIndex: 0,
                },
            },
        },
    }));
    liveRow.built_spec = {};

    const { result } = renderHook(() => useLiveGroupByKey('b'));

    expect(result.current.existingGroupByKey).toEqual([]);
});
