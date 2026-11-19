import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { createEditorStore } from 'src/components/editor/Store/create';
import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import { EntityContextProvider } from 'src/context/EntityContext';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import invariableStores from 'src/context/Zustand/invariableStores';
import { ZustandProvider } from 'src/context/Zustand/provider';
import { useDraftSpecs_forEditor } from 'src/hooks/useDraftSpecs';
import { useBindingStore } from 'src/stores/Binding/Store';
import { EditorStoreNames } from 'src/stores/names';
import { NEW_TASK_PUBLICATION_ID } from 'src/utils/workflow-utils';

vi.mock('src/hooks/useDraftSpecs', () => ({
    useDraftSpecs_forEditor: vi.fn(),
}));

vi.mock('src/stores/Workflow/slices/useCollectionsHydrator', () => {
    const hydrate = vi.fn();
    return { default: () => hydrate };
});

test('opening a draft collection preserves materialization binding indices', () => {
    const taskName = 'acmeCo/export';
    const collectionName = 'acmeCo/orders';
    const resourcePath = ['orders'];
    const builtSpec = {
        bindings: [{ collectionIndex: 1, resourcePath }],
        linkedCollections: [{ name: 'acmeCo/audit' }, { name: collectionName }],
    };
    const draft = { draft_id: 'draft', expect_pub_id: NEW_TASK_PUBLICATION_ID };
    const materialization: DraftSpecQuery = {
        ...draft,
        catalog_name: taskName,
        spec_type: 'materialization',
        spec: { bindings: [{ source: collectionName }] },
        built_spec: builtSpec,
        validated: { bindings: [{ resourcePath }] },
    };
    const collection: DraftSpecQuery = {
        ...draft,
        catalog_name: collectionName,
        spec_type: 'collection',
        spec: { derive: { transforms: [] } },
        built_spec: { derivation: { transforms: [] } },
        validated: { transforms: [] },
    };
    const response = (row: DraftSpecQuery) => ({
        draftSpecs: [row],
        error: undefined,
        isValidating: false,
        mutate: vi.fn(),
    });
    const taskResponse = response(materialization);
    const collectionResponse = response(collection);
    vi.mocked(useDraftSpecs_forEditor).mockImplementation((_id, specType) =>
        specType === 'materialization' ? taskResponse : collectionResponse
    );

    useBindingStore.setState({
        resourceConfigs: {
            orders: {
                data: {},
                meta: {
                    collectionName,
                    bindingIndex: 0,
                    liveBindingIndex: 0,
                    builtBindingIndex: -1,
                    liveBuiltBindingIndex: -1,
                    validatedBindingIndex: -1,
                },
            },
        },
    });
    invariableStores[EditorStoreNames.MATERIALIZATION]
        .getState()
        .setLiveBuiltSpec(builtSpec);
    const collectionStore = createEditorStore(EditorStoreNames.GENERAL);

    const editor = (showCollection: boolean) => (
        <MemoryRouter>
            <ZustandProvider>
                <EntityContextProvider value="materialization">
                    <DraftSpecEditorHydrator
                        entityType="materialization"
                        entityName={taskName}
                    >
                        {showCollection ? (
                            <LocalZustandProvider createStore={collectionStore}>
                                <DraftSpecEditorHydrator
                                    entityType="collection"
                                    entityName={collectionName}
                                    localScope
                                />
                            </LocalZustandProvider>
                        ) : null}
                    </DraftSpecEditorHydrator>
                </EntityContextProvider>
            </ZustandProvider>
        </MemoryRouter>
    );

    const bindingMeta = () =>
        useBindingStore.getState().resourceConfigs.orders.meta;
    const materializationIndices = {
        builtBindingIndex: 0,
        liveBuiltBindingIndex: 0,
        validatedBindingIndex: 0,
    };

    const { rerender } = render(editor(false));
    expect(bindingMeta()).toMatchObject(materializationIndices);
    rerender(editor(true));
    expect(collectionStore.getState().queryResponse.draftSpecs).toEqual([
        collection,
    ]);
    expect(bindingMeta()).toMatchObject(materializationIndices);
});
