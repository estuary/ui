export interface BaseHook<T> {
    idle?: boolean;
    loading: boolean;
    error: string | null;
    data: T;
}

export interface BaseHookNullableData<T> {
    isIdle: boolean;
    isLoading: boolean;
    error: string | null;
    data: T | null;
}

export type BaseData = {
    id: string;
    type: string;
    attributes: any;
};

export type BaseError = {
    detail: string;
    title: string;
};

export type BaseLinks = {
    self: string;
};

export interface BaseResponse {
    data: BaseData | BaseData[];
    errors?: BaseError[];
    links: BaseLinks;
}
