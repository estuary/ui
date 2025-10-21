import type { BindingsEditorState } from 'src/components/editor/Bindings/Store/types';
import type { CollectionData } from 'src/components/editor/Bindings/types';
import type { SkimProjectionsResponse } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { skim_collection_projections } from '@estuary/flow-web';
import produce from 'immer';
import { intersection, isEmpty, isPlainObject, union } from 'lodash';

import { getDraftSpecsByCatalogName } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'src/api/liveSpecsExt';
import { BindingsEditorStoreNames } from 'src/stores/names';
import { hasLength } from 'src/utils/misc-utils';
import {
    filterInferSchemaResponse,
    hasReadAndWriteSchema,
} from 'src/utils/schema-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

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
const evaluateInferSchemaResponse = (
    dataVal: SkimProjectionsResponse | null
) => {
    let errors: string[] = [];
    let updatedVal: BuiltProjection[] | null, validKeys: string[];

    const hasResponse = dataVal;
    if (hasResponse) {
        // Need list of fields and keys to be populated by the data
        const filteredKeys: string[][] = [];
        const filteredFields: any[] = [];

        // Go through all the data and grab the filtered values
        //  and put them into the lists
        const response = filterInferSchemaResponse(dataVal);
        filteredKeys.push(response.validKeys);
        filteredFields.push(response.fields);
        errors = union(dataVal.errors);

        // Find the keys that are valid in BOTH read/write schema
        validKeys = intersection(...filteredKeys);

        // Put the read/write output together so all keys are rendered
        updatedVal = union(...filteredFields);
    } else {
        errors = [];
        updatedVal = null;
        validKeys = [];
    }

    return {
        errors,
        hasResponse,
        updatedVal,
        validKeys,
    };
};

const getInitialMiscData = (): Pick<
    BindingsEditorState,
    | 'collectionData'
    | 'collectionInitializationAlert'
    | 'collectionInitializationDone'
    | 'schemaUpdateErrored'
    | 'schemaUpdated'
    | 'schemaUpdating'
    | 'editModeEnabled'
    | 'inferSchemaResponse'
    | 'inferSchemaResponseError'
    | 'inferSchemaResponseDoneProcessing'
    | 'inferSchemaResponseProcessingUpdate'
    | 'inferSchemaResponseEmpty'
    | 'inferSchemaResponse_Keys'
    | 'incompatibleCollections'
    | 'hasIncompatibleCollections'
    | 'hasReadAndWriteSchema'
    | 'schemaScope'
> => ({
    collectionData: null,
    collectionInitializationAlert: null,
    collectionInitializationDone: false,
    schemaUpdateErrored: false,
    schemaUpdated: true,
    schemaUpdating: false,
    editModeEnabled: false,
    inferSchemaResponse: null,
    inferSchemaResponse_Keys: [],
    inferSchemaResponseError: null,
    inferSchemaResponseDoneProcessing: false,
    inferSchemaResponseProcessingUpdate: false,
    inferSchemaResponseEmpty: false,
    incompatibleCollections: [],
    hasIncompatibleCollections: false,
    hasReadAndWriteSchema: null,
    schemaScope: 'schema',
});

const getInitialStateData = () => ({
    ...getInitialMiscData(),
});

const getInitialState = (
    set: NamedSet<BindingsEditorState>,
    get: StoreApi<BindingsEditorState>['getState']
): BindingsEditorState => ({
    ...getInitialStateData(),

    setEditModeEnabled: (value) => {
        set(
            (state) => ({ ...state, editModeEnabled: value }),
            false,
            'Edit Mode Enabled Set'
        );
    },

    setSchemaScope: (value) => {
        set(
            (state) => ({ ...state, schemaScope: value }),
            false,
            'Schema Scope Set'
        );
    },

    setCollectionData: (value) => {
        set(
            (state) => ({ ...state, collectionData: value }),
            false,
            'Collection Data Set'
        );
    },

    setCollectionInitializationAlert: (value) => {
        set(
            (state) => ({ ...state, collectionInitializationAlert: value }),
            false,
            'Collection Initialization Alert Set'
        );
    },

    setCollectionInitializationDone: (value) => {
        set(
            (state) => ({ ...state, collectionInitializationDone: value }),
            false,
            'Collection Initialization Done Set'
        );
    },

    setIncompatibleCollections: (value) => {
        set(
            (state) => ({
                ...state,
                incompatibleCollections: value,
                hasIncompatibleCollections: hasLength(value),
            }),
            false,
            'Incompatible Collections List Set'
        );
    },

    setSchemaUpdateErrored: (value) => {
        set(
            (state) => ({ ...state, schemaUpdateErrored: value }),
            false,
            'Schema Update Errored Set'
        );
    },

    setSchemaUpdated: (value) => {
        set(
            (state) => ({ ...state, schemaUpdated: value }),
            false,
            'Schema Updated Set'
        );
    },

    setSchemaUpdating: (value) => {
        set(
            (state) => ({ ...state, schemaUpdating: value }),
            false,
            'Schema Updating Set'
        );
    },

    // TODO (optimization): Equip stores with the proper tools to clean up after themselves; this includes managing the promises they create.
    updateSchema: (currentCollection, persistedDraftId) => {
        if (currentCollection && get().collectionData) {
            get().setSchemaUpdated(false);
            get().setSchemaUpdating(true);

            return evaluateCollectionData(
                persistedDraftId,
                currentCollection
            ).then(
                (response) => {
                    if (get().schemaUpdateErrored) {
                        get().setSchemaUpdateErrored(false);
                    }

                    get().setCollectionData(response);

                    get().setSchemaUpdated(true);
                    get().setSchemaUpdating(false);
                },
                () => {
                    get().setSchemaUpdateErrored(true);
                    get().setSchemaUpdated(true);
                    get().setSchemaUpdating(false);
                }
            );
        } else {
            return null;
        }
    },

    populateInferSchemaResponse: async (spec, entityName, projections) => {
        const populateState = (
            dataVal: SkimProjectionsResponse | null,
            errorVal: BindingsEditorState['inferSchemaResponseError']
        ) => {
            const { hasResponse, updatedVal, validKeys, errors } =
                evaluateInferSchemaResponse(dataVal);

            // Save the values into the store
            set(
                produce((state: BindingsEditorState) => {
                    state.inferSchemaResponseError = errorVal ?? errors;
                    state.inferSchemaResponse = updatedVal;
                    state.inferSchemaResponseEmpty = !hasResponse;
                    state.inferSchemaResponse_Keys = validKeys;
                    state.inferSchemaResponseDoneProcessing = true;
                    state.inferSchemaResponseProcessingUpdate = false;
                }),
                false,
                'Inferred Schema Populated'
            );
        };

        set(
            produce((state: BindingsEditorState) => {
                if (state.inferSchemaResponseDoneProcessing) {
                    state.inferSchemaResponseProcessingUpdate = true;
                } else {
                    state.inferSchemaResponseDoneProcessing = false;
                }
            }),
            false,
            'Resetting inferSchemaDoneProcessing flag'
        );

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!spec) {
            return;
        }

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!spec.schema && !spec.writeSchema && !spec.writeSchema) {
            return;
        }

        // Check which schema to use
        const usingReadAndWriteSchema = hasReadAndWriteSchema(spec);

        set(
            produce((state: BindingsEditorState) => {
                state.hasReadAndWriteSchema = usingReadAndWriteSchema;
            }),
            false,
            'Setting hasReadAndWriteSchema flag'
        );

        // TODO (infer - typing)
        const modelSchemaSettings: any = {};
        if (usingReadAndWriteSchema) {
            if (
                isPlainObject(spec.readSchema) &&
                isPlainObject(spec.writeSchema)
            ) {
                modelSchemaSettings.readSchema = spec.readSchema;
                modelSchemaSettings.writeSchema = spec.writeSchema;
            } else {
                populateState(null, [
                    'read and write schemas must be an object',
                ]);
                return;
            }
        } else {
            if (isPlainObject(spec.schema)) {
                modelSchemaSettings.schema = spec.schema;
            } else {
                populateState(null, ['schema must be an object']);
                return;
            }
        }

        try {
            const skimProjectionResponse: SkimProjectionsResponse =
                await skim_collection_projections({
                    collection: entityName,
                    model: {
                        ...modelSchemaSettings,
                        projections,
                        key: spec.key,
                    },
                });

            let allResponsesValid = true;

            // Make sure there is a response
            if (skimProjectionResponse.projections?.length === 0) {
                populateState(null, ['no fields inferred from schema']);
                allResponsesValid = false;
            }

            // Make sure we did not ONLY get the root object back as a pointer
            if (
                skimProjectionResponse.projections.length === 1 &&
                skimProjectionResponse.projections[0].ptr === ''
            ) {
                populateState(null, ['no usable fields inferred from schema']);
                allResponsesValid = false;
            }

            if (!allResponsesValid) {
                // This just returns because we already populated the state
                //  in the above loop
                return;
            }

            populateState(skimProjectionResponse, null);
        } catch (err: unknown) {
            populateState(null, [err as string]);
        }
    },

    resetState: (skipFullSource) => {
        set(
            skipFullSource ? getInitialMiscData() : getInitialStateData(),
            false,
            'Bindings Editor State Reset'
        );
    },
});

export const useBindingsEditorStore = create<BindingsEditorState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingsEditorStoreNames.GENERAL)
    )
);
