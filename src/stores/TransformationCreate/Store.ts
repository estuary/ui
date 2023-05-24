import produce from 'immer';
import { intersection } from 'lodash';
import { TransformCreateStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { TransformCreateState } from './types';

const getInitialStateData = (): Pick<
    TransformCreateState,
    | 'attributeType'
    | 'catalogName'
    | 'language'
    | 'migrations'
    | 'name'
    | 'prefix'
    | 'previewActive'
    | 'selectedAttribute'
    | 'sourceCollections'
    | 'transformConfigs'
    | 'transformCount'
> => ({
    attributeType: 'transform',
    catalogName: null,
    language: 'sql',
    migrations: {},
    name: '',
    prefix: '',
    previewActive: false,
    selectedAttribute: '',
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
                const { prefix } = get();

                state.name = value;
                state.catalogName = prefix ? `${prefix}${value}` : null;
            }),
            false,
            'Transform Create Name Set'
        );
    },

    setPrefix: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.prefix = value;
                state.catalogName = `${value}${state.name}`;
            }),
            false,
            'Transform Create Prefix Set'
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
            'Migrations Added'
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
