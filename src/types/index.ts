import type { JsonFormsCore } from '@jsonforms/core';
import type { TableCellProps } from '@mui/material';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { LogLevels } from 'src/components/tables/Logs/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

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

export interface BaseComponentProps {
    children?: ReactNode;
}

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

interface StorageMapping {
    stores: StorageMappingStore[];
    data_planes: string[];
}

export interface StorageMappingDictionary {
    [prefix: string]: StorageMapping;
}

interface StorageMappingStore {
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
type TenantPaymentProviders = 'external' | 'stripe';

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

// The slice of `catalog_stats.flow_document` that describes a materialization's
// bindings. The keys of `materialize` are source collection names.
//
// `bytesBehind` is how much of that collection the binding has yet to read, and
// `lastSourcePublishedAt` is the publication timestamp of the newest source
// document it has processed. Bindings with nothing left to read omit
// `bytesBehind` rather than reporting zero.
export interface CatalogStats_Backlog extends BaseCatalogStats {
    flow_document: {
        taskStats?: {
            materialize?: {
                [collectionName: string]: {
                    // A u64 in the stats protocol, so it may arrive as a number
                    // or as a string depending on the producer's JSON encoding.
                    bytesBehind?: number | string;
                    lastSourcePublishedAt?: string;
                };
            };
            // Metered uptime, which a task reports on its own schedule. It can be
            // the only thing in a row, which is how a row comes to exist without
            // describing any bindings.
            interval?: {
                uptimeSeconds: number;
                usageRate?: number;
            };
        };
    };
}

// A collection's own stats row, where `lastPublishedAt` is the publication
// timestamp of the newest document written to it. It reduces by maximizing, so
// the newest row that carries the field holds the latest publication within that
// row's time grain.
export interface CatalogStats_LastPublished extends BaseCatalogStats {
    flow_document: {
        statsSummary?: {
            lastPublishedAt?: string;
        };
    };
}

export interface DocsAndBytes {
    docsTotal?: number;
    bytesTotal?: number;
}

// Shapes mirror ops-catalog/stats.schema.yaml. These are the per-binding fields
// the bindings table reads: the ones carrying a `sum` or `maximize` reduce
// strategy. `bytesBehind` has no reduce strategy and is modelled separately, on
// `CatalogStats_Backlog` above.
export interface CaptureBindingStats {
    // Documents written out to the collection. Summed, and what the task's
    // own `bytes_written_by_me` is accumulated from.
    out?: DocsAndBytes;
    // Publication time of the most recently captured document. The same field
    // the OpenMetrics endpoint encodes as
    // `captured_last_published_at_time_seconds{task,collection}` — that
    // endpoint reads this very row, so the two cannot disagree.
    lastPublishedAt?: string;
}

export interface MaterializeBindingStats {
    // Documents read from the source collection. Summed, and what the task's
    // own `bytes_read_by_me` is accumulated from — so per-binding totals add
    // up to the figure the usage graph shows.
    right?: DocsAndBytes;
    // Publication time of the most recent *source* document processed — the
    // materialize-side counterpart, encoded as
    // `materialized_last_source_published_at_time_seconds`.
    //
    // No reduce strategy, which is deliberate rather than an oversight: this
    // tracks a catch-up frontier, so a task replaying a backlog genuinely is
    // processing old source documents and last-write-wins reports that
    // honestly. `maximize` would pin it to the best watermark ever reached and
    // never show a task falling behind again.
    lastSourcePublishedAt?: string;
}

export interface TaskStats {
    capture?: Record<string, CaptureBindingStats>;
    materialize?: Record<string, MaterializeBindingStats>;
}

export interface BindingStatsResponse extends BaseCatalogStats {
    taskStats: TaskStats | null;
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

export interface Grant_UserExt extends BaseGrant {
    user_avatar_url: string | null;
    user_email: string;
    user_full_name: string | null;
    user_id: string;
}

interface LiveSpecsExtBareMinimum {
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

export type FieldExistence = 'MAY' | 'MUST' | 'CANNOT' | 'IMPLICIT';

export interface AlertSubscription {
    id: string;
    detail: string;
    created_at: Date;
    updated_at: Date;
    catalog_prefix: string;
    email: string;
    include_alert_types: string[];
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

interface Meta {
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

// New root-level target naming model (flow PR #2809).
// Lives at spec.targetNaming (not inside spec.source).
export type TargetNamingStrategy =
    | {
          strategy: 'matchSourceStructure';
          tableTemplate?: string;
          schemaTemplate?: string;
      }
    | {
          strategy: 'singleSchema';
          schema?: string;
          tableTemplate?: string;
      }
    | {
          strategy: 'prefixTableNames';
          schema?: string;
          skipCommonDefaults?: boolean;
          tableTemplate?: string;
      };

// Tracks which model version was present in the spec at load time.
// rootTargetNaming  = spec.targetNaming object at root (new model, always used on create)
// sourceTargetNaming = spec.source.targetNaming string (old model, preserved on edit)
// null = connector does not support x_schema_name; feature not applicable
export type TargetNamingModel =
    | 'rootTargetNaming'
    | 'sourceTargetNaming'
    | null;

export interface BaseButtonProps {
    disabled?: boolean;
}

export interface BaseDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}
