import SearchIcon from '@mui/icons-material/Search';
import { Box, TextField, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { ChangeEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useChangeSetStore, {
    ChangeSetState,
    Entity,
} from 'stores/ChangeSetStore';
import EntityTable from '../components/tables/EntityTable';

const selectors = {
    captures: (state: ChangeSetState) => state.captures,
    newChangeCount: (state: ChangeSetState) => state.newChangeCount,
    resetNewChangeCount: (state: ChangeSetState) => state.resetNewChangeCount,
};

const Builds = () => {
    const [filteredCaptures, setFilteredCaptures] = useState<Entity[] | null>(
        null
    );

    const newChangeCount = useChangeSetStore(selectors.newChangeCount);
    const resetNewChangeCount = useChangeSetStore(
        selectors.resetNewChangeCount
    );
    const captureState = useChangeSetStore(selectors.captures);

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
                <Typography variant="h6" sx={{ my: 2 }}>
                    <FormattedMessage id="entityTable.header" />
                </Typography>

                <Toolbar
                    disableGutters
                    sx={{ mb: 2, justifyContent: 'space-between' }}
                >
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
