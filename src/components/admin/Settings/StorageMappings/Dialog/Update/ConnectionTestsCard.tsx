import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    ConnectionList,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';

export function ConnectionTestsCard() {
    const intl = useIntl();
    const { testConnections, connections, isTesting } = useConnectionTest();

    return (
        <>
            <CardTitle
                title={intl.formatMessage({
                    id: 'storageMappings.dialog.connectionTests.title',
                })}
                action={intl.formatMessage({
                    id: 'storageMappings.dialog.connectionTests.runTests',
                })}
                onAction={() =>
                    void testConnections(
                        connections.filter((c) => !c.orphaned)
                    ).catch((e) => {
                        // errors are surfaced in each accordion in the ConnectionTestList - safe to catch and ignore here
                    })
                }
                actionDisabled={isTesting}
            />
            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.connectionTests.allMustPass',
                })}
            </Typography>

            <ConnectionList autoTest />
        </>
    );
}
