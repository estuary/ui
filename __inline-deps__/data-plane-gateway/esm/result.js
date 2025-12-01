export class Result {
    constructor(value, error) {
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.value = value;
        this.error = error;
    }
    static Ok(value) {
        const self = new Result(value, undefined);
        return Object.freeze(self);
    }
    static Err(err) {
        const self = new Result(undefined, err);
        return Object.freeze(self);
    }
    ok() {
        return !!this.value;
    }
    err() {
        return !!this.error;
    }
    unwrap() {
        if (this.value) {
            return this.value;
        }
        else {
            throw `Attempted to unwrap an Result, but found error: ${JSON.stringify(this.error)}`;
        }
    }
    unwrap_err() {
        if (this.error) {
            return this.error;
        }
        else {
            throw `Attempted to unwrap an Result error, but found value: ${JSON.stringify(this.value)}`;
        }
    }
    map(f) {
        if (this.value) {
            return new Result(f(this.value), undefined);
        }
        else {
            return new Result(undefined, this.error);
        }
    }
    map_err(f) {
        if (this.error) {
            return new Result(undefined, f(this.error));
        }
        else {
            return new Result(this.value, undefined);
        }
    }
}
