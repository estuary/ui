import { Typography } from '@mui/material';

import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';
import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionList';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

export function ConnectionTests() {
    const { testConnections, isTesting, connections } = useConnectionTest();

    return (
        <>
            <CardTitle
                title="Connection Tests"
                action="Run tests"
                onAction={() =>
                    void testConnections(connections).catch(() => {})
                }
                actionDisabled={isTesting}
            />
            <Typography>
                All connections must pass before saving changes.
            </Typography>
            <ConnectionList autoTest />
        </>
    );
}
