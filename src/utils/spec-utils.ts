export const taskIsDisabled = (spec: any) => {
    return Boolean(spec?.shards?.disable);
};
