import type { StoreWithCollections } from 'src/stores/Workflow/slices/Collections';

import { createStore } from 'zustand/vanilla';

import {
    generateDefaultCollectionMetadata,
    getStoreWithCollectionSettings,
} from 'src/stores/Workflow/slices/Collections';

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const createTestStore = () =>
    createStore<StoreWithCollections>((set) =>
        getStoreWithCollectionSettings(set as any)
    );

const mockMeta = (belongsToDraft = false) =>
    generateDefaultCollectionMetadata({ spec: null, belongsToDraft });

// ----------------------------------------------------------------------------
// generateDefaultCollectionMetadata
// ----------------------------------------------------------------------------

describe('generateDefaultCollectionMetadata', () => {
    test('provides defaults', () => {
        const meta = generateDefaultCollectionMetadata({});
        expect(meta.spec).toBeNull();
        expect(meta.belongsToDraft).toBe(false);
    });

    test('overrides are applied', () => {
        const meta = generateDefaultCollectionMetadata({
            belongsToDraft: true,
        });
        expect(meta.belongsToDraft).toBe(true);
    });
});

// ----------------------------------------------------------------------------
// initializeCollections — core bug fix: all-disabled bindings scenario
// ----------------------------------------------------------------------------

describe('initializeCollections', () => {
    describe('when passed an empty map', () => {
        test('sets collectionsInited to true', () => {
            const store = createTestStore();
            expect(store.getState().collectionsInited).toBe(false);

            store.getState().initializeCollections(new Map());

            expect(store.getState().collectionsInited).toBe(true);
        });

        test('does not add entries to the collections dict', () => {
            const store = createTestStore();

            store.getState().initializeCollections(new Map());

            expect(store.getState().collections).toEqual({});
        });

        test('preserves existing collections', () => {
            const store = createTestStore();
            const name = 'acmeCo/widgets';

            store
                .getState()
                .initializeCollections(new Map([[name, mockMeta()]]));
            store.getState().initializeCollections(new Map());

            expect(store.getState().collections).toHaveProperty(name);
            expect(store.getState().collectionsInited).toBe(true);
        });
    });

    describe('when passed entries', () => {
        test('sets collectionsInited to true and merges collections', () => {
            const store = createTestStore();
            const name = 'acmeCo/widgets';
            const meta = mockMeta();

            store.getState().initializeCollections(new Map([[name, meta]]));

            expect(store.getState().collectionsInited).toBe(true);
            expect(store.getState().collections[name]).toEqual(meta);
        });

        test('accumulates collections across multiple calls', () => {
            const store = createTestStore();
            const col1 = 'acmeCo/widgets';
            const col2 = 'acmeCo/sprockets';

            store
                .getState()
                .initializeCollections(new Map([[col1, mockMeta()]]));
            store
                .getState()
                .initializeCollections(new Map([[col2, mockMeta(true)]]));

            expect(store.getState().collections).toHaveProperty(col1);
            expect(store.getState().collections).toHaveProperty(col2);
            expect(store.getState().collectionsInited).toBe(true);
        });
    });
});

// ----------------------------------------------------------------------------
// setCollectionsError
// ----------------------------------------------------------------------------

describe('setCollectionsError', () => {
    test('sets collectionsError to true', () => {
        const store = createTestStore();

        store.getState().setCollectionsError(true);

        expect(store.getState().collectionsError).toBe(true);
    });

    test('can be reset to false', () => {
        const store = createTestStore();

        store.getState().setCollectionsError(true);
        store.getState().setCollectionsError(false);

        expect(store.getState().collectionsError).toBe(false);
    });
});

// ----------------------------------------------------------------------------
// upsertCollection
// ----------------------------------------------------------------------------

describe('upsertCollection', () => {
    test('inserts a new collection', () => {
        const store = createTestStore();
        const name = 'acmeCo/widgets';

        store.getState().upsertCollection(name, { belongsToDraft: true });

        expect(store.getState().collections[name].belongsToDraft).toBe(true);
    });

    test('merges into an existing collection without overwriting unrelated fields', () => {
        const store = createTestStore();
        const name = 'acmeCo/widgets';
        const spec = { key: ['/id'] } as any;

        store.getState().upsertCollection(name, { spec });
        store.getState().upsertCollection(name, { belongsToDraft: true });

        expect(store.getState().collections[name].spec).toEqual(spec);
        expect(store.getState().collections[name].belongsToDraft).toBe(true);
    });
});
