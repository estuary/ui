import type {
    BuiltProjection,
    BuiltProjection_ValidKey,
} from 'src/types/schemaModels';

export const keyIsValidOption = (
    options: any[],
    tagValue: string | undefined
) => {
    if (typeof tagValue === 'undefined') {
        return false;
    }

    return Boolean(
        options.find(
            (option: any) => tagValue === option.ptr || tagValue === option
        )
    );
};

// Type guard so we can tell typescript we do have the property `ptr`
export const isValidKeyOption = (options: any[]) => {
    return (field: BuiltProjection): field is BuiltProjection_ValidKey => {
        return keyIsValidOption(options, field.ptr);
    };
};
