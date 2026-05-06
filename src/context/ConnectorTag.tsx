import type { ConnectorTagDataQuery } from 'src/gql-types/graphql';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { useClient } from 'urql';

import { CONNECTOR_TAG_QUERY } from 'src/api/gql/connectors';
import ErrorComponent from 'src/components/shared/Error';
import { useEntityWorkflow } from 'src/context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { parseConnectorImagePath } from 'src/utils/connector-utils';
import { hasLength } from 'src/utils/misc-utils';

export type ConnectorTagData = NonNullable<
    ConnectorTagDataQuery['connectorSpec']
> & {
    connector: Pick<
        NonNullable<ConnectorTagDataQuery['connector']>,
        'id' | 'imageName' | 'logoUrl' | 'title'
    >;
};

// `applicable: false` means the workflow does not use a connector (transformations).
// `applicable: true` means the connector tag was fetched and is available.
// `null` context means the fetch is still in progress.
export type ConnectorTagState =
    | { applicable: false }
    | { applicable: true; data: ConnectorTagData };

const ConnectorTagContext = createContext<ConnectorTagState | null>(null);

// When applicable - ALWAYS use within ConnectorSelectedGuard to ensure we have valid values in URL
export const ConnectorTagProvider = ({ children }: BaseComponentProps) => {
    const connectorImagePath = useGlobalSearchParams(
        GlobalSearchParams.CONNECTOR_IMAGE_PATH
    );
    const client = useClient();
    const intl = useIntl();
    const workflow = useEntityWorkflow();

    const [connectorTagState, setConnectorTagState] =
        useState<ConnectorTagState | null>(null);
    const [fetchError, setFetchError] = useState<boolean | null>(false);

    useEffect(() => {
        if (workflow === 'collection_create') {
            setConnectorTagState({ applicable: false });
            return;
        }

        if (!hasLength(connectorImagePath)) {
            logRocketEvent('Connectors:fetch', {
                noImagePath: true,
                status: 'unknown',
            });
            return;
        }

        // We check the parsing to be extra safe. The wrapper ConnectorSelectedGuard also
        //  makes sure the format is good.
        const parsed = parseConnectorImagePath(connectorImagePath);
        if (!parsed) {
            logRocketEvent('Connectors:fetch', {
                connectorImagePath,
                invalidImagePath: true,
                status: 'invalid',
            });
            setFetchError(true);
            return;
        }
        const { imageName, imageTag: requestedTag } = parsed;

        client
            .query(
                CONNECTOR_TAG_QUERY,
                { imageName, fullImageName: connectorImagePath },
                { requestPolicy: 'network-only' }
            )
            .toPromise()
            .then(({ data, error }) => {
                const connector = data?.connector;
                const spec = data?.connectorSpec;

                if (error || !connector || !spec) {
                    logRocketEvent('Connectors:fetch', {
                        noConnector: !connector,
                        noSpec: !spec,
                        status: 'failure',
                    });
                    setFetchError(true);
                    return;
                }

                if (spec.imageTag !== requestedTag) {
                    logRocketEvent('Connectors:fetch', {
                        requestedTag,
                        resolvedTag: spec.imageTag,
                        status: 'tag_fallback',
                    });
                }

                setConnectorTagState({
                    applicable: true,
                    data: {
                        ...spec,
                        connector: {
                            id: connector.id,
                            imageName: connector.imageName,
                            logoUrl: connector.logoUrl,
                            title: connector.title,
                        },
                    },
                });
            })
            .catch(() => {
                logRocketEvent('Connectors:fetch', {
                    status: 'exception',
                });
                setFetchError(true);
            });
    }, [client, connectorImagePath, workflow]);

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

    if (!connectorTagState) {
        return null;
    }

    return (
        <ConnectorTagContext.Provider value={connectorTagState}>
            {children}
        </ConnectorTagContext.Provider>
    );
};

export const useConnectorTag = (): ConnectorTagData => {
    const context = useContext(ConnectorTagContext);

    if (!context?.applicable) {
        throw new Error(
            'useConnectorTag must be used within a ConnectorTagProvider with an applicable connector'
        );
    }

    return context.data;
};

// Use when the caller can safely skip the tag (BindingHydrator). This way we do not
//  have to write a bunch of null safe code in the flows that will always require a connector.
export const useConnectorTag_nullable = (): ConnectorTagState | null => {
    return useContext(ConnectorTagContext);
};
