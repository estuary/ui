import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { AwsInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/instructions/AwsInstructions';
import { AzureInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/instructions/AzureInstructions';
import { GcpInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/instructions/GcpInstructions';

export function ConnectionInstructions({
    connection,
}: {
    connection: Connection;
}) {
    switch (connection.store.provider as CloudProvider) {
        case 'GCP':
            return <GcpInstructions connection={connection} />;
        case 'AWS':
            return <AwsInstructions connection={connection} />;
        case 'AZURE':
            return <AzureInstructions connection={connection} />;
    }
}
