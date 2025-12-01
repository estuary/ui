export class Result<T, E> {
  private value?: T;
  private error?: E;

  private constructor(value?: T, error?: E) {
    this.value = value;
    this.error = error;
  }

  public static Ok<T, E>(value: T): Readonly<Result<T, E>> {
    const self = new Result<T, E>(value, undefined);
    return Object.freeze(self);
  }

  public static Err<T, E>(err: E): Readonly<Result<T, E>> {
    const self = new Result<T, E>(undefined, err);
    return Object.freeze(self);
  }

  public ok(): boolean {
    return !!this.value;
  }

  public err(): boolean {
    return !!this.error;
  }

  public unwrap(): T {
    if (this.value) {
      return this.value;
    } else {
      throw `Attempted to unwrap an Result, but found error: ${
        JSON.stringify(this.error)
      }`;
    }
  }

  public unwrap_err(): E {
    if (this.error) {
      return this.error;
    } else {
      throw `Attempted to unwrap an Result error, but found value: ${
        JSON.stringify(this.value)
      }`;
    }
  }

  public map<U>(f: (v: T) => U): Result<U, E> {
    if (this.value) {
      return new Result<U, E>(f(this.value), undefined);
    } else {
      return new Result<U, E>(undefined, this.error);
    }
  }

  public map_err<F>(f: (e: E) => F): Result<T, F> {
    if (this.error) {
      return new Result<T, F>(undefined, f(this.error));
    } else {
      return new Result<T, F>(this.value, undefined);
    }
  }
}
