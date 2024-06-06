export type WithRequiredProperty<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};

export type WithRequiredNonNullProperty<T, K extends keyof T> = T & {
    [P in K]-?: Exclude<T[P], null>;
};

export type EnumDictionary<E extends string | symbol | number, T> = {
    [K in E]: T;
};

export type GetFirstArg<T> = T extends (
    first: infer FirstArgument,
    ...args: any[]
) => any
    ? FirstArgument
    : never;
