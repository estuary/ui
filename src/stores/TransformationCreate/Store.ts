import produce from 'immer';
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
    | 'selectedAttribute'
    | 'sourceCollections'
    | 'transformConfigs'
> => ({
    attributeType: 'transform',
    catalogName: null,
    language: 'sql',
    migrations: {},
    name: '',
    prefix: '',
    selectedAttribute: '',
    sourceCollections: [],
    transformConfigs: {},
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
                const { transformConfigs, name } = get();

                const originalKeyCount = Object.keys(transformConfigs).length;

                configs.forEach((config, index: number) => {
                    state.transformConfigs = {
                        ...state.transformConfigs,
                        [`${name}.lambda.${originalKeyCount + index}.sql`]:
                            config,
                    };
                });
            }),
            false,
            'Transform Configs Added'
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
