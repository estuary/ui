import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/supabase-js';
import { ReactNode } from 'react';

export enum MessagePrefixes {
    CAPTURE_CREATE = 'captureCreate',
    CAPTURE_EDIT = 'captureEdit',
    MATERIALIZATION_CREATE = 'materializationCreate',
    MATERIALIZATION_EDIT = 'materializationEdit',
}

// TODO (typing): The type annotation for the data property of the JsonFormsData object
//   mirrors the Schema interface. Consider using the Schema interface to type this property.
export interface JsonFormsData extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export interface Schema {
    [key: string]: any;
}

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

export type InternationalizedString =
    | { 'en-US': string }
    | { [key: string]: string };

export interface JobStatus {
    type: string;
}

export interface AppliedDirective {
    created_at: Date;
    detail: null;
    id: string;
    updated_at: Date;
    job_status: JobStatus;
    logs_token: string;
    directive_id: string;
    user_id: string;
    user_claims: null;
}

export interface Directive {
    created_at: Date;
    detail: null;
    id: string;
    updated_at: Date;
    catalog_prefix: string;
    single_use: boolean;
    spec: JobStatus;
    token: string;
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
    connector_id: string;
    connector_image_name: string | null;
    connector_image_tag: string | null;
    image: string;
    title: string;
    id: string;
    last_pub_id: string;
    last_pub_user_avatar_url: string | null;
    last_pub_user_email: string;
    last_pub_user_full_name: string | null;
    spec_type: Entity;
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

export type Entity = 'capture' | 'materialization' | 'collection';
export type EntityWithCreateWorkflow = 'capture' | 'materialization';
export type EntityWorkflow =
    | 'capture_create'
    | 'capture_edit'
    | 'materialization_create'
    | 'materialization_edit';

export type SortDirection = 'asc' | 'desc';

export enum TableStatuses {
    LOADING = 'LOADING',
    DATA_FETCHED = 'DATA_FETCHED',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

export interface TableState {
    status: TableStatuses;
    error?: PostgrestError;
}

export interface TableIntlConfig {
    header: string;
    message: string;
    disableDoclink?: boolean;
}

export interface ViewLogs_Line {
    log_line: string;
    logged_at: string;
    stream: string;
    token: string;
}

export type ParsedStream =
    | 'build'
    | 'persist'
    | 'temp-data-plane'
    | 'setup'
    | 'test'
    | 'cleanup'
    | 'activate';
