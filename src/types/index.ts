import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/supabase-js';
import { ReactNode } from 'react';

export type fake = 'fake';

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
    data: T;
    error: string | null;
    loading: boolean;
    idle?: boolean;
}

export type BaseData = {
    attributes: any;
    id: string;
    type: string;
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

export interface MuiTabProps<T> {
    label: string;
    value: T;
}

export interface AppliedDirective<T> {
    created_at: Date;
    detail: null;
    directive_id: string;
    id: string;
    job_status: JobStatus;
    logs_token: string;
    updated_at: Date;
    user_claims: T | null;
    user_id: string;
}

export interface JoinedAppliedDirective extends AppliedDirective<any> {
    // FILTERING HACK
    ['applied_directives']: AppliedDirective<any>;
    ['applied_directives.user_id']: undefined;
    ['directives.spec->>type']: undefined;
    ['spec->>type']: undefined;
}

export interface StorageMappingStore {
    bucket: string;
    prefix: string;
    provider: string;
}
export interface StorageMappings {
    // detail: string;
    catalog_prefix: string;
    id: string;
    spec: { stores: StorageMappingStore[] };
    // created_at: string;
    updated_at: string;
}

export interface Tenants {
    collections_quota: number;
    created_at: string;
    detail: string;
    id: string;
    tasks_quota: number;
    tenant: string;
    updated_at: string;
}

export interface CatalogStats {
    bytes_read_by_me: number;
    bytes_read_from_me: number;
    bytes_written_by_me: number;
    bytes_written_to_me: number;
    catalog_name: string;
    docs_read_by_me: number;
    docs_read_from_me: number;
    docs_written_by_me: number;
    docs_written_to_me: number;
    flow_document: any;
    grain: string;
    ts: Date;
}

export interface CatalogStats_Billing {
    bytes_read_by_me: number;
    bytes_written_by_me: number;
    catalog_name: string;
    flow_document: any;
    grain: string;
    ts: string;
}

export interface Directive {
    catalog_prefix: string;
    created_at: Date;
    detail: null;
    id: string;
    single_use: boolean;
    spec: JobStatus;
    token: string;
    updated_at: Date;
}

export interface Grants {
    capability: string;
    id: string;
    object_role: string;
    subject_role: string;
    user_id: string;
}

export interface LiveSpecsExtBareMinimum {
    catalog_name: string;
    id: string;
    spec_type: Entity;
}

export interface LiveSpecsExtBaseQuery extends LiveSpecsExtBareMinimum {
    connector_id: string;
    connector_image_name: string | null;
    connector_image_tag: string | null;
    image: string;
    last_pub_id: string;
    title: string;
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
    DATA_FETCHED = 'DATA_FETCHED',
    LOADING = 'LOADING',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

export interface TableColumns {
    field: string | null;
    headerIntlKey?: string | null;
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
