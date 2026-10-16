import { useCallback, useState } from 'react';

import { Typography } from '@mui/material';

import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/ConnectionTest';
import { useConnectionTestContext } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionTestContext';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';
import CardWrapper from 'src/components/shared/CardWrapper';

export function ConnectionTestsCard() {
    const { testAllConnections } = useConnectionTestContext();
    const [isTesting, setIsTesting] = useState(false);

    const handleRunTestsClick = useCallback(async () => {
        try {
            setIsTesting(true);
            await testAllConnections();
        } finally {
            setIsTesting(false);
        }
    }, [testAllConnections]);

    return (
        <CardWrapper>
            <CardTitle
                title="Connection Tests"
                action="Run tests"
                actionDisabled={isTesting}
                onAction={handleRunTestsClick}
            />
            <Typography>All tests must pass before saving changes.</Typography>
            <ConnectionList />
        </CardWrapper>
    );
}
