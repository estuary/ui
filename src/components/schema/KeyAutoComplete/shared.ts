export const keyIsValidOption = (options: any[], tagValue: string) => {
    return Boolean(
        options.find(
            (option: any) => tagValue === option.pointer || tagValue === option
        )
    );
};
