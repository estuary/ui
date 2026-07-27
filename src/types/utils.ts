export type WithRequiredProperty<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};

export type WithOptionalProperty<T, K extends keyof T> = {
    [P in K]?: T[P];
};
