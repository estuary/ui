type DerivationLanguage = 'sql' | 'typescript';

export interface TransformCreateState {
    // What language the transform will be written in
    language: DerivationLanguage;
    // Name of transformation
    name: string;

    resetState: () => void;
    setLanguage: (val: TransformCreateState['language']) => void;

    setName: (val: TransformCreateState['name']) => void;
}
