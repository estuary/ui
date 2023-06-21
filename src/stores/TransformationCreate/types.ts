import { Transform_Shuffle } from 'types';

type DerivationLanguage = 'sql' | 'typescript';

export type DerivationAttribute = 'transform' | 'migration';

export interface TransformConfig {
    filename: string;
    lambda: string;
    sqlTemplate: string;
    collection: string;
    shuffle: Transform_Shuffle;
}

export interface TransformConfigDictionary {
    [transformationId: string]: TransformConfig;
}

export interface MigrationDictionary {
    [migrationId: string]: string;
}

export interface TransformCreateState {
    // What language the transform will be written in
    language: DerivationLanguage;
    setLanguage: (val: TransformCreateState['language']) => void;

    // Derivation Name
    name: string;
    setName: (val: TransformCreateState['name']) => void;

    catalogName: string;
    setCatalogName: (val: TransformCreateState['catalogName']) => void;

    // Transformation Config
    sourceCollections: string[];
    setSourceCollections: (
        value: TransformCreateState['sourceCollections']
    ) => void;

    transformCount: number;

    transformConfigs: TransformConfigDictionary;
    addTransformConfigs: (configs: TransformConfig[]) => void;
    updateTransformConfigs: (value: TransformConfigDictionary) => void;

    // Migration Config
    migrations: MigrationDictionary;
    addMigrations: (configs: string[]) => void;

    // Shuffle Keys
    shuffleKeyErrorsExist: boolean;

    // Misc.
    selectedAttribute: string;
    setSelectedAttribute: (value: string) => void;
    patchSelectedAttribute: (value: string) => void;

    attributeType: DerivationAttribute;
    setAttributeType: (value: TransformCreateState['attributeType']) => void;

    previewActive: boolean;
    setPreviewActive: (value: TransformCreateState['previewActive']) => void;

    catalogUpdating: boolean;
    setCatalogUpdating: (
        value: TransformCreateState['catalogUpdating']
    ) => void;

    resetState: () => void;
}
