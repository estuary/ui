import SearchIcon from '@mui/icons-material/Search';
import { Box, TextField, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import EntityTable from 'components/tables/EntityTable';
import { ChangeEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import usePublicationStore, {
    Entity,
    PublicationState,
} from 'stores/PublicationStore';

const selectors = {
    captures: (state: PublicationState) => state.captures,
    updateDeploymentStatus: (state: PublicationState) =>
        state.updateDeploymentStatus,
    newChangeCount: (state: PublicationState) => state.newChangeCount,
    resetNewChangeCount: (state: PublicationState) => state.resetNewChangeCount,
};

const Builds = () => {
    const [filteredCaptures, setFilteredCaptures] = useState<Entity[] | null>(
        null
    );

    const updateCaptureDeploymentStatus = usePublicationStore(
        selectors.updateDeploymentStatus
    );
    const newChangeCount = usePublicationStore(selectors.newChangeCount);
    const resetNewChangeCount = usePublicationStore(
        selectors.resetNewChangeCount
    );
    const captureState = usePublicationStore(selectors.captures);

    const captures = Object.values(captureState);

    const handlers = {
        change: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const query = event.target.value;

            if (query === '') {
                setFilteredCaptures(null);
            } else {
                const queriedCatalogNamespaces = Object.keys(
                    captureState
                ).filter((catalogNamespace) =>
                    catalogNamespace.includes(query)
                );

                const queriedCaptures: Entity[] = queriedCatalogNamespaces.map(
                    (key) => captureState[key]
                );

                setFilteredCaptures(queriedCaptures);
            }
        },
    };

    useEffect(() => {
        if (newChangeCount > 0) {
            resetNewChangeCount();
        }
    }, [newChangeCount, resetNewChangeCount]);

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

            <EntityTable
                entities={filteredCaptures ?? captures}
                updateDeploymentStatus={updateCaptureDeploymentStatus}
            />
        </PageContainer>
    );
};

export default Builds;
