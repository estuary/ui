// Local API documentation can be found here: http://localhost:8675/api/v1/docs

export type ControllerStatus =
    | CaptureControllerStatus
    | CollectionControllerStatus
    | MaterializationControllerStatus
    | TestControllerStatus
    | BaseControllerStatus;

export interface ActivationStatus {
    last_activated?: string;
}

interface AutoDiscoverFailure {
    count: number;
    first_ts: string;
    last_outcome: AutoDiscoverOutcome;
}

export interface AutoDiscoverOutcome {
    ts: string;
    added?: DiscoverChange[];
    errors?: Error[];
    modified?: DiscoverChange[];
    publish_result?: JobStatus | null;
    re_created_collections?: EvolvedCollection[];
    removed?: DiscoverChange[];
}

export interface AutoDiscoverStatus {
    failure?: AutoDiscoverFailure | null;
    interval?: string | null;
    last_success?: AutoDiscoverOutcome | null;
    next_at?: string;
    pending_publish?: AutoDiscoverOutcome | null;
}

interface BaseControllerStatus {
    type: string;
}

export interface CaptureControllerStatus extends EntityControllerStatus {
    auto_discover?: AutoDiscoverStatus | null;
}

export interface CollectionControllerStatus extends EntityControllerStatus {
    inferred_schema?: InferredSchemaStatus | null;
}

interface ConnectorStatus {
    message: string;
    shard: ShardRef;
    ts: string;
    fields?: object;
}

interface DiscoverChange {
    disable: boolean;
    resource_path: string[];
    target: string;
}

export type Entity = 'capture' | 'materialization' | 'collection';

export interface EntityControllerStatus extends PublicationControllerStatus {
    activation?: ActivationStatus;
}

export interface EntityStatusResponse {
    catalog_name: string;
    controller_next_run: string | null;
    controller_updated_at: string;
    last_build_id: string;
    last_pub_id: string;
    live_spec_id: string;
    live_spec_updated_at: string;
    spec_type: Entity;
    controller_status: ControllerStatus;
    connector_status?: ConnectorStatus | null;
    controller_error?: string | null;
    controller_failures?: number;
    disabled?: boolean;
}

export interface EntityRelationshipResponse {
    catalog_name: string;
    live_spec_id: string;
    spec_type: string;
    summary: {
        status: string;
        message: string;
    };
    last_pub_id: string;
    last_build_id: string;
    controller_next_run: string | null;
    live_spec_updated_at: string;
    controller_updated_at: string;
}

export interface Error {
    detail: string;
    catalog_name?: string;
    scope?: string | null;
}

interface EvolvedCollection {
    new_name: string;
    old_name: string;
    updated_captures: string[];
    updated_materializations: string[];
}

interface InferredSchemaStatus {
    schema_last_updated?: string;
    schema_md5?: string | null;
}

export interface JobStatus {
    type: string;
}

export interface MaterializationControllerStatus
    extends EntityControllerStatus {
    source_capture?: SourceCaptureStatus | null;
}

interface PublicationControllerStatus extends BaseControllerStatus {
    publications?: PublicationStatus;
}

export interface PublicationInfo {
    id: string;
    completed?: string;
    count?: number;
    created?: string;
    detail?: string | null;
    errors?: Error[];
    is_touch?: boolean;
    result?: JobStatus | null;
}

interface PublicationStatus {
    history: PublicationInfo[];
    dependency_hash?: string | null;
    max_observed_pub_id?: string;
}

interface ShardRef {
    build: string;
    keyBegin: string;
    name: string;
    rClockBegin: string;
}

interface SourceCaptureStatus {
    add_bindings?: string[];
    up_to_date?: boolean;
}

interface TestControllerStatus extends PublicationControllerStatus {
    passing: boolean;
}
