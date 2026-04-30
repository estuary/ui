import type { Entity } from 'src/types';
import type { AlertSubscription } from 'src/types/gql';

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

export interface LiveSpecsExtQuery_GroupedUpdates {
    catalog_name: string;
    id: string;
}

export type ReducedAlertSubscription = Pick<
    AlertSubscription,
    'alertTypes' | 'catalogPrefix' | 'email' | 'updatedAt'
>;

export interface ReducedAlertSubscriptionQueryResponse {
    alertSubscriptions: ReducedAlertSubscription[];
}
