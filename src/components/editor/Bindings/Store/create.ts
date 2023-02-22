import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { CollectionData } from 'components/editor/Bindings/types';
import produce from 'immer';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { CallSupabaseResponse } from 'services/supabase';
import { BindingsEditorStoreNames } from 'stores/names';
import { Annotations } from 'types/jsonforms';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const processDraftSpecResponse = (
    draftSpecResponse: CallSupabaseResponse<any>,
    setOpen: Dispatch<SetStateAction<boolean>>,
    get: StoreApi<BindingsEditorState>['getState']
) => {
    const {
        inferredSchemaApplicationErrored,
        setCollectionData,
        setInferredSchemaApplicationErrored,
    } = get();

    if (draftSpecResponse.error) {
        setInferredSchemaApplicationErrored(true);
    } else if (draftSpecResponse.data && draftSpecResponse.data.length > 0) {
        if (inferredSchemaApplicationErrored) {
            setInferredSchemaApplicationErrored(false);
        }

        setCollectionData({
            spec: draftSpecResponse.data[0].spec,
            belongsToDraft: true,
        });

        setOpen(false);
    } else {
        setInferredSchemaApplicationErrored(true);
    }
};

const evaluateCollectionData = async (
    draftId: string | null,
    catalogName: string
): Promise<CollectionData | null> => {
    let draftSpecResponse = null;

    if (draftId) {
        draftSpecResponse = await getDraftSpecsByCatalogName(
            draftId,
            catalogName,
            'collection'
        );
    }

    if (draftSpecResponse && !isEmpty(draftSpecResponse.data)) {
        return { spec: draftSpecResponse.data[0].spec, belongsToDraft: true };
    } else {
        const liveSpecResponse = await getLiveSpecsByCatalogName(
            catalogName,
            'collection'
        );

        return isEmpty(liveSpecResponse.data)
            ? null
            : { spec: liveSpecResponse.data[0].spec, belongsToDraft: false };
    }
};

const getInitialStateData = (): Pick<
    BindingsEditorState,
    | 'collectionData'
    | 'documentsRead'
    | 'inferredSchemaApplicationErrored'
    | 'inferredSpec'
    | 'loadingInferredSchema'
    | 'schemaInferenceDisabled'
    | 'schemaUpdateErrored'
    | 'schemaUpdated'
> => ({
    collectionData: null,
    documentsRead: null,
    inferredSchemaApplicationErrored: false,
    inferredSpec: null,
    loadingInferredSchema: false,
    schemaInferenceDisabled: false,
    schemaUpdateErrored: false,
    schemaUpdated: true,
});

const getInitialState = (
    set: NamedSet<BindingsEditorState>,
    get: StoreApi<BindingsEditorState>['getState']
): BindingsEditorState => ({
    ...getInitialStateData(),

    initializeCollectionData: (currentCollection, persistedDraftId) => {
        const { setCollectionData, setSchemaInferenceDisabled } = get();

        if (currentCollection) {
            evaluateCollectionData(persistedDraftId, currentCollection).then(
                (response) => {
                    setCollectionData(response);

                    if (response) {
                        const writeSchemaKey = response.spec.hasOwnProperty(
                            'writeSchema'
                        )
                            ? 'writeSchema'
                            : 'schema';

                        const inferenceAnnotationValue =
                            !response.spec[writeSchemaKey][
                                Annotations.inferSchema
                            ];

                        setSchemaInferenceDisabled(inferenceAnnotationValue);
                    } else {
                        setSchemaInferenceDisabled(false);
                    }
                },
                () => {
                    setCollectionData(undefined);
                    setSchemaInferenceDisabled(false);
                }
            );
        } else {
            setCollectionData(null);
        }
    },

    setCollectionData: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.collectionData = value;
            }),
            false,
            'Collection Data Set'
        );
    },

    setSchemaInferenceDisabled: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.schemaInferenceDisabled = value;
            }),
            false,
            'Schema Inference Disabled Set'
        );
    },

    setLoadingInferredSchema: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.loadingInferredSchema = value;
            }),
            false,
            'Loading Inferred Schema Set'
        );
    },

    setInferredSpec: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.inferredSpec = value;
            }),
            false,
            'Inferred Schema Set'
        );
    },

    setDocumentsRead: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.documentsRead = value;
            }),
            false,
            'Documents Read Set'
        );
    },

    setInferredSchemaApplicationErrored: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.inferredSchemaApplicationErrored = value;
            }),
            false,
            'Inferred Schema Application Errored Set'
        );
    },

    applyInferredSchema: async (
        currentCollection,
        persistedDraftId,
        setOpen
    ) => {
        const {
            collectionData,
            inferredSpec,
            setInferredSchemaApplicationErrored,
            setLoadingInferredSchema,
        } = get();

        if (
            currentCollection &&
            persistedDraftId &&
            inferredSpec &&
            collectionData
        ) {
            setInferredSchemaApplicationErrored(false);
            setLoadingInferredSchema(true);

            if (collectionData.belongsToDraft) {
                const draftSpecResponse = await modifyDraftSpec(inferredSpec, {
                    draft_id: persistedDraftId,
                    catalog_name: currentCollection,
                });

                processDraftSpecResponse(draftSpecResponse, setOpen, get);
            } else {
                const liveSpecsResponse = await getLiveSpecsByCatalogName(
                    currentCollection,
                    'collection'
                );

                if (liveSpecsResponse.error) {
                    setInferredSchemaApplicationErrored(true);
                } else if (liveSpecsResponse.data) {
                    const { last_pub_id } = liveSpecsResponse.data[0];

                    const draftSpecResponse = await createDraftSpec(
                        persistedDraftId,
                        currentCollection,
                        inferredSpec,
                        'collection',
                        last_pub_id
                    );

                    processDraftSpecResponse(draftSpecResponse, setOpen, get);
                }
            }

            setLoadingInferredSchema(false);
        } else {
            setInferredSchemaApplicationErrored(true);
        }
    },

    setSchemaUpdateErrored: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.schemaUpdateErrored = value;
            }),
            false,
            'Schema Update Errored Set'
        );
    },

    setSchemaUpdated: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.schemaUpdated = value;
            }),
            false,
            'Schema Updated Set'
        );
    },

    // TODO (optimization): Equip stores with the proper tools to clean up after themselves; this includes managing the promises they create.
    updateSchema: (currentCollection, persistedDraftId) => {
        const {
            collectionData,
            schemaUpdateErrored,
            setSchemaUpdateErrored,
            setSchemaUpdated,
            setCollectionData,
        } = get();

        if (currentCollection && collectionData) {
            setSchemaUpdated(false);

            return evaluateCollectionData(
                persistedDraftId,
                currentCollection
            ).then(
                (response) => {
                    if (schemaUpdateErrored) {
                        setSchemaUpdateErrored(false);
                    }

                    setCollectionData(response);

                    setSchemaUpdated(true);
                },
                () => {
                    setSchemaUpdateErrored(true);
                    setSchemaUpdated(true);
                }
            );
        } else {
            return null;
        }
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Bindings Editor State Reset');
    },
});

export const createBindingsEditorStore = (key: BindingsEditorStoreNames) =>
    create<BindingsEditorState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
