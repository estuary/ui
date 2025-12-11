import type { CONNECTOR_NAME } from 'src/api/shared';
import type { Entity, EntityWithCreateWorkflow, Schema } from 'src/types';

export interface BaseConnectorTag {
    id: string;
    connector_id: string;
    image_tag: string;
}

export interface ConnectorTag extends BaseConnectorTag {
    documentation_url: string;
    endpoint_spec_schema: Schema;
    image_name: string;
    protocol: EntityWithCreateWorkflow;
    title: string;
}

// This interface is only used to type the data returned by getSchema_Resource.
export interface ConnectorTagResourceData {
    connector_id: string;
    default_capture_interval: string | null;
    disable_backfill: boolean;
    resource_spec_schema: Schema;
}

export interface ConnectorWithTag {
    connector_tags: ConnectorTag[];
    id: string;
    detail: string;
    image_name: string;
    image: string;
    recommended: boolean;
    title: string;
}

export interface ConnectorWithTagQuery extends ConnectorWithTag {
    // FILTERING TYPES HACK
    ['connector_tags.protocol']: undefined;
    ['connector_tags.image_tag']: undefined;
    [CONNECTOR_NAME]: undefined;
}

export interface ConnectorsQuery_DetailsForm {
    id: string;
    image_name: string;
    image: string;
    connector_tags: BaseConnectorTag[];
}

export interface DraftSpecData {
    spec: any;
    catalog_name?: string;
    expect_pub_id?: string;
    detail?: string;
}

export interface DraftSpecUpdateMatchData {
    draft_id: string | null;
    catalog_name?: string;
    expect_pub_id?: string;
    spec_type?: Entity | null;
}

export interface DraftSpecCreateMatchData {
    draft_id: string | null;
    catalog_name: string;
    spec: any;
    spec_type?: Entity | null;
    expect_pub_id?: string;
}

// Evolution success will return this object in job_status['evolved_collections']
export interface EvolvedCollections {
    new_name: string;
    old_name: string;
    updated_captures: string[];
    updated_materializations: string[];
}

export interface DraftSpecsExtQuery_BySpecTypeReduced {
    draft_id: string;
    catalog_name: string;
    spec_type: string;
    spec: any;
}

export interface MassUpdateMatchData {
    catalog_name: string;
    spec: any;
}

export interface MassCreateDraftSpecsData {
    catalog_name: string;
    expect_pub_id: string;
    spec: any;
}
