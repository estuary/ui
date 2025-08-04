import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';

import PageContainer from 'src/components/shared/PageContainer';

import 'graphiql/style.css';

import { Box } from '@mui/material';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { stringifyJSON } from 'src/services/stringify';

const fetcher = createGraphiQLFetcher({ url: import.meta.env.VITE_GQL_URL });

const GqlExplorer = () => {
    const session = useUserStore((state) => state.session);

    return (
        <PageContainer>
            <Box sx={{ height: 1000 }}>
                <GraphiQL
                    fetcher={fetcher}
                    defaultHeaders={stringifyJSON({
                        Authentication: `Bearer ${session?.access_token}`,
                    })}
                />
            </Box>
        </PageContainer>
    );
};

export default GqlExplorer;
