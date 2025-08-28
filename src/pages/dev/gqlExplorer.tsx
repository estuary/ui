import { Box } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import PageContainer from 'src/components/shared/PageContainer';
import { useUserStore } from 'src/context/User/useUserContextStore';

const sandbox = ['allow-scripts', 'allow-same-origin', 'allow-popups'].join(
    ' '
);
const ENDPOINT = `http://localhost:8675/graphiql`;

const GqlExplorer = () => {
    const session = useUserStore((state) => state.session);

    if (!session) {
        return null;
    }

    // token consumed in flow/crates/agent/src/api/public/graphql/mod.rs
    const iframeSrc = `${ENDPOINT}?access_token=${encodeURIComponent(session.access_token)}`;

    return (
        <PageContainer>
            <SingleLineCode
                value={iframeSrc}
                sx={{ maxWidth: undefined, width: '100%' }}
            />
            <Box sx={{ height: '75vh', minHeight: 250 }}>
                <iframe
                    src={iframeSrc}
                    sandbox={sandbox}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    title="GQL Explorer"
                />
            </Box>
        </PageContainer>
    );
};

export default GqlExplorer;
