import { Box, Link, Typography } from '@mui/material';

import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionList';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import { cardHeaderSx } from 'src/context/Theme';

export function ConnectionTests() {
    const { testConnections, isTesting, connections } = useConnectionTest();

    return (
        <>
            <Box
                sx={{
                    ...cardHeaderSx,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography sx={cardHeaderSx}>Connection Tests</Typography>
                <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    disabled={isTesting}
                    onClick={() =>
                        void testConnections(connections).catch(() => {})
                    }
                    sx={{
                        opacity: isTesting ? 0.5 : 1,
                        pointerEvents: isTesting ? 'none' : 'auto',
                    }}
                >
                    Run tests
                </Link>
            </Box>
            <Typography>
                Each data plane must be able to connect to each storage
                location. New connections must pass before saving changes.
            </Typography>
            <ConnectionList autoTest />
        </>
    );
}
