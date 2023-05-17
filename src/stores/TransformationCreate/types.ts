type DerivationLanguage = 'sql' | 'typescript';

export interface TransformCreateState {
    // What language the transform will be written in
    language: DerivationLanguage;
    setLanguage: (val: TransformCreateState['language']) => void;

    // Name of transformation
    name: string;
    setName: (val: TransformCreateState['name']) => void;

    prefix: string;
    setPrefix: (value: TransformCreateState['prefix']) => void;

    catalogName: string | null;

    resetState: () => void;
}
