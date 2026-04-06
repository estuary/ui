import type { SingleConnectorQuery } from 'src/gql-types/graphql';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { useClient } from 'urql';

import { CONNECTOR_BY_ID_QUERY } from 'src/api/gql/connectors';
import ErrorComponent from 'src/components/shared/Error';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

export type ConnectorTagData = NonNullable<
    NonNullable<SingleConnectorQuery['connector']>['connectorTag']
> & {
    connector: Pick<
        NonNullable<SingleConnectorQuery['connector']>,
        'id' | 'imageName' | 'logoUrl' | 'title'
    >;
};

const ConnectorTagContext = createContext<ConnectorTagData | null>(null);

export const ConnectorTagProvider = ({ children }: BaseComponentProps) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
    const client = useClient();
    const intl = useIntl();

    const [connectorTag, setConnectorTag] = useState<ConnectorTagData | null>(
        null
    );
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasLength(connectorId)) {
            return;
        }

        client
            .query(
                CONNECTOR_BY_ID_QUERY,
                { id: connectorId },
                { requestPolicy: 'network-only' }
            )
            .toPromise()
            .then(({ data, error }) => {
                const connector = data?.connector;
                const connectorTagData = connector?.connectorTag;

                if (error || !connector || !connectorTagData) {
                    logRocketConsole('Failed to fetch connector tag', error);
                    setFetchError('Failed to load connector information');
                    return;
                }

                setConnectorTag({
                    ...connectorTagData,
                    connector: {
                        id: connector.id,
                        imageName: connector.imageName,
                        logoUrl: connector.logoUrl,
                        title: connector.title,
                    },
                });
            });
    }, [client, connectorId]);

    if (fetchError) {
        return (
            <ErrorComponent
                condensed
                error={{
                    ...BASE_ERROR,
                    message: intl.formatMessage({
                        id: 'workflow.connectorTag.error.message',
                    }),
                }}
            />
        );
    }

    // While loading we don't want to show anything
    if (!connectorTag) {
        return null;
    }

    return (
        <ConnectorTagContext.Provider value={connectorTag}>
            {children}
        </ConnectorTagContext.Provider>
    );
};

export const useConnectorTag = (): ConnectorTagData => {
    const context = useContext(ConnectorTagContext);

    if (!context) {
        throw new Error(
            'useConnectorTag must be used within a ConnectorTagProvider'
        );
    }

    return context;
};
