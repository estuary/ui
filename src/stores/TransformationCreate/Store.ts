import produce from 'immer';
import { intersection, omit } from 'lodash';
import { create, StoreApi } from 'zustand';

import { TransformCreateStoreNames } from 'stores/names';

import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';

import { devtools, NamedSet } from 'zustand/middleware';

import {
    MigrationDictionary,
    TransformConfigDictionary,
    TransformCreateState,
} from './types';

const evaluateSQLStatementLength = (
    transformConfigs: TransformConfigDictionary,
    migrations: MigrationDictionary
) =>
    Object.values(transformConfigs).some(({ lambda }) => !hasLength(lambda)) ||
    Object.values(migrations).some((migration) => !hasLength(migration));

const evaluateSelectedAttribute = (
    removedAttribute: string,
    removedAttributeIndex: number,
    selectedAttribute: string,
    targetAttributeIds: string[],
    alternateAttributeIds: string[]
): string => {
    const attributeCount = targetAttributeIds.length;

    if (targetAttributeIds.includes(selectedAttribute)) {
        // The selected attribute is of the same type as the removed attribute and the removed attribute is not selected.
        return selectedAttribute;
    } else if (attributeCount && selectedAttribute === removedAttribute) {
        if (
            removedAttributeIndex > -1 &&
            removedAttributeIndex < attributeCount
        ) {
            // The removed attribute is selected but it is not the last item in the attribute list.
            return targetAttributeIds[removedAttributeIndex];
        } else if (removedAttributeIndex === attributeCount) {
            // The removed attribute is selected and it is the last item in the attribute list.
            return targetAttributeIds[removedAttributeIndex - 1];
        } else {
            return '';
        }
    } else if (alternateAttributeIds.length) {
        // The selected attribute is not of the same type as the removed attribute and attributes of the alternative type exist.
        return alternateAttributeIds[0];
    } else {
        return '';
    }
};

const getInitialStateData = (): Pick<
    TransformCreateState,
    | 'attributeType'
    | 'catalogName'
    | 'catalogUpdating'
    | 'emptySQLExists'
    | 'language'
    | 'migrations'
    | 'name'
    | 'previewActive'
    | 'schemaUnedited'
    | 'selectedAttribute'
    | 'shuffleKeyErrorsExist'
    | 'sourceCollections'
    | 'transformConfigs'
    | 'transformCount'
> => ({
    attributeType: 'transform',
    catalogName: '',
    catalogUpdating: false,
    emptySQLExists: false,
    language: 'sql',
    migrations: {},
    name: '',
    previewActive: false,
    schemaUnedited: false,
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

                state.emptySQLExists = evaluateSQLStatementLength(
                    state.transformConfigs,
                    state.migrations
                );

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

                state.emptySQLExists = evaluateSQLStatementLength(
                    state.transformConfigs,
                    state.migrations
                );

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

                state.emptySQLExists = evaluateSQLStatementLength(
                    state.transformConfigs,
                    state.migrations
                );
            }),
            false,
            'Migration Added'
        );
    },

    removeAttribute: (removedAttribute) => {
        set(
            produce((state: TransformCreateState) => {
                const { migrations, selectedAttribute, transformConfigs } =
                    get();

                if (Object.hasOwn(migrations, removedAttribute)) {
                    const removedAttributeIndex = Object.keys(
                        migrations
                    ).findIndex((id) => id === removedAttribute);

                    state.migrations = omit(migrations, removedAttribute);

                    const migrationIds = Object.keys(state.migrations);
                    const transformConfigIds = Object.keys(transformConfigs);

                    state.selectedAttribute = evaluateSelectedAttribute(
                        removedAttribute,
                        removedAttributeIndex,
                        selectedAttribute,
                        migrationIds,
                        transformConfigIds
                    );

                    if (state.selectedAttribute.includes('lambda')) {
                        state.attributeType = 'transform';
                    }
                } else if (Object.hasOwn(transformConfigs, removedAttribute)) {
                    const removedAttributeIndex = Object.keys(
                        transformConfigs
                    ).findIndex((id) => id === removedAttribute);

                    const evaluatedTransformConfigs = omit(
                        transformConfigs,
                        removedAttribute
                    );

                    state.transformConfigs = evaluatedTransformConfigs;

                    state.sourceCollections = Object.values(
                        evaluatedTransformConfigs
                    ).map(({ collection }) => collection);

                    const migrationIds = Object.keys(migrations);
                    const transformConfigIds = Object.keys(
                        state.transformConfigs
                    );

                    state.selectedAttribute = evaluateSelectedAttribute(
                        removedAttribute,
                        removedAttributeIndex,
                        selectedAttribute,
                        transformConfigIds,
                        migrationIds
                    );

                    if (state.selectedAttribute.includes('migration')) {
                        state.attributeType = 'migration';
                    }
                }

                state.emptySQLExists = evaluateSQLStatementLength(
                    state.transformConfigs,
                    state.migrations
                );
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

                state.emptySQLExists = evaluateSQLStatementLength(
                    state.transformConfigs,
                    state.migrations
                );
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

    setSchemaUnedited: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.schemaUnedited = value;
            }),
            false,
            'Schema Unedited Set'
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
