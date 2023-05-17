type DerivationLanguage = 'sql' | 'typescript';

export interface TransformConfig {
    lambda: string;
    sqlTemplate: string;
    collection: string;
}

export interface TransformConfigDictionary {
    [transformationId: string]: TransformConfig;
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
    transformConfigs: TransformConfigDictionary;
    addTransformConfigs: (configs: TransformConfig[]) => void;

    resetState: () => void;
}
