import { Typography } from '@mui/material';

import {
    ConnectionList,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';

export function ConnectionTestsCard() {
    const { testConnections, connections, isTesting } = useConnectionTest();

    return (
        <>
            <CardTitle
                title="Connection Tests"
                action="Run tests"
                onAction={() => {
                    for (const connection of connections.filter(
                        (c) => !c.orphaned
                    )) {
                        void testConnections([connection]).catch((e) => {
                            // errors are surfaced in each accordion in the ConnectionTestList - safe to catch and ignore here
                        });
                    }
                }}
                actionDisabled={isTesting}
            />
            <Typography>All tests must pass before saving changes.</Typography>

            <ConnectionList autoTest />
        </>
    );
}
