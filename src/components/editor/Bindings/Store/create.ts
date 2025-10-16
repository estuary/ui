import type { BindingsEditorState } from 'src/components/editor/Bindings/Store/types';
import type { CollectionData } from 'src/components/editor/Bindings/types';
import type { InferSchemaResponse } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { skim_collection_projections } from '@estuary/flow-web';
import produce from 'immer';
import { forEach, intersection, isEmpty, isPlainObject, union } from 'lodash';

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
const evaluateInferSchemaResponse = (dataVal: InferSchemaResponse[] | null) => {
    let errors: string[] = [];
    let updatedVal: BuiltProjection[] | null, validKeys: string[];

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
            errors = union(val.errors);
        });

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
            produce((state: BindingsEditorState) => {
                state.editModeEnabled = value;
            }),
            false,
            'Edit Mode Enabled Set'
        );
    },

    setSchemaScope: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.schemaScope = value;
            }),
            false,
            'Schema Scope Set'
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

    setCollectionInitializationDone: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.collectionInitializationDone = value;
            }),
            false,
            'Collection Initialization Done Set'
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

    setSchemaUpdating: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.schemaUpdating = value;
            }),
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

    // TODO (collection editor) maybe
    // This code was initially written supporting being able to
    //  run against `schema` OR [`readSchema`, `writeSchema`].
    // That was removed but might be needed in the future
    //  so we left things running through loops in case we need
    //  to support that again
    populateInferSchemaResponse: async (
        spec,
        entityName,
        collectionSpec,
        projections
    ) => {
        const populateState = (
            dataVal: InferSchemaResponse[] | null,
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
                }),
                false,
                'Inferred Schema Populated'
            );
        };

        set(
            produce((state: BindingsEditorState) => {
                state.inferSchemaResponseDoneProcessing = false;
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
        const usingReadAndWriteSchema = hasReadAndWriteSchema(spec);
        const schemasToTest = usingReadAndWriteSchema
            ? [spec.readSchema, spec.writeSchema]
            : [spec.schema];

        set(
            produce((state: BindingsEditorState) => {
                state.hasReadAndWriteSchema = usingReadAndWriteSchema;
            }),
            false,
            'Setting hasReadAndWriteSchema flag'
        );

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!hasLength(schemasToTest)) {
            return;
        }

        // Make sure we have an object
        if (!schemasToTest.every((schema) => isPlainObject(schema))) {
            populateState(null, ['schema must be an object']);
            return;
        }

        try {
            // Run infer against schema
            const responses = schemasToTest.map((schema) => {
                return skim_collection_projections({
                    collection: entityName,
                    model: {
                        schema,
                        // writeSchema: {},
                        // readSchema: {},
                        projections,
                        key: collectionSpec.key,
                    },
                });
            });

            console.log('projections', projections);
            console.log('responses', responses);

            // Make sure all the responses are valid
            const allResponsesValid = responses.every((inferResponse) => {
                const { projections } = inferResponse;

                // Make sure there is a response
                if (projections?.length === 0) {
                    populateState(null, ['no fields inferred from schema']);
                    return false;
                }

                // Make sure we did not ONLY get the root object back as a pointer
                if (projections.length === 1 && projections[0].ptr === '') {
                    populateState(null, [
                        'no usable fields inferred from schema',
                    ]);
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
