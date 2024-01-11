export type WithRequiredProperty<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};

export type WithRequiredNonNullProperty<T, K extends keyof T> = T & {
    [P in K]-?: Exclude<T[P], null>;
};
