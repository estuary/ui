import type { CONNECTOR_NAME } from 'src/services/supabase';
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
