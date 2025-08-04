import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';

import PageContainer from 'src/components/shared/PageContainer';

import 'graphiql/style.css';

import { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { stringifyJSON } from 'src/services/stringify';
import { getAuthHeader } from 'src/utils/misc-utils';

const GqlExplorer = () => {
    const theme = useTheme();
    const session = useUserStore((state) => state.session);

    const fetcher = useMemo(
        () =>
            createGraphiQLFetcher({
                url: import.meta.env.VITE_GQL_URL,
            }),
        []
    );

    return (
        <PageContainer>
            <Typography variant="h6">Graphiql v3</Typography>
            <Box sx={{ height: '79vh', minHeight: 250 }}>
                <GraphiQL
                    fetcher={fetcher}
                    defaultHeaders={stringifyJSON(
                        getAuthHeader(session?.access_token)
                    )}
                    forcedTheme={theme.palette.mode}
                />
            </Box>
        </PageContainer>
    );
};

export default GqlExplorer;
