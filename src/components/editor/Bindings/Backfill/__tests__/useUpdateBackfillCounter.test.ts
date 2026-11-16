import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { ResourceConfig } from 'src/stores/Binding/types';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import useUpdateBackfillCounter from 'src/components/editor/Bindings/Backfill/useUpdateBackfillCounter';
import {
    useBinding_backfilledBindings,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('src/api/draftSpecs', () => ({ modifyDraftSpec: vi.fn() }));
vi.mock('src/components/editor/Store/hooks', () => ({
    useEditorStore_persistedDraftId: () => 'draft-id',
    useEditorStore_queryResponse_mutate: () => mutate,
}));
vi.mock('src/context/EntityContext', () => ({
    useEntityType: () => 'materialization',
}));
vi.mock('src/stores/Binding/hooks', () => ({
    useBinding_backfilledBindings: vi.fn(),
    useBinding_resourceConfigs: vi.fn(),
}));

const collection = 'acme/events';
const resourceConfig = (
    topic: string,
    bindingIndex: number
): ResourceConfig => ({
    data: { topic_name: topic, _meta: { path: [topic] } },
    meta: {
        collectionName: collection,
        bindingIndex,
        builtBindingIndex: -1,
        validatedBindingIndex: -1,
        liveBindingIndex: -1,
        liveBuiltBindingIndex: -1,
    },
});

const draft = (): DraftSpecQuery => ({
    draft_id: 'draft-id',
    catalog_name: 'acme/destination',
    expect_pub_id: 'pub-id',
    spec_type: 'materialization',
    built_spec: null,
    validated: null,
    spec: {
        endpoint: { dekaf: { variant: 'generic' } },
        bindings: [
            {
                source: collection,
                resource: resourceConfig('one', 0).data,
                fields: { groupBy: ['id'], require: { one: {} } },
                backfill: 2,
            },
            {
                source: collection,
                resource: resourceConfig('two', 1).data,
                fields: { exclude: ['two'] },
                backfill: 7,
            },
            {
                source: 'acme/unrelated',
                resource: { table: 'other' },
                backfill: 10,
            },
        ],
    },
});

describe('useUpdateBackfillCounter', () => {
    beforeEach(() => {
        vi.mocked(modifyDraftSpec).mockReset();
        vi.mocked(modifyDraftSpec).mockResolvedValue({ error: null } as never);
        mutate.mockReset();
        mutate.mockResolvedValue({});
        vi.mocked(useBinding_backfilledBindings).mockReturnValue([]);
        // UI order differs from the authored order, including same-collection siblings.
        vi.mocked(useBinding_resourceConfigs).mockReturnValue({
            two: resourceConfig('two', 1),
            one: resourceConfig('one', 0),
        });
    });

    test.each([
        ['true', [2, 8, 10]],
        ['false', [1, 7, 10]],
    ] as const)(
        'bulk %s updates only bindings whose choice changed',
        async (increment, counters) => {
            vi.mocked(useBinding_backfilledBindings).mockReturnValue(['one']);
            const row = draft();
            const before = structuredClone(row);
            const { result } = renderHook(() => useUpdateBackfillCounter());

            await result.current.updateBackfillCounter(row, increment, []);

            const written = vi.mocked(modifyDraftSpec).mock.calls[0][0];
            expect(
                written.bindings.map(
                    (binding: { backfill: number }) => binding.backfill
                )
            ).toEqual(counters);
            expect(written.bindings[0].fields).toEqual(
                row.spec.bindings[0].fields
            );
            expect(written.bindings[1].fields).toEqual(
                row.spec.bindings[1].fields
            );
            expect(written.bindings[2]).toEqual(row.spec.bindings[2]);
            expect(row).toEqual(before);
            expect(mutate).toHaveBeenCalledOnce();
        }
    );

    test('bulk increment preserves each counter and the existing summary', async () => {
        const { result } = renderHook(() => useUpdateBackfillCounter());

        await expect(
            result.current.updateBackfillCounter(draft(), 'true', [])
        ).resolves.toEqual({
            counterIncremented: [collection, collection],
            counterDecremented: [],
        });

        const written = vi.mocked(modifyDraftSpec).mock.calls[0][0];
        expect(
            written.bindings.map(
                (binding: { backfill: number }) => binding.backfill
            )
        ).toEqual([3, 8, 10]);
    });

    test('a single binding update leaves its sibling unchanged without requiring a build', async () => {
        const row = draft();
        const { result } = renderHook(() => useUpdateBackfillCounter());

        await result.current.updateBackfillCounter(row, 'true', [
            { collection, bindingIndex: 1 },
        ]);

        const written = vi.mocked(modifyDraftSpec).mock.calls[0][0];
        expect(written.bindings[0]).toEqual(row.spec.bindings[0]);
        expect(written.bindings[1]).toEqual({
            ...row.spec.bindings[1],
            backfill: 8,
        });
        expect(written.bindings[2]).toEqual(row.spec.bindings[2]);
    });

    test.each(['ambiguous', 'reordered', 'edited'] as const)(
        '%s correspondence rejects the whole bulk write',
        async (failure) => {
            const row = draft();
            if (failure === 'ambiguous') {
                row.spec.bindings.push(structuredClone(row.spec.bindings[0]));
            } else if (failure === 'reordered') {
                [row.spec.bindings[0], row.spec.bindings[1]] = [
                    row.spec.bindings[1],
                    row.spec.bindings[0],
                ];
            } else {
                row.spec.bindings[0].resource.topic_name = 'renamed';
            }
            const before = structuredClone(row);
            const { result } = renderHook(() => useUpdateBackfillCounter());

            await expect(
                result.current.updateBackfillCounter(row, 'true', [])
            ).rejects.toMatchObject({
                message:
                    'There was an issue updating the backfill counter for one or more bindings.',
            });

            expect(modifyDraftSpec).not.toHaveBeenCalled();
            expect(mutate).not.toHaveBeenCalled();
            expect(row).toEqual(before);
        }
    );

    test('an unresolved single binding cannot write through its old index', async () => {
        const row = draft();
        row.spec.bindings[1].resource.topic_name = 'renamed';
        const { result } = renderHook(() => useUpdateBackfillCounter());

        await expect(
            result.current.updateBackfillCounter(row, 'true', [
                { collection, bindingIndex: 1 },
            ])
        ).rejects.toMatchObject({
            message: expect.stringContaining(collection),
        });
        expect(modifyDraftSpec).not.toHaveBeenCalled();
    });
});
