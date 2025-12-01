export declare class Result<T, E> {
    private value?;
    private error?;
    private constructor();
    static Ok<T, E>(value: T): Readonly<Result<T, E>>;
    static Err<T, E>(err: E): Readonly<Result<T, E>>;
    ok(): boolean;
    err(): boolean;
    unwrap(): T;
    unwrap_err(): E;
    map<U>(f: (v: T) => U): Result<U, E>;
    map_err<F>(f: (e: E) => F): Result<T, F>;
}
