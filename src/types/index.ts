import { ReactNode } from 'react';

export type StoreSelector<T> = Record<string, (state: T) => any>;

export interface BaseHook<T> {
    idle?: boolean;
    loading: boolean;
    error: string | null;
    data: T;
}

export type BaseData = {
    id: string;
    type: string;
    attributes: any;
    links?: any;
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
    links?: any;
}

export interface BaseComponentProps {
    children?: ReactNode;
}

export interface OpenGraph {
    'en-US': {
        image: string;
        title: string;
    };
}

export interface JobStatus {
    type: string;
}

export interface Grants {
    capability: string;
    object_role: string;
    subject_role: string;
    user_id: string;
}
