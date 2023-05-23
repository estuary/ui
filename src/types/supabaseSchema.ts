export interface StorageMapping_Stores {
    stores: {
        provider: string;
        bucket: string;
        prefix?: string;
    }[];
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json }
    | Json[];

export interface Database {
    public: {
        Tables: {
            applied_directives: {
                Row: {
                    created_at: string;
                    detail: string | null;
                    directive_id: unknown;
                    id: unknown;
                    job_status: Json;
                    logs_token: string;
                    updated_at: string;
                    user_claims: Json | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    detail?: string | null;
                    directive_id: unknown;
                    id: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_claims?: Json | null;
                    user_id?: string;
                };
                Update: {
                    created_at?: string;
                    detail?: string | null;
                    directive_id?: unknown;
                    id?: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_claims?: Json | null;
                    user_id?: string;
                };
            };
            catalog_stats: {
                Row: {
                    bytes_read_by_me: number;
                    bytes_read_from_me: number;
                    bytes_written_by_me: number;
                    bytes_written_to_me: number;
                    catalog_name: string;
                    docs_read_by_me: number;
                    docs_read_from_me: number;
                    docs_written_by_me: number;
                    docs_written_to_me: number;
                    errors: number;
                    failures: number;
                    flow_document: Json;
                    grain: string;
                    ts: string;
                    warnings: number;
                };
                Insert: {
                    bytes_read_by_me: number;
                    bytes_read_from_me: number;
                    bytes_written_by_me: number;
                    bytes_written_to_me: number;
                    catalog_name: string;
                    docs_read_by_me: number;
                    docs_read_from_me: number;
                    docs_written_by_me: number;
                    docs_written_to_me: number;
                    errors?: number;
                    failures?: number;
                    flow_document: Json;
                    grain: string;
                    ts: string;
                    warnings?: number;
                };
                Update: {
                    bytes_read_by_me?: number;
                    bytes_read_from_me?: number;
                    bytes_written_by_me?: number;
                    bytes_written_to_me?: number;
                    catalog_name?: string;
                    docs_read_by_me?: number;
                    docs_read_from_me?: number;
                    docs_written_by_me?: number;
                    docs_written_to_me?: number;
                    errors?: number;
                    failures?: number;
                    flow_document?: Json;
                    grain?: string;
                    ts?: string;
                    warnings?: number;
                };
            };
            connector_tags: {
                Row: {
                    connector_id: unknown;
                    created_at: string;
                    detail: string | null;
                    documentation_url: string | null;
                    endpoint_spec_schema: Json | null;
                    id: unknown;
                    image_tag: string;
                    job_status: Json;
                    logs_token: string;
                    protocol: string | null;
                    resource_spec_schema: Json | null;
                    updated_at: string;
                };
                Insert: {
                    connector_id: unknown;
                    created_at?: string;
                    detail?: string | null;
                    documentation_url?: string | null;
                    endpoint_spec_schema?: Json | null;
                    id: unknown;
                    image_tag: string;
                    job_status?: Json;
                    logs_token?: string;
                    protocol?: string | null;
                    resource_spec_schema?: Json | null;
                    updated_at?: string;
                };
                Update: {
                    connector_id?: unknown;
                    created_at?: string;
                    detail?: string | null;
                    documentation_url?: string | null;
                    endpoint_spec_schema?: Json | null;
                    id?: unknown;
                    image_tag?: string;
                    job_status?: Json;
                    logs_token?: string;
                    protocol?: string | null;
                    resource_spec_schema?: Json | null;
                    updated_at?: string;
                };
            };
            connectors: {
                Row: {
                    created_at: string;
                    detail: string | null;
                    external_url: string;
                    id: unknown;
                    image_name: string;
                    logo_url: Json;
                    oauth2_client_id: string | null;
                    oauth2_client_secret: string | null;
                    oauth2_injected_values: Json | null;
                    oauth2_spec: Json | null;
                    recommended: boolean;
                    short_description: Json;
                    title: Json;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    detail?: string | null;
                    external_url: string;
                    id: unknown;
                    image_name: string;
                    logo_url: Json;
                    oauth2_client_id?: string | null;
                    oauth2_client_secret?: string | null;
                    oauth2_injected_values?: Json | null;
                    oauth2_spec?: Json | null;
                    recommended?: boolean;
                    short_description: Json;
                    title: Json;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    detail?: string | null;
                    external_url?: string;
                    id?: unknown;
                    image_name?: string;
                    logo_url?: Json;
                    oauth2_client_id?: string | null;
                    oauth2_client_secret?: string | null;
                    oauth2_injected_values?: Json | null;
                    oauth2_spec?: Json | null;
                    recommended?: boolean;
                    short_description?: Json;
                    title?: Json;
                    updated_at?: string;
                };
            };
            directives: {
                Row: {
                    catalog_prefix: string;
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    spec: Json;
                    token: string | null;
                    updated_at: string;
                    uses_remaining: number | null;
                };
                Insert: {
                    catalog_prefix: string;
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    spec: Json;
                    token?: string | null;
                    updated_at?: string;
                    uses_remaining?: number | null;
                };
                Update: {
                    catalog_prefix?: string;
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    spec?: Json;
                    token?: string | null;
                    updated_at?: string;
                    uses_remaining?: number | null;
                };
            };
            discovers: {
                Row: {
                    capture_name: string;
                    connector_tag_id: unknown;
                    created_at: string;
                    detail: string | null;
                    draft_id: unknown;
                    endpoint_config: Json;
                    id: unknown;
                    job_status: Json;
                    logs_token: string;
                    update_only: boolean;
                    updated_at: string;
                };
                Insert: {
                    capture_name: string;
                    connector_tag_id: unknown;
                    created_at?: string;
                    detail?: string | null;
                    draft_id: unknown;
                    endpoint_config: Json;
                    id: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    update_only?: boolean;
                    updated_at?: string;
                };
                Update: {
                    capture_name?: string;
                    connector_tag_id?: unknown;
                    created_at?: string;
                    detail?: string | null;
                    draft_id?: unknown;
                    endpoint_config?: Json;
                    id?: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    update_only?: boolean;
                    updated_at?: string;
                };
            };
            draft_errors: {
                Row: {
                    detail: string;
                    draft_id: unknown;
                    scope: string;
                };
                Insert: {
                    detail: string;
                    draft_id: unknown;
                    scope: string;
                };
                Update: {
                    detail?: string;
                    draft_id?: unknown;
                    scope?: string;
                };
            };
            draft_specs: {
                Row: {
                    catalog_name: string;
                    created_at: string;
                    detail: string | null;
                    draft_id: unknown;
                    expect_pub_id: unknown | null;
                    id: unknown;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at: string;
                };
                Insert: {
                    catalog_name: string;
                    created_at?: string;
                    detail?: string | null;
                    draft_id: unknown;
                    expect_pub_id?: unknown | null;
                    id: unknown;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at?: string;
                };
                Update: {
                    catalog_name?: string;
                    created_at?: string;
                    detail?: string | null;
                    draft_id?: unknown;
                    expect_pub_id?: unknown | null;
                    id?: unknown;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at?: string;
                };
            };
            drafts: {
                Row: {
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    updated_at?: string;
                    user_id?: string;
                };
            };
            evolutions: {
                Row: {
                    collections: Json;
                    created_at: string;
                    detail: string | null;
                    draft_id: unknown;
                    id: unknown;
                    job_status: Json;
                    logs_token: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    collections: Json;
                    created_at?: string;
                    detail?: string | null;
                    draft_id: unknown;
                    id: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    collections?: Json;
                    created_at?: string;
                    detail?: string | null;
                    draft_id?: unknown;
                    id?: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_id?: string;
                };
            };
            flow_checkpoints_v1: {
                Row: {
                    checkpoint: string;
                    fence: number;
                    key_begin: number;
                    key_end: number;
                    materialization: string;
                };
                Insert: {
                    checkpoint: string;
                    fence: number;
                    key_begin: number;
                    key_end: number;
                    materialization: string;
                };
                Update: {
                    checkpoint?: string;
                    fence?: number;
                    key_begin?: number;
                    key_end?: number;
                    materialization?: string;
                };
            };
            flow_materializations_v2: {
                Row: {
                    materialization: string;
                    spec: string;
                    version: string;
                };
                Insert: {
                    materialization: string;
                    spec: string;
                    version: string;
                };
                Update: {
                    materialization?: string;
                    spec?: string;
                    version?: string;
                };
            };
            live_spec_flows: {
                Row: {
                    flow_type: Database['public']['Enums']['catalog_spec_type'];
                    source_id: unknown;
                    target_id: unknown;
                };
                Insert: {
                    flow_type: Database['public']['Enums']['catalog_spec_type'];
                    source_id: unknown;
                    target_id: unknown;
                };
                Update: {
                    flow_type?: Database['public']['Enums']['catalog_spec_type'];
                    source_id?: unknown;
                    target_id?: unknown;
                };
            };
            live_specs: {
                Row: {
                    catalog_name: string;
                    connector_image_name: string | null;
                    connector_image_tag: string | null;
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    last_build_id: unknown;
                    last_pub_id: unknown;
                    md5: string | null;
                    reads_from: string[] | null;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at: string;
                    writes_to: string[] | null;
                };
                Insert: {
                    catalog_name: string;
                    connector_image_name?: string | null;
                    connector_image_tag?: string | null;
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    last_build_id: unknown;
                    last_pub_id: unknown;
                    md5?: string | null;
                    reads_from?: string[] | null;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at?: string;
                    writes_to?: string[] | null;
                };
                Update: {
                    catalog_name?: string;
                    connector_image_name?: string | null;
                    connector_image_tag?: string | null;
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    last_build_id?: unknown;
                    last_pub_id?: unknown;
                    md5?: string | null;
                    reads_from?: string[] | null;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at?: string;
                    writes_to?: string[] | null;
                };
            };
            publication_specs: {
                Row: {
                    detail: string | null;
                    live_spec_id: unknown;
                    pub_id: unknown;
                    published_at: string;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    user_id: string;
                };
                Insert: {
                    detail?: string | null;
                    live_spec_id: unknown;
                    pub_id: unknown;
                    published_at?: string;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    user_id?: string;
                };
                Update: {
                    detail?: string | null;
                    live_spec_id?: unknown;
                    pub_id?: unknown;
                    published_at?: string;
                    spec?: Json | null;
                    spec_type?:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    user_id?: string;
                };
            };
            publications: {
                Row: {
                    created_at: string;
                    detail: string | null;
                    draft_id: unknown;
                    dry_run: boolean;
                    id: unknown;
                    job_status: Json;
                    logs_token: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    detail?: string | null;
                    draft_id: unknown;
                    dry_run?: boolean;
                    id: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    created_at?: string;
                    detail?: string | null;
                    draft_id?: unknown;
                    dry_run?: boolean;
                    id?: unknown;
                    job_status?: Json;
                    logs_token?: string;
                    updated_at?: string;
                    user_id?: string;
                };
            };
            refresh_tokens: {
                Row: {
                    created_at: string;
                    detail: string | null;
                    hash: string;
                    id: unknown;
                    multi_use: boolean | null;
                    updated_at: string;
                    user_id: string;
                    uses: number | null;
                    valid_for: unknown;
                };
                Insert: {
                    created_at?: string;
                    detail?: string | null;
                    hash: string;
                    id: unknown;
                    multi_use?: boolean | null;
                    updated_at?: string;
                    user_id: string;
                    uses?: number | null;
                    valid_for: unknown;
                };
                Update: {
                    created_at?: string;
                    detail?: string | null;
                    hash?: string;
                    id?: unknown;
                    multi_use?: boolean | null;
                    updated_at?: string;
                    user_id?: string;
                    uses?: number | null;
                    valid_for?: unknown;
                };
            };
            role_grants: {
                Row: {
                    capability: Database['public']['Enums']['grant_capability'];
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    object_role: string;
                    subject_role: string;
                    updated_at: string;
                };
                Insert: {
                    capability: Database['public']['Enums']['grant_capability'];
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    object_role: string;
                    subject_role: string;
                    updated_at?: string;
                };
                Update: {
                    capability?: Database['public']['Enums']['grant_capability'];
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    object_role?: string;
                    subject_role?: string;
                    updated_at?: string;
                };
            };
            storage_mappings: {
                Row: {
                    catalog_prefix: string;
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    spec: StorageMapping_Stores;
                    updated_at: string;
                };
                Insert: {
                    catalog_prefix: string;
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    spec: StorageMapping_Stores;
                    updated_at?: string;
                };
                Update: {
                    catalog_prefix?: string;
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    spec?: StorageMapping_Stores;
                    updated_at?: string;
                };
            };
            tenants: {
                Row: {
                    collections_quota: number;
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    tasks_quota: number;
                    tenant: string;
                    updated_at: string;
                };
                Insert: {
                    collections_quota?: number;
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    tasks_quota?: number;
                    tenant: string;
                    updated_at?: string;
                };
                Update: {
                    collections_quota?: number;
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    tasks_quota?: number;
                    tenant?: string;
                    updated_at?: string;
                };
            };
            user_grants: {
                Row: {
                    capability: Database['public']['Enums']['grant_capability'];
                    created_at: string;
                    detail: string | null;
                    id: unknown;
                    object_role: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    capability: Database['public']['Enums']['grant_capability'];
                    created_at?: string;
                    detail?: string | null;
                    id: unknown;
                    object_role: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    capability?: Database['public']['Enums']['grant_capability'];
                    created_at?: string;
                    detail?: string | null;
                    id?: unknown;
                    object_role?: string;
                    updated_at?: string;
                    user_id?: string;
                };
            };
        };
        Views: {
            combined_grants_ext: {
                Row: {
                    capability:
                        | Database['public']['Enums']['grant_capability']
                        | null;
                    created_at: string | null;
                    detail: string | null;
                    id: unknown | null;
                    object_role: string | null;
                    subject_role: string | null;
                    updated_at: string | null;
                    user_avatar_url: string | null;
                    user_email: string | null;
                    user_full_name: string | null;
                    user_id: string | null;
                };
            };
            draft_specs_ext: {
                Row: {
                    catalog_name: string | null;
                    created_at: string | null;
                    detail: string | null;
                    draft_id: unknown | null;
                    expect_pub_id: unknown | null;
                    id: unknown | null;
                    last_pub_detail: string | null;
                    last_pub_id: unknown | null;
                    last_pub_user_avatar_url: string | null;
                    last_pub_user_email: string | null;
                    last_pub_user_full_name: string | null;
                    last_pub_user_id: string | null;
                    live_spec: Json | null;
                    live_spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at: string | null;
                };
            };
            drafts_ext: {
                Row: {
                    created_at: string | null;
                    detail: string | null;
                    id: unknown | null;
                    num_specs: number | null;
                    updated_at: string | null;
                    user_id: string | null;
                };
            };
            live_specs_ext: {
                Row: {
                    catalog_name: string | null;
                    connector_external_url: string | null;
                    connector_id: unknown | null;
                    connector_image_name: string | null;
                    connector_image_tag: string | null;
                    connector_logo_url: Json | null;
                    connector_recommended: boolean | null;
                    connector_short_description: Json | null;
                    connector_tag_documentation_url: string | null;
                    connector_tag_id: unknown | null;
                    connector_title: Json | null;
                    created_at: string | null;
                    detail: string | null;
                    id: unknown | null;
                    last_build_id: unknown | null;
                    last_pub_detail: string | null;
                    last_pub_id: unknown | null;
                    last_pub_user_avatar_url: string | null;
                    last_pub_user_email: string | null;
                    last_pub_user_full_name: string | null;
                    last_pub_user_id: string | null;
                    md5: string | null;
                    reads_from: string[] | null;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    updated_at: string | null;
                    writes_to: string[] | null;
                };
            };
            publication_specs_ext: {
                Row: {
                    catalog_name: string | null;
                    detail: string | null;
                    last_pub_id: unknown | null;
                    live_spec_id: unknown | null;
                    pub_id: unknown | null;
                    published_at: string | null;
                    spec: Json | null;
                    spec_type:
                        | Database['public']['Enums']['catalog_spec_type']
                        | null;
                    user_avatar_url: string | null;
                    user_email: string | null;
                    user_full_name: string | null;
                    user_id: string | null;
                };
            };
        };
        Functions: {
            auth_roles: {
                Args: {
                    min_capability?: Database['public']['Enums']['grant_capability'];
                };
                Returns: {
                    role_prefix: unknown;
                    capability: Database['public']['Enums']['grant_capability'];
                }[];
            };
            auth_uid: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            create_refresh_token: {
                Args: {
                    multi_use: boolean;
                    valid_for: unknown;
                    detail?: string;
                };
                Returns: Json;
            };
            exchange_directive_token: {
                Args: {
                    bearer_token: string;
                };
                Returns: Database['public']['CompositeTypes']['exchanged_directive'];
            };
            gateway_auth_token: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    token: string;
                    gateway_url: string;
                }[];
            };
            generate_access_token: {
                Args: {
                    refresh_token_id: unknown;
                    secret: string;
                };
                Returns: Json;
            };
            view_logs: {
                Args: {
                    bearer_token: string;
                };
                Returns: {
                    log_line: string;
                    logged_at: string;
                    stream: string;
                    token: string;
                }[];
            };
            view_user_profile: {
                Args: {
                    bearer_user_id: string;
                };
                Returns: Database['public']['CompositeTypes']['user_profile'];
            };
        };
        Enums: {
            catalog_spec_type:
                | 'capture'
                | 'collection'
                | 'materialization'
                | 'test';
            grain: 'monthly' | 'daily' | 'hourly';
            grant_capability:
                | 'x_00'
                | 'x_01'
                | 'x_02'
                | 'x_03'
                | 'x_04'
                | 'x_05'
                | 'x_06'
                | 'x_07'
                | 'x_08'
                | 'x_09'
                | 'read'
                | 'x_11'
                | 'x_12'
                | 'x_13'
                | 'x_14'
                | 'x_15'
                | 'x_16'
                | 'x_17'
                | 'x_18'
                | 'x_19'
                | 'write'
                | 'x_21'
                | 'x_22'
                | 'x_23'
                | 'x_24'
                | 'x_25'
                | 'x_26'
                | 'x_27'
                | 'x_28'
                | 'x_29'
                | 'admin';
        };
        CompositeTypes: {
            exchanged_directive: {
                directive: unknown;
                applied_directive: unknown;
            };
            user_profile: {
                user_id: string;
                email: string;
                full_name: string;
                avatar_url: string;
            };
        };
    };
}

export enum CatalogSpecType {
    capture = 'capture',
    collection = 'collection',
    materialization = 'materialization',
    test = 'test',
}

export enum Grain {
    monthly = 'monthly',
    daily = 'daily',
    hourly = 'hourly',
}

export enum GrantCapability {
    x_00 = 'x_00',
    x_01 = 'x_01',
    x_02 = 'x_02',
    x_03 = 'x_03',
    x_04 = 'x_04',
    x_05 = 'x_05',
    x_06 = 'x_06',
    x_07 = 'x_07',
    x_08 = 'x_08',
    x_09 = 'x_09',
    read = 'read',
    x_11 = 'x_11',
    x_12 = 'x_12',
    x_13 = 'x_13',
    x_14 = 'x_14',
    x_15 = 'x_15',
    x_16 = 'x_16',
    x_17 = 'x_17',
    x_18 = 'x_18',
    x_19 = 'x_19',
    write = 'write',
    x_21 = 'x_21',
    x_22 = 'x_22',
    x_23 = 'x_23',
    x_24 = 'x_24',
    x_25 = 'x_25',
    x_26 = 'x_26',
    x_27 = 'x_27',
    x_28 = 'x_28',
    x_29 = 'x_29',
    admin = 'admin',
}

export type AppliedDirectives =
    Database['public']['Tables']['applied_directives']['Row'];
export type InsertAppliedDirectives =
    Database['public']['Tables']['applied_directives']['Insert'];
export type UpdateAppliedDirectives =
    Database['public']['Tables']['applied_directives']['Update'];

export type CatalogStats = Database['public']['Tables']['catalog_stats']['Row'];
export type InsertCatalogStats =
    Database['public']['Tables']['catalog_stats']['Insert'];
export type UpdateCatalogStats =
    Database['public']['Tables']['catalog_stats']['Update'];

export type ConnectorTags =
    Database['public']['Tables']['connector_tags']['Row'];
export type InsertConnectorTags =
    Database['public']['Tables']['connector_tags']['Insert'];
export type UpdateConnectorTags =
    Database['public']['Tables']['connector_tags']['Update'];

export type Connectors = Database['public']['Tables']['connectors']['Row'];
export type InsertConnectors =
    Database['public']['Tables']['connectors']['Insert'];
export type UpdateConnectors =
    Database['public']['Tables']['connectors']['Update'];

export type Directives = Database['public']['Tables']['directives']['Row'];
export type InsertDirectives =
    Database['public']['Tables']['directives']['Insert'];
export type UpdateDirectives =
    Database['public']['Tables']['directives']['Update'];

export type Discovers = Database['public']['Tables']['discovers']['Row'];
export type InsertDiscovers =
    Database['public']['Tables']['discovers']['Insert'];
export type UpdateDiscovers =
    Database['public']['Tables']['discovers']['Update'];

export type DraftErrors = Database['public']['Tables']['draft_errors']['Row'];
export type InsertDraftErrors =
    Database['public']['Tables']['draft_errors']['Insert'];
export type UpdateDraftErrors =
    Database['public']['Tables']['draft_errors']['Update'];

export type DraftSpecs = Database['public']['Tables']['draft_specs']['Row'];
export type InsertDraftSpecs =
    Database['public']['Tables']['draft_specs']['Insert'];
export type UpdateDraftSpecs =
    Database['public']['Tables']['draft_specs']['Update'];

export type Drafts = Database['public']['Tables']['drafts']['Row'];
export type InsertDrafts = Database['public']['Tables']['drafts']['Insert'];
export type UpdateDrafts = Database['public']['Tables']['drafts']['Update'];

export type Evolutions = Database['public']['Tables']['evolutions']['Row'];
export type InsertEvolutions =
    Database['public']['Tables']['evolutions']['Insert'];
export type UpdateEvolutions =
    Database['public']['Tables']['evolutions']['Update'];

export type FlowCheckpointsV1 =
    Database['public']['Tables']['flow_checkpoints_v1']['Row'];
export type InsertFlowCheckpointsV1 =
    Database['public']['Tables']['flow_checkpoints_v1']['Insert'];
export type UpdateFlowCheckpointsV1 =
    Database['public']['Tables']['flow_checkpoints_v1']['Update'];

export type FlowMaterializationsV2 =
    Database['public']['Tables']['flow_materializations_v2']['Row'];
export type InsertFlowMaterializationsV2 =
    Database['public']['Tables']['flow_materializations_v2']['Insert'];
export type UpdateFlowMaterializationsV2 =
    Database['public']['Tables']['flow_materializations_v2']['Update'];

export type LiveSpecFlows =
    Database['public']['Tables']['live_spec_flows']['Row'];
export type InsertLiveSpecFlows =
    Database['public']['Tables']['live_spec_flows']['Insert'];
export type UpdateLiveSpecFlows =
    Database['public']['Tables']['live_spec_flows']['Update'];

export type LiveSpecs = Database['public']['Tables']['live_specs']['Row'];
export type InsertLiveSpecs =
    Database['public']['Tables']['live_specs']['Insert'];
export type UpdateLiveSpecs =
    Database['public']['Tables']['live_specs']['Update'];

export type PublicationSpecs =
    Database['public']['Tables']['publication_specs']['Row'];
export type InsertPublicationSpecs =
    Database['public']['Tables']['publication_specs']['Insert'];
export type UpdatePublicationSpecs =
    Database['public']['Tables']['publication_specs']['Update'];

export type Publications = Database['public']['Tables']['publications']['Row'];
export type InsertPublications =
    Database['public']['Tables']['publications']['Insert'];
export type UpdatePublications =
    Database['public']['Tables']['publications']['Update'];

export type RefreshTokens =
    Database['public']['Tables']['refresh_tokens']['Row'];
export type InsertRefreshTokens =
    Database['public']['Tables']['refresh_tokens']['Insert'];
export type UpdateRefreshTokens =
    Database['public']['Tables']['refresh_tokens']['Update'];

export type RoleGrants = Database['public']['Tables']['role_grants']['Row'];
export type InsertRoleGrants =
    Database['public']['Tables']['role_grants']['Insert'];
export type UpdateRoleGrants =
    Database['public']['Tables']['role_grants']['Update'];

export type StorageMappings =
    Database['public']['Tables']['storage_mappings']['Row'];
export type InsertStorageMappings =
    Database['public']['Tables']['storage_mappings']['Insert'];
export type UpdateStorageMappings =
    Database['public']['Tables']['storage_mappings']['Update'];

export type Tenants = Database['public']['Tables']['tenants']['Row'];
export type InsertTenants = Database['public']['Tables']['tenants']['Insert'];
export type UpdateTenants = Database['public']['Tables']['tenants']['Update'];

export type UserGrants = Database['public']['Tables']['user_grants']['Row'];
export type InsertUserGrants =
    Database['public']['Tables']['user_grants']['Insert'];
export type UpdateUserGrants =
    Database['public']['Tables']['user_grants']['Update'];

export type PublicDatabase = Database['public'];
export type PublicEnums = Database['public']['Enums'];
export type PublicFunctions = Database['public']['Functions'];
