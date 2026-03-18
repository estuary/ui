import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import { AwsInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/AwsInstructions';
import { AzureInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/AzureInstructions';
import { GcpInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/GcpInstructions';
import { DataPlaneCloudProvider as CloudProvider } from 'src/gql-types/graphql';

export function ConnectionInstructions({
    connection,
}: {
    connection: Connection;
}) {
    const { provider } = connection.store;

    switch (provider as CloudProvider) {
        case 'AWS':
            return <AwsInstructions connection={connection} />;
        case 'AZURE':
            return <AzureInstructions connection={connection} />;
        case 'GCP':
            return <GcpInstructions connection={connection} />;
    }
    return null;
}
