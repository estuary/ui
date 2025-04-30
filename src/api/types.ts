import type { CONNECTOR_NAME } from 'src/api/shared';
import type { EntityWithCreateWorkflow, Schema } from 'src/types';

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

export interface ConnectorWithTagQuery {
    connector_tags: ConnectorTag[];
    id: string;
    detail: string;
    image_name: string;
    image: string;
    recommended: boolean;
    title: string;
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
