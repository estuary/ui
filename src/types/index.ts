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
    image: string;
    recommended: boolean | null;
    title: string;
}

export interface JobStatus {
    type: string;
}

export interface Grants {
    capability: string;
    object_role: string;
    subject_role: string;
    user_id: string;
    id: string;
}

export interface LiveSpecsExtBaseQuery {
    catalog_name: string;
    connector_image_name: string | null;
    connector_image_tag: string | null;
    image: string;
    title: string;
    id: string;
    last_pub_id: string;
    last_pub_user_avatar_url: string | null;
    last_pub_user_email: string;
    last_pub_user_full_name: string | null;
    spec_type: ENTITY;
    updated_at: string;
}

export interface GatewayAuthTokenResponse {
    gateway_url: URL;
    token: string;
}

export enum CONNECTOR_TYPES {
    CAPTURE = 'capture',
    MATERIALIZATION = 'materialization',
}

export enum ENTITY {
    CAPTURE = 'capture',
    MATERIALIZATION = 'materialization',
    COLLECTION = 'collection',
}
