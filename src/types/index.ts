import type { JsonFormsCore } from '@jsonforms/core';
import type { TableCellProps } from '@mui/material';
import type { PostgrestError } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import type { LogLevels } from 'src/components/tables/Logs/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

export type fake = 'fake';

export enum MessagePrefixes {
    CAPTURE_CREATE = 'captureCreate',
    CAPTURE_EDIT = 'captureEdit',
    COLLECTION_CREATE = 'newTransform',
    MATERIALIZATION_CREATE = 'materializationCreate',
    MATERIALIZATION_EDIT = 'materializationEdit',
}

// TODO (typing): Consider adding a type annotation for the promise returned by
//   the invokeSupabase() function (i.e., src/services/supabase.ts).
export type SupabaseInvokeResponse<T> =
    | { data: null; error: Error }
    | { data: null; error: PostgrestError }
    | { data: T; error: null };

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
    directives?: {
        type: string;
        uses_remaining: number | null;
    };
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
    ['directives.token']: string;
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

interface StorageMapping {
    stores: StorageMappingStore[];
    data_planes: string[];
}

export interface StorageMappingDictionary {
    [prefix: string]: StorageMapping;
}

export interface StorageMappingStore {
    provider: string;
    bucket: string;
    prefix: string;
}

export interface StorageMappingsQuery {
    id: string;
    // detail: string;
    catalog_prefix: string;
    spec: StorageMapping;
    // created_at: string;
    updated_at: string;
}

// TODO (marketplace) we may expand these in the future
export type TenantPaymentProviders = 'external' | 'stripe';

export interface Tenants {
    // collections_quota: number;
    created_at: string;
    detail: string;
    id: string;
    payment_provider: TenantPaymentProviders;
    tasks_quota: number;
    tenant: string;
    trial_start: string;
    updated_at: string;
    gcm_account_id?: string | null;
}

export interface TenantPaymentDetails {
    gcm_account_id: string | null;
    payment_provider: TenantPaymentProviders;
    tenant: string;
    trial_start: string;
}

export interface TenantHidesDataPreview {
    hide_preview: boolean;
    // Just for queries
    tenant: string | undefined;
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

interface BaseCatalogStats {
    catalog_name: string;
    grain: string;
    ts: string;
}

export interface CatalogStats_Details extends BaseCatalogStats {
    bytes_read?: number;
    docs_read?: number;
    bytes_written?: number;
    docs_written?: number;
}

export interface CatalogStats_Dashboard extends BaseCatalogStats {
    bytes_written_by_me?: number;
    bytes_read_by_me?: number;
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

export interface UserGrantsTenantGuard {
    id: string;
    // FILTERING TYPES HACK
    ['user_id']: undefined;
}

// InferredSchemaFlowDocument {}

export interface InferredSchemas {
    collection_name: string;
    schema: Schema;
    flow_document: any; //InferredSchemaFlowDocument
}

export interface BaseGrant {
    capability: Capability;
    object_role: string;
    subject_role: string;
}

export interface Grants extends BaseGrant {
    user_id: string;
    id: string;
}

export interface Grant_UserExt extends BaseGrant {
    user_avatar_url: string | null;
    user_email: string;
    user_full_name: string | null;
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
    title: string;
    last_pub_id: string;
    updated_at: string;
    shard_template_id: string | null;

    // Used ONLY for filtering
    spec: any;
}

export interface DefaultAjvResponse {
    data: any;
    errors: any[];
}

export interface MarketPlaceVerifyResponse {
    data: any;
    error: any;
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
    NETWORK_FAILED = 'NETWORK_FAILED',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

export interface TableColumns {
    field: string | null;
    align?: TableCellProps['align'];
    collapseHeader?: boolean;
    cols?: number;
    display?: string;
    flexGrow?: boolean;
    columnWraps?: boolean;
    headerIntlKey?: string | null;
    minWidth?: number | string;
    sticky?: boolean;
    width?: number | string;
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

export interface InferSchemaResponse {
    properties: InferSchemaResponseProperty[];
}

export type FieldExistence = 'MAY' | 'MUST' | 'CANNOT' | 'IMPLICIT';

export interface InferSchemaResponseProperty {
    is_pattern_property: boolean;
    // https://github.com/estuary/flow/blob/db2cdd86825132ee7e0bcac8b432712ab5866c83/crates/doc/src/inference.rs#L1121
    exists: FieldExistence;
    title: string;
    reduction: string;
    pointer: string;
    types: string[];
    enum_vals: any[];
    name?: string;
    description?: string;
    string_format?: string;
}

export interface InferSchemaPropertyForRender
    extends InferSchemaResponseProperty {
    allowedToBeKey: boolean;
}

export interface AutoDiscoverySettings {
    addNewBindings: boolean;
    evolveIncompatibleCollections: boolean;
}

export interface AlertSubscription {
    id: string;
    detail: string;
    created_at: Date;
    updated_at: Date;
    catalog_prefix: string;
    email: string;
}

export interface DataProcessingAlert {
    alert_type: string;
    catalog_name: string;
    evaluation_interval: string;
}

export interface OpsLogFlowDocument {
    _meta: Meta;
    ts: string; //time stamp string
    level: LogLevels;
    message: string;
    shard?: Shard;
    fields?: Schema;
}

export interface Meta {
    uuid: string;
}

export interface Shard {
    keyBegin: string;
    kind: string;
    name: string;
    rClockBegin: string;
}

export interface UserDetails {
    id: string;
    userName: string;
    email: string;
    emailVerified: boolean;
    avatar: string;
    usedSSO: boolean;
}

export interface RefreshTokenData {
    id: string;
    secret: string;
}

export interface BindingMetadata {
    bindingIndex: number;
    collection: string;
}

// The type attributed to the config property will not be narrowed until its shape is fixed
// such information is needed in the client. The backend DekafConfig type is defined here:
// https://github.com/estuary/flow/blob/e158f7d010e152bfb50af24c52988a98405511c9/crates/dekaf/src/connector.rs#L26-L42
export interface DekafConfig {
    config: Schema;
    variant: string;
}

export interface SourceCaptureDef {
    capture?: string;
    deltaUpdates?: boolean;
    fieldsRecommended?: boolean | number;
    targetSchema?: TargetSchemas; // targetSchema was renamed to targetNaming
    targetNaming?: TargetSchemas;
}
