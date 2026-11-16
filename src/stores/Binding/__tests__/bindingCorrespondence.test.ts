import type { Schema } from 'src/types';

import { renderHook } from '@testing-library/react';

import { useGenerateDraftSpec } from 'src/hooks/drafts/useGenerateDraftSpec';
import { useBindingStore } from 'src/stores/Binding/Store';

const collection = 'acme/shared';
const binding = (table: string, backfill = 0, path = table): Schema => ({
    source: collection,
    resource: { table, _meta: { path: [path] } },
    backfill,
    fields: { groupBy: [table], require: { [table]: {} } },
});
const built = (bindings: Schema[]) => ({
    bindings: bindings.map(({ resource }) => ({
        collection: { name: collection },
        resourceConfig: { table: resource.table },
        resourcePath: [resource.table],
        fieldSelection: { keys: [`effective_${resource.table}`] },
    })),
});
const row = (bindings: Schema[]) => ({
    spec: { bindings },
    built_spec: built(bindings),
    validated: {
        bindings: bindings.map(({ resource }) => ({
            resourcePath: [resource.table],
        })),
    },
});
const state = () => useBindingStore.getState();
const uuidFor = (table: string) =>
    Object.entries(state().resourceConfigs).find(
        ([_uuid, config]) => config.data.table === table
    )![0];

beforeEach(() => state().resetState(false, true));

test('initializes previous live state by path and preserves the baseline while current results are unavailable', () => {
    const live = row([binding('a', 4), binding('b', 9)]);
    const draft = row([binding('b', 9), binding('a', 4)]);
    state().prefillBindingDependentState(
        'materialization',
        live.spec.bindings,
        draft.spec.bindings
    );

    const uuid = uuidFor('b');
    expect(state().resourceConfigs[uuid].meta.liveBindingIndex).toBe(1);
    expect(state().selections[uuid].groupBy.liveGroupByKey).toEqual(['b']);
    expect(state().backfilledBindings).toEqual([]);

    state().setRelatedBindingIndices(
        { ...draft, built_spec: null, validated: null },
        live
    );
    expect(state().resourceConfigs[uuid].meta.builtBindingIndex).toBe(-1);
    expect(state().selections[uuid].groupBy.liveGroupByKey).toEqual(['b']);
    expect(state().backfilledBindings).toEqual([]);
});

test('replaces inferred backfill and explicit group-by baseline when validation establishes a different resource', () => {
    const live = row([binding('a', 1), binding('b', 2)]);
    const draft = row([binding('b', 2, 'a')]);
    state().prefillBindingDependentState(
        'materialization',
        live.spec.bindings,
        draft.spec.bindings
    );
    const uuid = uuidFor('b');
    state().setExplicitGroupBy(uuid, ['user_edit']);
    expect(state().backfilledBindings).toEqual([uuid]);
    expect(state().selections[uuid].groupBy.liveGroupByKey).toEqual(['a']);

    state().setRelatedBindingIndices(draft, live);
    expect(state().resourceConfigs[uuid].meta.liveBindingIndex).toBe(1);
    expect(state().selections[uuid].groupBy.liveGroupByKey).toEqual(['b']);
    expect(state().selections[uuid].groupBy.value.explicit).toEqual([
        'user_edit',
    ]);
    expect(state().backfilledBindings).toEqual([]);
});

test.each([true, false])(
    'preserves an explicit backfill choice of %s while changing the live baseline',
    (choice) => {
        const live = row([binding('a', 1), binding('b', 2)]);
        const draft = row([binding('b', 3, 'a')]);
        state().prefillBindingDependentState(
            'materialization',
            live.spec.bindings,
            draft.spec.bindings
        );
        const uuid = uuidFor('b');
        state().setBackfilledBindings('reset', choice ? 'true' : 'false', uuid);
        state().setRelatedBindingIndices(draft, live);
        expect(state().backfilledBindings.includes(uuid)).toBe(choice);
        expect(state().resourceConfigs[uuid].meta.backfillOverride).toBe(
            choice
        );
    }
);

test('regeneration transfers both explicit choices and the selected sibling, removes dead UUIDs, and restarts field validation', () => {
    const bindings = [binding('a'), binding('b')];
    state().prefillBindingDependentState('materialization', bindings, bindings);
    const oldA = uuidFor('a');
    const oldB = uuidFor('b');
    state().setBackfilledBindings('reset', 'true', oldA);
    state().setBackfilledBindings('reset', 'false', oldB);
    state().setCurrentBinding(oldB);

    state().prefillBindingDependentState(
        'materialization',
        [],
        [bindings[1], bindings[0]],
        true,
        true
    );
    const newA = uuidFor('a');
    const newB = uuidFor('b');
    expect([newA, newB]).not.toContain(oldA);
    expect([newA, newB]).not.toContain(oldB);
    expect(state().backfilledBindings).toEqual([newA]);
    expect(state().resourceConfigs[newB].meta.backfillOverride).toBe(false);
    expect(state().currentBinding?.uuid).toBe(newB);
    expect(state().selections[newB]).toMatchObject({
        status: 'SERVER_UPDATING',
        validationFailed: false,
        hydrating: true,
    });
    expect(state().resourceConfigs[newB].meta.bindingIndex).toBe(0);
});

test('ambiguous regenerated resources do not copy one previous backfill choice into two bindings', () => {
    const a = binding('a');
    state().prefillBindingDependentState('materialization', [a], [a]);
    state().setBackfilledBindings('reset', 'true', uuidFor('a'));
    state().prefillBindingDependentState('materialization', [], [a, a], true);
    expect(state().backfilledBindings).toEqual([]);
    expect(
        Object.values(state().resourceConfigs).every(
            ({ meta }) => meta.backfillOverride === undefined
        )
    ).toBe(true);
});

test('missing and disabled results clear every derived index', () => {
    const task = row([binding('a')]);
    state().prefillBindingDependentState(
        'materialization',
        task.spec.bindings,
        task.spec.bindings
    );
    const uuid = uuidFor('a');
    state().setRelatedBindingIndices(task, task);
    const resolvedConfigs = state().resourceConfigs;
    state().setRelatedBindingIndices(task, task);
    expect(state().resourceConfigs).toBe(resolvedConfigs);
    expect(state().resourceConfigs[uuid].meta).toMatchObject({
        builtBindingIndex: 0,
        validatedBindingIndex: 0,
        liveBindingIndex: 0,
        liveBuiltBindingIndex: 0,
    });
    state().setRelatedBindingIndices(undefined, task);
    expect(state().resourceConfigs[uuid].meta).toMatchObject({
        builtBindingIndex: -1,
        validatedBindingIndex: -1,
        liveBindingIndex: -1,
        liveBuiltBindingIndex: -1,
    });
    state().setRelatedBindingIndices(task, task);
    state().toggleDisable([{ bindingUUID: uuid, bindingIndex: 0, val: true }]);
    state().setRelatedBindingIndices(task, task);
    expect(state().resourceConfigs[uuid].meta).toMatchObject({
        builtBindingIndex: -1,
        validatedBindingIndex: -1,
        liveBindingIndex: -1,
        liveBuiltBindingIndex: -1,
    });
});

test('resource edits keep the submitted binding until regeneration establishes the new resource', () => {
    const live = row([binding('a', 4), binding('b', 9)]);
    const draft = row(
        live.spec.bindings.map((item) => ({
            ...item,
            resource: { table: item.resource.table },
        }))
    );
    state().prefillBindingDependentState(
        'materialization',
        live.spec.bindings,
        draft.spec.bindings
    );
    const uuid = uuidFor('b');
    state().setRelatedBindingIndices(draft, live);
    state().updateResourceConfig(collection, uuid, {
        data: { table: 'renamed' },
        errors: [],
    });
    state().setRelatedBindingIndices(draft, live);
    expect(state().resourceConfigs[uuid].meta).toMatchObject({
        draftedResource: { table: 'b' },
        builtBindingIndex: 1,
        liveBindingIndex: 1,
        validatedBindingIndex: 1,
    });
    state().setBackfilledBindings('reset', 'true', uuid);
    const generate = renderHook(() => useGenerateDraftSpec('materialization'))
        .result.current;
    const regenerated = generate(
        { spec: draft.spec as any, expect_pub_id: 'pub' },
        { image: 'materialize-test:dev', config: {} },
        state().resourceConfigs,
        state().bindings
    ).spec as Schema;
    state().prefillBindingDependentState(
        'materialization',
        [],
        regenerated.bindings,
        true
    );
    const renamed = uuidFor('renamed');
    expect(state().resourceConfigs[renamed].meta.draftedResource).toEqual({
        table: 'renamed',
    });
    state().setRelatedBindingIndices(row(regenerated.bindings), live);
    expect(state().resourceConfigs[renamed].meta).toMatchObject({
        builtBindingIndex: 1,
        liveBindingIndex: -1,
        validatedBindingIndex: 1,
        backfillOverride: true,
    });
    expect(state().backfilledBindings).toContain(renamed);
    expect(regenerated.bindings[0]).toEqual(draft.spec.bindings[0]);
});

test('reload reconstructs backfill from persisted counters and resource identity', () => {
    const live = [binding('a', 4), binding('b', 9)];
    const saved = [binding('b', 9), binding('a', 5)];
    state().prefillBindingDependentState('materialization', live, saved);
    const oldA = uuidFor('a');
    state().setBackfilledBindings('reset', 'false', oldA);
    state().resetState(false, true);
    state().prefillBindingDependentState('materialization', live, saved);
    expect(state().backfilledBindings).toEqual([uuidFor('a')]);
    expect(
        state().resourceConfigs[uuidFor('a')].meta.backfillOverride
    ).toBeUndefined();
    expect(state().selections[uuidFor('b')].groupBy.liveGroupByKey).toEqual([
        'b',
    ]);
});

test('rediscovery preserves backfill per resource when bindings share a collection', () => {
    const a = { ...binding('a'), target: collection };
    const b = { ...binding('b'), target: collection };
    state().evaluateDiscoveredBindings([a, b]);
    state().setBackfilledBindings('reset', 'true', uuidFor('b'));
    state().evaluateDiscoveredBindings([b, a]);
    expect(state().backfilledBindings).toEqual([uuidFor('b')]);
    expect(
        state().resourceConfigs[uuidFor('a')].meta.backfillOverride
    ).toBeUndefined();
});

test('generation preserves each authored binding and removes only the selected sibling', () => {
    const bindings = [binding('a', 4), binding('b', 9)];
    state().prefillBindingDependentState('materialization', bindings, bindings);
    const generate = renderHook(() => useGenerateDraftSpec('materialization'))
        .result.current;
    const generateCurrent = () =>
        generate(
            { spec: { bindings } as any, expect_pub_id: 'pub' },
            { image: 'materialize-test:dev', config: {} },
            state().resourceConfigs,
            state().bindings
        ).spec as Schema;
    expect(generateCurrent().bindings).toEqual(bindings);
    const configA = state().resourceConfigs[uuidFor('a')];
    state().updateResourceConfig(collection, uuidFor('a'), {
        data: { ...configA.data, table: 'renamed' },
        errors: [],
    });
    expect(generateCurrent().bindings[0]).toEqual({
        ...bindings[0],
        resource: { ...bindings[0].resource, table: 'renamed' },
    });
    state().updateResourceConfig(collection, uuidFor('renamed'), {
        data: configA.data,
        errors: [],
    });
    state().removeBinding({ uuid: uuidFor('a'), collection });
    expect(generateCurrent().bindings).toEqual([bindings[1]]);

    const newUUID = 'new-binding';
    const b = state().resourceConfigs[uuidFor('b')];
    useBindingStore.setState({
        bindings: { [collection]: [uuidFor('b'), newUUID] },
        resourceConfigs: {
            ...state().resourceConfigs,
            [newUUID]: {
                ...b,
                data: { table: 'new' },
                meta: { ...b.meta, added: true },
            },
        },
    });
    expect(generateCurrent().bindings[0]).toEqual(bindings[1]);
    expect(generateCurrent().bindings[1]).toEqual({
        source: collection,
        resource: { table: 'new' },
    });
});

test('generation rejects a stale authored index within the same collection', () => {
    const bindings = [binding('a', 4), binding('b', 9)];
    state().prefillBindingDependentState('materialization', bindings, bindings);
    const a = state().resourceConfigs[uuidFor('a')];
    const generate = renderHook(() => useGenerateDraftSpec('materialization'))
        .result.current;
    expect(() =>
        generate(
            { spec: { bindings } as any, expect_pub_id: 'pub' },
            { image: 'materialize-test:dev', config: {} },
            { only: { ...a, meta: { ...a.meta, bindingIndex: 1 } } },
            { [collection]: ['only'] }
        )
    ).toThrow('Refresh the editor before saving');
});

test('collection prefill preserves existing authored indices after repeated collections', () => {
    const bindings = [
        binding('a'),
        binding('b'),
        { ...binding('c'), source: 'acme/other' },
    ];
    state().prefillBindingDependentState('materialization', bindings, bindings);
    state().addEmptyBindings(null);
    expect(state().resourceConfigs[uuidFor('b')].meta.bindingIndex).toBe(1);
    expect(state().resourceConfigs[uuidFor('c')].meta.bindingIndex).toBe(2);
});

test('capture hydration defaults backfill mode once and preserves an incremental choice after saving', () => {
    const live = {
        target: collection,
        resource: { table: 'a', _meta: { path: ['a'] } },
        backfill: 2,
    };
    const saved = { ...live, backfill: 3 };
    state().prefillBindingDependentState('capture', [live], [saved]);
    expect(state().backfilledBindings).toEqual([uuidFor('a')]);
    expect(state().backfillMode).toBe('reset');

    state().setBackfillMode('incremental');
    state().prefillBindingDependentState('capture', [], [saved], true);
    expect(state().backfilledBindings).toEqual([uuidFor('a')]);
    expect(state().backfillMode).toBe('incremental');
});
