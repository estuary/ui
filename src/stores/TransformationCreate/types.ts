type DerivationLanguage = 'sql' | 'typescript';

export type DerivationAttribute = 'transform' | 'migration';

export interface TransformConfig {
    lambda: string;
    sqlTemplate: string;
    collection: string;
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

    prefix: string;
    setPrefix: (value: TransformCreateState['prefix']) => void;

    catalogName: string | null;

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

    // Misc.
    selectedAttribute: string;
    setSelectedAttribute: (value: string) => void;
    patchSelectedAttribute: (value: string) => void;

    attributeType: DerivationAttribute;
    setAttributeType: (value: TransformCreateState['attributeType']) => void;

    resetState: () => void;
}
