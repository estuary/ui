import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

export type AlertType =
    | 'auto_discover_failed'
    | 'background_publication_failed'
    | 'shard_failed'
    | 'data_movement_stalled'
    | 'free_trial'
    | 'free_trial_ending'
    | 'free_trial_stalled'
    | 'missing_payment_method';

export interface AlertDetailsRecipients {
    email: string;
    full_name?: string;
}

export interface AlertDetails {
    spec_type: ShardEntityTypes;
    error?: string;
    evaluation_interval?: string;
    recipients?: AlertDetailsRecipients[];
}

export interface AlertNode {
    alertType: AlertType;
    firedAt: string;
    alertDetails: AlertDetails;
    catalogName: string;
    resolvedAt?: string;
}

export interface AlertNodeEdge {
    cursor: string;
    node: AlertNode;
}

export interface LiveSpecNode {
    activeAlerts?: AlertNode[];
    alertHistory?: {
        edges: AlertNodeEdge[];
        pageInfo: PageInfo;
    };
}

// PAGINATION

export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
}

export type PageInfoReverse = Pick<
    PageInfo,
    'hasPreviousPage' | 'startCursor' | 'endCursor'
>;

// VARIABLES

export interface LiveSpecVariables {
    catalogName: string | undefined;
}

export interface AlertsVariables {
    active: boolean | undefined;
    prefix: string | undefined;
}

// TODO (typing) - we need more versions of pagination
//  as some endpoints only support before/last (AlertHistory)
export interface PaginationVariables {
    before?: string | undefined;
    after?: string | undefined;
    first?: number | undefined;
    last?: number | undefined;
}

export type WithPagination<T> = T & PaginationVariables;

// QUERY RESPONSES

export type DefaultAlertingQueryResponse = {
    alerts: {
        edges: {
            node: AlertNode;
        }[];
        pageInfo?: PageInfoReverse;
    };
};
export interface ActiveAlertCountQueryResponse {
    liveSpecs: {
        edges: {
            cursor: string;
            node: {
                activeAlerts: {
                    alertType: Pick<AlertNode, 'alertType'>;
                }[];
            };
        }[];
    };
}

export type AlertHistoryForTaskQueryResponse = DefaultAlertingQueryResponse;
export type AlertingOverviewQueryResponse = AlertHistoryForTaskQueryResponse;

export interface AlertHistoryQueryResponse {
    liveSpecs: {
        edges: {
            node: LiveSpecNode;
        }[];
    };
}

export interface AuthRolesNode {
    prefix: string;
    userCapability: string;
}
export interface AuthRolesQueryResponse {
    prefixes: {
        edges: {
            node: AuthRolesNode;
        }[];
        pageInfo?: Pick<PageInfo, 'hasNextPage' | 'endCursor'>;
    };
}
