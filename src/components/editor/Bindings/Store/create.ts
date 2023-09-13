import { infer } from '@estuary/flow-web';
import {
    createDraftSpec,
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { fetchInferredSchema } from 'api/inferred_schemas';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { CollectionData } from 'components/editor/Bindings/types';
import produce from 'immer';
import { forEach, intersection, isEmpty, isPlainObject, union } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { CallSupabaseResponse } from 'services/supabase';
import { BindingsEditorStoreNames } from 'stores/names';
import {
    InferSchemaPropertyForRender,
    InferSchemaResponse,
    Schema,
} from 'types';
import { hasLength } from 'utils/misc-utils';
import { filterInferSchemaResponse, hasReadSchema } from 'utils/schema-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

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

    if (draftSpecResponse?.data && !isEmpty(draftSpecResponse.data)) {
        return { spec: draftSpecResponse.data[0].spec, belongsToDraft: true };
    } else {
        const liveSpecResponse = await getLiveSpecsByCatalogName(
            catalogName,
            'collection'
        );

        return !liveSpecResponse.data || isEmpty(liveSpecResponse.data)
            ? null
            : { spec: liveSpecResponse.data[0].spec, belongsToDraft: false };
    }
};

// Used to properly populate the inferSchemaResponse related state
const evaluateInferSchemaResponse = (dataVal: InferSchemaResponse[] | null) => {
    let updatedVal: InferSchemaPropertyForRender[] | null, validKeys: string[];

    const hasResponse = dataVal && dataVal.length > 0;
    if (hasResponse) {
        // Need list of fields and keys to be populated by the data
        const filteredKeys: string[][] = [];
        const filteredFields: any[] = [];

        // Go through all the data and grab the filtered values
        //  and put them into the lists
        forEach(dataVal, (val) => {
            const response = filterInferSchemaResponse(val);
            filteredKeys.push(response.validKeys);
            filteredFields.push(response.fields);
        });

        // Find the keys that are valid in BOTH read/write schema
        validKeys = intersection(...filteredKeys);

        // Put the read/write output together so all keys are rendered
        updatedVal = union(...filteredFields);
    } else {
        updatedVal = null;
        validKeys = [];
    }

    return {
        updatedVal,
        validKeys,
        hasResponse,
    };
};

// Call into the flow WASM handler that will inline the write/inferred schema if necessary
const extendReadBundle = async (
    readSchema: Schema,
    writeSchema: Schema,
    entityName: string
) => {
    // Try fetching the inferred schema... possible TODO handle errors better
    const inferredSchemaResponse = await fetchInferredSchema(entityName);
    const inferredSchema = inferredSchemaResponse.data ?? {};

    const response = extend_read_bundle(
        readSchema,
        writeSchema,
        inferredSchema
    );
    console.log('response', response);
    return response;
};

const getInitialStateData = (): Pick<
    BindingsEditorState,
    | 'collectionData'
    | 'collectionInitializationAlert'
    | 'documentsRead'
    | 'inferredSchemaApplicationErrored'
    | 'inferredSpec'
    | 'loadingInferredSchema'
    | 'schemaInferenceDisabled'
    | 'schemaUpdateErrored'
    | 'schemaUpdated'
    | 'editModeEnabled'
    | 'inferSchemaResponse'
    | 'inferSchemaResponseError'
    | 'inferSchemaResponseDoneProcessing'
    | 'inferSchemaResponseEmpty'
    | 'inferSchemaResponse_Keys'
    | 'incompatibleCollections'
    | 'hasIncompatibleCollections'
    | 'recommendFields'
    | 'selections'
    | 'selectionActive'
    | 'selectionSaving'
> => ({
    collectionData: null,
    collectionInitializationAlert: null,
    documentsRead: null,
    inferredSchemaApplicationErrored: false,
    inferredSpec: null,
    loadingInferredSchema: false,
    schemaInferenceDisabled: false,
    schemaUpdateErrored: false,
    schemaUpdated: true,
    editModeEnabled: false,
    inferSchemaResponse: null,
    inferSchemaResponse_Keys: [],
    inferSchemaResponseError: null,
    inferSchemaResponseDoneProcessing: false,
    inferSchemaResponseEmpty: false,
    incompatibleCollections: [],
    hasIncompatibleCollections: false,
    recommendFields: true,
    selections: {},
    selectionActive: false,
    selectionSaving: false,
});

const getInitialState = (
    set: NamedSet<BindingsEditorState>,
    get: StoreApi<BindingsEditorState>['getState']
): BindingsEditorState => ({
    ...getInitialStateData(),

    setEditModeEnabled: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.editModeEnabled = value;
            }),
            false,
            'Edit Mode Enabled Set'
        );
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

    setCollectionInitializationAlert: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.collectionInitializationAlert = value;
            }),
            false,
            'Collection Initialization Alert Set'
        );
    },

    setIncompatibleCollections: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.incompatibleCollections = value;
                state.hasIncompatibleCollections = hasLength(value);
            }),
            false,
            'Incompatible Collections List Set'
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

    setRecommendFields: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.recommendFields = value;
            }),
            false,
            'Recommend Fields Set'
        );
    },

    setSingleSelection: (field, selectionType, initOnly) => {
        set(
            produce((state: BindingsEditorState) => {
                const { selectionActive } = get();

                if (!selectionActive && !initOnly) {
                    state.selectionActive = true;
                }

                state.selections[field] = selectionType;
            }),
            false,
            'Custom Selections Set'
        );
    },

    setSelectionActive: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.selectionActive = value;
            }),
            false,
            'Selection Active Set'
        );
    },

    setSelectionSaving: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.selectionSaving = value;
            }),
            false,
            'Selection Saving Set'
        );
    },

    // TODO (collection editor) maybe
    // This code was initially written supporting being able to
    //  run against `schema` OR [`readSchema`, `writeSchema`].
    // That was removed but might be needed in the future
    //  so we left things running through loops in case we need
    //  to support that again
    populateInferSchemaResponse: async (spec, entityName) => {
        const populateState = (
            dataVal: InferSchemaResponse[] | null,
            errorVal: BindingsEditorState['inferSchemaResponseError']
        ) => {
            const { hasResponse, updatedVal, validKeys } =
                evaluateInferSchemaResponse(dataVal);

            // Save the values into the store
            set(
                produce((state: BindingsEditorState) => {
                    state.inferSchemaResponseError = errorVal;
                    state.inferSchemaResponse = updatedVal;
                    state.inferSchemaResponseDoneProcessing = true;
                    state.inferSchemaResponseEmpty = !hasResponse;
                    state.inferSchemaResponse_Keys = validKeys;
                }),
                false,
                'Infere Schema Populated'
            );
        };

        set(
            produce((state: BindingsEditorState) => {
                state.inferSchemaResponseDoneProcessing = true;
            }),
            false,
            'Resetting inferSchemaDoneProcessing flag'
        );

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!spec) {
            return;
        }

        // Check which schema to use
        const usingReadSchema = hasReadSchema(spec);
        const schemasToTest = usingReadSchema
            ? [spec.readSchema]
            : [spec.schema];

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!hasLength(schemasToTest)) {
            return;
        }

        // Make sure we have an object
        if (!schemasToTest.every((schema) => isPlainObject(schema))) {
            populateState(null, 'schema must be an object');
            return;
        }

        try {
            // Should only impact the read schema
            if (usingReadSchema) {
                schemasToTest[0] = await extendReadBundle(
                    schemasToTest[0],
                    spec.writeSchema,
                    entityName
                );
            }

            // Run infer against schema
            const responses = schemasToTest.map((schema) => infer(schema));

            // Make sure all the responses are valid
            const allResponsesValid = responses.every((inferResponse) => {
                const { properties } = inferResponse;

                // Make sure there is a response
                if (properties?.length === 0) {
                    populateState(null, 'no fields inferred from schema');
                    return false;
                }

                // Make sure we did not ONLY get the root object back as a pointer
                if (properties.length === 1 && properties[0].pointer === '') {
                    populateState(
                        null,
                        'no usable fields inferred from schema'
                    );
                    return false;
                }

                return true;
            });

            if (!allResponsesValid) {
                // This just returns because we already populated the state
                //  in the above loop
                return;
            }

            populateState(responses, null);
        } catch (err: unknown) {
            populateState(null, err as string);
        }
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Bindings Editor State Reset');
    },
});

export const bindingsEditorStore = create<BindingsEditorState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingsEditorStoreNames.GENERAL)
    )
);
