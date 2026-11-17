export type WithRequiredProperty<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};

export type Result<T, E = Error> =
    | { value: T; error?: never }
    | { value?: never; error: E };
