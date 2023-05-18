type DerivationLanguage = 'sql' | 'typescript';

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

    // Source Collections
    sourceCollections: string[];
    setSourceCollections: (
        value: TransformCreateState['sourceCollections']
    ) => void;

    // Transformation Config
    transformConfigs: TransformConfigDictionary;
    addTransformConfigs: (configs: TransformConfig[]) => void;

    // Migration Config
    migrations: MigrationDictionary;
    addMigrations: (configs: string[]) => void;

    selectedAttribute: string;
    setSelectedAttribute: (value: string) => void;

    resetState: () => void;
}
