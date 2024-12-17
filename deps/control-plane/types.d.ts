type ControllerStatus =
    | CaptureControllerStatus
    | CollectionControllerStatus
    | MaterializationControllerStatus;

// Status of the activation of the task in the data-plane.
interface ActivationStatus {
    last_activated?: string; // The build id that was last activated in the data plane. If this is less than the `last_build_id` of the controlled spec, then an activation is still pending.
}

interface AutoDiscoverFailure {
    count: number;
    first_ts: string;
    last_outcome: AutoDiscoverOutcome;
}

interface AutoDiscoverOutcome {
    ts: string;
    added?: DiscoverChange[];
    errors?: Error[];
    modified?: DiscoverChange[];
    publish_result?: JobStatus | null;
    re_created_collections?: EvolvedCollection[];
    removed?: DiscoverChange[];
}

interface AutoDiscoverStatus {
    failure?: AutoDiscoverFailure;
    interval?: string;
    last_success?: AutoDiscoverOutcome;
    next_at?: string | null;
    pending_publish?: AutoDiscoverOutcome;
}

interface BaseControllerStatus {
    type: string;
    activation?: ActivationStatus;
    publications?: PublicationStatus;
}

export interface CaptureControllerStatus extends BaseControllerStatus {
    auto_discover?: AutoDiscoverStatus;
}

export interface CollectionControllerStatus extends BaseControllerStatus {
    inferred_schema?: InferredSchemaStatus;
}

interface DiscoverChange {
    disable: boolean;
    resource_path: string[];
    target: any;
}

export type Entity = 'capture' | 'materialization' | 'collection';

export interface EntityStatusResponse {
    catalog_name: string;
    controller_failures: number;
    controller_status: ControllerStatus;
    controller_updated_at: string;
    disable: boolean;
    last_build_id: string;
    last_pub_id: string;
    live_spec_id: string;
    live_spec_updated_at: string;
    spec_type: Entity;
    controller_next_run?: string | null;
    controller_error?: string | null;
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
    schema_md5?: string;
}

export interface JobStatus {
    type: string;
}

export interface MaterializationControllerStatus extends BaseControllerStatus {
    source_capture?: SourceCaptureStatus;
}

export interface PublicationInfo {
    id: string;
    completed?: string;
    count?: number;
    created?: string;
    detail?: string;
    errors?: Error[];
    is_touch?: boolean;
    result?: JobStatus;
}

interface PublicationStatus {
    history: PublicationInfo[];
    dependency_hash?: string;
    max_observed_pub_id?: string;
}

interface SourceCaptureStatus {
    add_bindings?: string[];
    up_to_date?: boolean;
}