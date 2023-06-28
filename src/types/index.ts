import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/supabase-js';
import { ReactNode } from 'react';

export type fake = 'fake';

export enum MessagePrefixes {
    CAPTURE_CREATE = 'captureCreate',
    CAPTURE_EDIT = 'captureEdit',
    COLLECTION_CREATE = 'newTransform',
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

export interface MuiTabProps<T> {
    label: string;
    value: T;
}

export interface AppliedDirective<T> {
    created_at: Date;
    detail: null;
    id: string;
    updated_at: Date;
    job_status: JobStatus;
    logs_token: string;
    directive_id: string;
    user_id: string;
    user_claims: T | null;
}

export interface JoinedAppliedDirective extends AppliedDirective<any> {
    // FILTERING HACK
    ['applied_directives']: AppliedDirective<any>;
    ['spec->>type']: undefined;
    ['applied_directives.user_id']: undefined;
    ['directives.spec->>type']: undefined;
}

export interface GrantDirectiveSpec {
    type: string;
    capability: string;
    grantedPrefix: string;
}

export interface GrantDirective {
    created_at: string;
    detail: string | null;
    id: string;
    updated_at: string;
    catalog_prefix: string;
    uses_remaining: number | null;
    spec: GrantDirectiveSpec;
    token: string;
}

export interface GrantDirective_AccessLinks {
    id: string;
    updated_at: string;
    catalog_prefix: string;
    uses_remaining: number | null;
    spec: {
        type: string;
        capability: string;
        grantedPrefix: string;
    };
    token: string;
    ['spec->>capability']: undefined;
    ['spec->>grantedPrefix']: undefined;
}

export interface StorageMappingStore {
    provider: string;
    bucket: string;
    prefix: string;
}
export interface StorageMappings {
    id: string;
    // detail: string;
    catalog_prefix: string;
    spec: { stores: StorageMappingStore[] };
    // created_at: string;
    updated_at: string;
}

export interface Tenants {
    id: string;
    tasks_quota: number;
    collections_quota: number;
    detail: string;
    tenant: string;
    created_at: string;
    updated_at: string;
}

export type Capability = 'admin' | 'read' | 'write';
export interface AuthRoles {
    capability: Capability;
    role_prefix: string;
}

export interface CatalogStats {
    catalog_name: string;
    grain: string;
    bytes_written_by_me: number;
    docs_written_by_me: number;
    bytes_read_by_me: number;
    docs_read_by_me: number;
    bytes_written_to_me: number;
    docs_written_to_me: number;
    bytes_read_from_me: number;
    docs_read_from_me: number;
    ts: Date;
    flow_document: any;
}

export interface CatalogStats_Billing {
    catalog_name: string;
    grain: string;
    ts: string;
    bytes_written_by_me: number;
    bytes_read_by_me: number;
    flow_document: any;
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

export interface UserGrants {
    capability: string;
    object_role: string;
    user_id: string;
    id: string;
    detail: string | null;
}

export interface Grants {
    capability: string;
    object_role: string;
    subject_role: string;
    user_id: string;
    id: string;
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
    title: string;
    last_pub_id: string;
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
    | 'collection_create'
    | 'materialization_create'
    | 'materialization_edit'
    | 'test_json_forms';

export type DerivationLanguage = 'sql' | 'typescript';

export type Transform_Shuffle = 'any' | { key: string[] };
export interface Transform {
    name: string;
    source: string;
    lambda: string;
    shuffle: Transform_Shuffle;
}

export type SortDirection = 'asc' | 'desc';

export enum TableStatuses {
    LOADING = 'LOADING',
    DATA_FETCHED = 'DATA_FETCHED',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

export interface TableColumns {
    field: string | null;
    headerIntlKey?: string | null;
    width?: number;
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
