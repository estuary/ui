import type { BindingsEditorState } from 'src/components/editor/Bindings/Store/types';
import type { CollectionData } from 'src/components/editor/Bindings/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { CollectionDef, SkimProjectionResponse } from 'src/types/wasm';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { skim_collection_projections } from '@estuary/flow-web';
import produce from 'immer';
import { intersection, isEmpty, union } from 'lodash';

import { getDraftSpecsByCatalogName } from 'src/api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'src/api/liveSpecsExt';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { BindingsEditorStoreNames } from 'src/stores/names';
import { hasLength } from 'src/utils/misc-utils';
import {
    filterSkimProjectionResponse,
    getSchemaForProjectionModel,
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

// Used to properly populate the skimProjectionResponse related state
const evaluateSkimProjectionResponse = (
    dataVal: SkimProjectionResponse | null
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
        const response = filterSkimProjectionResponse(dataVal);
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
    | 'skimProjectionResponse'
    | 'skimProjectionResponseError'
    | 'skimProjectionResponseDoneProcessing'
    | 'skimProjectionResponseProcessingUpdate'
    | 'skimProjectionResponseEmpty'
    | 'skimProjectionResponse_Keys'
    | 'incompatibleCollections'
    | 'hasIncompatibleCollections'
    | 'hasReadAndWriteSchema'
> => ({
    collectionData: null,
    collectionInitializationAlert: null,
    collectionInitializationDone: false,
    schemaUpdateErrored: false,
    schemaUpdated: true,
    schemaUpdating: false,
    editModeEnabled: false,
    skimProjectionResponse: null,
    skimProjectionResponse_Keys: [],
    skimProjectionResponseError: null,
    skimProjectionResponseDoneProcessing: false,
    skimProjectionResponseProcessingUpdate: false,
    skimProjectionResponseEmpty: false,
    incompatibleCollections: [],
    hasIncompatibleCollections: false,
    hasReadAndWriteSchema: null,
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

    populateSkimProjectionResponse: async (spec, entityName, projections) => {
        const populateState = (
            dataVal: SkimProjectionResponse | null,
            forcedError: BindingsEditorState['skimProjectionResponseError']
        ) => {
            const { hasResponse, updatedVal, validKeys, errors } =
                evaluateSkimProjectionResponse(dataVal);

            logRocketEvent('SkimProjections', {
                hasErrors: Boolean(forcedError || errors),
                hasResponse,
                validKeys,
            });

            // Save the values into the store
            set(
                produce((state: BindingsEditorState) => {
                    state.skimProjectionResponseError = forcedError ?? errors;
                    state.skimProjectionResponse = updatedVal;
                    state.skimProjectionResponseEmpty = !hasResponse;
                    state.skimProjectionResponse_Keys = validKeys;
                    state.skimProjectionResponseDoneProcessing = true;
                    state.skimProjectionResponseProcessingUpdate = false;
                }),
                false,
                'Inferred Schema Populated'
            );
        };

        set(
            produce((state: BindingsEditorState) => {
                if (state.skimProjectionResponseDoneProcessing) {
                    // TODO (infer) not being consumed right now
                    //  I _think_ this processes fast enough but not totally sure
                    state.skimProjectionResponseProcessingUpdate = true;
                } else {
                    state.skimProjectionResponseDoneProcessing = false;
                }
            }),
            false,
            'Resetting skimProjectionDoneProcessing flag'
        );

        // If no schema then just return because hopefully it means
        //  we are still just waiting for the schema to load in
        if (!spec) {
            return;
        }

        // TODO (schema editing) - use this or something similar to figure out
        //  what schemas to show in the dropdown while editing

        // Check which schema to use
        const { usingReadAndWriteSchema, schemaProjectionModel } =
            getSchemaForProjectionModel(spec);

        set(
            (state) => ({
                ...state,
                hasReadAndWriteSchema: usingReadAndWriteSchema,
            }),
            false,
            'Setting hasReadAndWriteSchema flag'
        );

        // Make sure there is SOME schema
        if (schemaProjectionModel === null) {
            populateState(null, [
                usingReadAndWriteSchema
                    ? 'read and write schemas must be an object'
                    : 'schema must be an object',
            ]);

            return;
        }

        try {
            // Generate model based on entire spec as we need all the details
            const model: CollectionDef = { ...spec };

            // Add in projections if they exist. Making sure it is an object since
            //  the collection details view are passing in the `projections` directly
            //  in the `spec`
            if (
                typeof projections === 'object' &&
                Object.keys(projections).length > 0
            ) {
                model.projections = projections;
            }

            const skimProjectionResponse: SkimProjectionResponse =
                await skim_collection_projections({
                    collection: entityName,
                    model,
                });

            logRocketConsole(
                'skim_collection_projections returned = ',
                skimProjectionResponse
            );

            // Make sure we got more back than ONLY the root object as a pointer
            if (
                skimProjectionResponse.projections.length === 1 &&
                skimProjectionResponse.projections[0].ptr === ''
            ) {
                populateState(null, ['no usable fields inferred from schema']);
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
