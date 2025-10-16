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
