import stringify from 'safe-stable-stringify';

const configuredStringify = stringify.configure({
    deterministic: true,
});

export const stringifyJSON = (json: any) => {
    return configuredStringify(json, null, 2);
};
