import SearchIcon from '@mui/icons-material/Search';
import { Box, TextField, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import EntityTable from 'components/tables/EntityTable';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';
import { Entity } from 'stores/PublicationStore';
import { useQuery, useSelect } from 'supabase-swr';

interface ConnectorInfo {
    detail: string;
    image_name: string;
}

const DISCOVERS_QUERY = `
    capture_name, 
    updated_at, 
    job_status->>type, 
    catalog_spec, 
    id
`;

const CONNECTORS_QUERY = `detail, image_name`;

const Builds = () => {
    const [filteredCaptures, setFilteredCaptures] = useState<Entity[] | null>(
        null
    );

    const connectorsQuery = useQuery<any>(
        TABLES.CONNECTORS,
        { columns: CONNECTORS_QUERY },
        []
    );
    const { data: connectors } = useSelect(connectorsQuery, {});

    const tagsQuery = useQuery<any>(
        TABLES.DISCOVERS,
        {
            columns: DISCOVERS_QUERY,
            filter: (query) => query.eq('job_status->>type', 'success'),
        },
        []
    );
    const { data: discovers } = useSelect(tagsQuery, {});

    let captures: Entity[] = [];

    if (discovers && connectors) {
        captures = discovers.data.map((discover) => {
            const catalogNamespace: string = discover.capture_name;
            const dateCreated: string = discover.updated_at;
            const catalogResources = discover.catalog_spec.resources;

            // TODO: Improve logic used to retrieve the endpoint description.
            const resourceKey = Object.keys(catalogResources).find((fileUrl) =>
                fileUrl.includes('.flow.json')
            );

            const rawConnectorImg: string =
                catalogResources[`${resourceKey}`].content.captures[
                    `${catalogNamespace}`
                ].endpoint.connector.image;

            const [connectorImg]: string[] = rawConnectorImg.split(':', 1);

            const connectorInfo: ConnectorInfo | undefined =
                connectors.data.find(
                    (connector) => connector.image_name === connectorImg
                );

            return {
                metadata: {
                    deploymentStatus:
                        discover.type === 'success' ? 'ACTIVE' : 'INACTIVE',
                    name: catalogNamespace.substring(
                        catalogNamespace.lastIndexOf('/') + 1,
                        catalogNamespace.length
                    ),
                    catalogNamespace,
                    connectorType: connectorInfo
                        ? connectorInfo.detail
                        : 'Unknown',
                    dateCreated,
                },
                resources: {},
            };
        });
    }

    const handlers = {
        change: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const query = event.target.value;

            if (query === '') {
                setFilteredCaptures(null);
            } else {
                const queriedCaptures: Entity[] = captures.filter(
                    ({ metadata: { catalogNamespace } }) =>
                        catalogNamespace.includes(query)
                );

                setFilteredCaptures(queriedCaptures);
            }
        },
    };

    return (
        <PageContainer>
            <Box sx={{ mx: 2 }}>
                <Toolbar
                    disableGutters
                    sx={{ mb: 2, justifyContent: 'space-between' }}
                >
                    <Typography variant="h6">
                        <FormattedMessage id="captureTable.header" />
                    </Typography>

                    <Box
                        margin={0}
                        sx={{ display: 'flex', alignItems: 'flex-end' }}
                    >
                        <SearchIcon sx={{ mb: 0.9, mr: 0.5, fontSize: 18 }} />
                        <TextField
                            id="capture-search-box"
                            label="Filter Namespaces"
                            variant="standard"
                            onChange={handlers.change}
                        />
                    </Box>
                </Toolbar>
            </Box>

            <EntityTable entities={filteredCaptures ?? captures} />
        </PageContainer>
    );
};

export default Builds;
