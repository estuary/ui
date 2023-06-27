import produce from 'immer';
import { intersection, omit } from 'lodash';
import { TransformCreateStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { TransformCreateState } from './types';

const getInitialStateData = (): Pick<
    TransformCreateState,
    | 'attributeRemovalMetadata'
    | 'attributeType'
    | 'catalogName'
    | 'catalogUpdating'
    | 'language'
    | 'migrations'
    | 'name'
    | 'previewActive'
    | 'selectedAttribute'
    | 'shuffleKeyErrorsExist'
    | 'sourceCollections'
    | 'transformConfigs'
    | 'transformCount'
> => ({
    attributeRemovalMetadata: {
        selectedAttribute: null,
        removedAttribute: '',
        index: -1,
    },
    attributeType: 'transform',
    catalogName: '',
    catalogUpdating: false,
    language: 'sql',
    migrations: {},
    name: '',
    previewActive: false,
    selectedAttribute: '',
    shuffleKeyErrorsExist: false,
    sourceCollections: [],
    transformConfigs: {},
    transformCount: 0,
});

const getInitialState = (
    set: NamedSet<TransformCreateState>,
    get: StoreApi<TransformCreateState>['getState']
): TransformCreateState => ({
    ...getInitialStateData(),

    setLanguage: (val) => {
        set(
            produce((state: TransformCreateState) => {
                state.language = val;
            }),
            false,
            'Transform Create Language Set'
        );
    },

    setName: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.name = value;
            }),
            false,
            'Transform Create Derivation Name Set'
        );
    },

    setCatalogName: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.catalogName = value;
            }),
            false,
            'Transform Create Catalog Name Set'
        );
    },

    setSourceCollections: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.sourceCollections = value;
            }),
            false,
            'Source Collections Set'
        );
    },

    addTransformConfigs: (configs) => {
        set(
            produce((state: TransformCreateState) => {
                const { transformCount, name } = get();

                configs.forEach((config, index: number) => {
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                    const compositeIndex = transformCount + index;

                    state.transformConfigs = {
                        ...state.transformConfigs,
                        [`${name}.lambda.${compositeIndex}.sql`]: config,
                    };
                });

                state.transformCount += Object.keys(
                    state.transformConfigs
                ).length;
            }),
            false,
            'Transform Configs Added'
        );
    },

    updateTransformConfigs: (value) => {
        set(
            produce((state: TransformCreateState) => {
                const { sourceCollections, transformConfigs } = get();

                const existingSourceCollections = Object.values(
                    transformConfigs
                ).map(({ collection }) => collection);

                state.transformConfigs = value;

                state.transformCount +=
                    Object.keys(state.transformConfigs).length -
                    intersection(existingSourceCollections, sourceCollections)
                        .length;
            }),
            false,
            'Transform Configs Updated'
        );
    },

    addMigrations: (values) => {
        set(
            produce((state: TransformCreateState) => {
                const { migrations, name } = get();

                const originalKeyCount = Object.keys(migrations).length;

                values.forEach((migration, index: number) => {
                    state.migrations = {
                        ...state.migrations,
                        [`${name}.migration.${originalKeyCount + index}.sql`]:
                            migration,
                    };
                });
            }),
            false,
            'Migration Added'
        );
    },

    removeAttribute: (attributeId) => {
        set(
            produce((state: TransformCreateState) => {
                const { migrations, selectedAttribute, transformConfigs } =
                    get();

                if (Object.hasOwn(migrations, attributeId)) {
                    state.attributeRemovalMetadata = {
                        selectedAttribute,
                        removedAttribute: attributeId,
                        index: Object.keys(migrations).findIndex(
                            (migrationId) => migrationId === attributeId
                        ),
                    };

                    state.migrations = omit(migrations, attributeId);
                } else if (Object.hasOwn(transformConfigs, attributeId)) {
                    state.attributeRemovalMetadata = {
                        selectedAttribute,
                        removedAttribute: attributeId,
                        index: Object.keys(transformConfigs).findIndex(
                            (transformConfigId) =>
                                transformConfigId === attributeId
                        ),
                    };

                    state.transformConfigs = omit(
                        transformConfigs,
                        attributeId
                    );
                }
            }),
            false,
            'Attribute Removed'
        );
    },

    setSelectedAttribute: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.selectedAttribute = value;
            }),
            false,
            'Selected Attribute Set'
        );
    },

    patchSelectedAttribute: (value) => {
        set(
            produce((state: TransformCreateState) => {
                const { attributeType, selectedAttribute } = get();

                if (attributeType === 'transform') {
                    state.transformConfigs[selectedAttribute].lambda = value;
                } else {
                    state.migrations[selectedAttribute] = value;
                }
            }),
            false,
            'Selected Attribute Set'
        );
    },

    setAttributeType: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.attributeType = value;
            }),
            false,
            'Attribute Type Set'
        );
    },

    setPreviewActive: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.previewActive = value;
            }),
            false,
            'Preview Active Set'
        );
    },

    setCatalogUpdating: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.catalogUpdating = value;
            }),
            false,
            'Catalog Updating Set'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Transform Create State Reset');
    },
});

export const createTransformationCreateStore = (
    key: TransformCreateStoreNames
) => {
    return create<TransformCreateState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
