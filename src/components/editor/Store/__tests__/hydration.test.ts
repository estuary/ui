import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { LiveSpecsExtQueryWithSpec } from 'src/hooks/useLiveSpecsExt';
import type { BindingState } from 'src/stores/Binding/types';

import { renderHook } from '@testing-library/react';

import { useHydrateEditorState } from 'src/components/editor/Store/hooks';
import { useDraftSpecs_forEditor } from 'src/hooks/useDraftSpecs';
import { useEditorLiveSpec } from 'src/hooks/useLiveSpecsExt';
import { generateMockResourceConfig } from 'src/test/test-utils';

const {
    bindingState,
    editorState,
    hydrateCollections,
    setRelatedBindingIndices,
} = vi.hoisted(() => ({
    bindingState: { resourceConfigs: {} as BindingState['resourceConfigs'] },
    editorState: {
        id: 'draft',
        persistedDraftId: 'draft',
        setQueryResponse: vi.fn(),
    },
    hydrateCollections: vi.fn(),
    setRelatedBindingIndices: vi.fn(),
}));

vi.mock('src/context/EntityContext', () => ({
    useEntityType: () => 'materialization',
}));
vi.mock('src/context/Zustand/provider', () => ({
    useZustandStore: (
        _name: string,
        selector: (state: typeof editorState) => unknown
    ) => selector(editorState),
}));
vi.mock('src/context/LocalZustand', () => ({
    useLocalZustandStore: (
        _name: string,
        selector: (state: typeof editorState) => unknown
    ) => selector(editorState),
}));
vi.mock('src/hooks/searchParams/useGlobalSearchParams', () => ({
    default: () => null,
    GlobalSearchParams: { DRAFT_ID: 'draftId' },
}));
vi.mock('src/hooks/useDraftSpecs', () => ({
    useDraftSpecs_forEditor: vi.fn(),
}));
vi.mock('src/hooks/useLiveSpecsExt', () => ({
    useEditorLiveSpec: vi.fn(),
}));
vi.mock('src/stores/Binding/Store', () => ({
    useBindingStore: (
        selector: (
            state: Pick<
                BindingState,
                'resourceConfigs' | 'setRelatedBindingIndices'
            >
        ) => unknown
    ) => selector({ ...bindingState, setRelatedBindingIndices }),
}));
vi.mock('src/stores/Workflow/slices/useCollectionsHydrator', () => ({
    default: () => hydrateCollections,
}));

const draft: DraftSpecQuery = {
    catalog_name: 'acme/task',
    spec_type: 'materialization',
    draft_id: 'draft',
    expect_pub_id: 'publication',
    spec: { bindings: [] },
    built_spec: { bindings: [] },
    validated: { bindings: [] },
};
const live: LiveSpecsExtQueryWithSpec = {
    id: 'live',
    catalog_name: draft.catalog_name,
    spec_type: draft.spec_type,
    last_pub_id: draft.expect_pub_id,
    detail: '',
    reads_from: [],
    writes_to: [],
    spec: { bindings: [] },
    built_spec: { bindings: [] },
};

const draftResponse = {
    draftSpecs: [draft],
    isValidating: false,
    error: undefined,
    mutate: vi.fn(),
};

describe('editor binding correspondence hydration', () => {
    beforeEach(() => {
        bindingState.resourceConfigs = {};
        vi.mocked(useDraftSpecs_forEditor).mockReturnValue(draftResponse);
        vi.mocked(useEditorLiveSpec).mockReturnValue(live);
    });

    test('recomputes when bindings arrive after the row without rehydrating collections', () => {
        const { rerender } = renderHook(() =>
            useHydrateEditorState('materialization', draft.catalog_name)
        );
        expect(setRelatedBindingIndices).toHaveBeenCalledTimes(1);

        bindingState.resourceConfigs = {
            binding: generateMockResourceConfig('acme/collection', 0),
        };
        rerender();

        expect(setRelatedBindingIndices).toHaveBeenCalledTimes(2);
        expect(setRelatedBindingIndices).toHaveBeenLastCalledWith(draft, live);
        expect(hydrateCollections).toHaveBeenCalledTimes(1);
        expect(editorState.setQueryResponse).toHaveBeenCalledTimes(1);

        rerender();
        expect(setRelatedBindingIndices).toHaveBeenCalledTimes(2);
    });

    test('recomputes from the complete draft and live rows, including removed results', () => {
        const { rerender } = renderHook(() =>
            useHydrateEditorState('materialization', draft.catalog_name)
        );

        expect(setRelatedBindingIndices).toHaveBeenLastCalledWith(draft, live);

        const refreshedLive = { ...live, built_spec: null };
        vi.mocked(useEditorLiveSpec).mockReturnValue(refreshedLive);
        rerender();
        expect(setRelatedBindingIndices).toHaveBeenLastCalledWith(
            draft,
            refreshedLive
        );

        vi.mocked(useDraftSpecs_forEditor).mockReturnValue({
            ...draftResponse,
            draftSpecs: [],
        });
        vi.mocked(useEditorLiveSpec).mockReturnValue(undefined);
        rerender();
        expect(setRelatedBindingIndices).toHaveBeenLastCalledWith(
            undefined,
            undefined
        );
    });

    test.each([true, false])(
        'collection hydration leaves task correspondence alone (local scope: %s)',
        (localScope) => {
            renderHook(() =>
                useHydrateEditorState(
                    'collection',
                    'acme/collection',
                    localScope
                )
            );

            expect(setRelatedBindingIndices).not.toHaveBeenCalled();
            expect(editorState.setQueryResponse).toHaveBeenCalledWith(
                draftResponse
            );
            expect(hydrateCollections).toHaveBeenCalledWith(
                draft.draft_id,
                draft.spec
            );
        }
    );
});
