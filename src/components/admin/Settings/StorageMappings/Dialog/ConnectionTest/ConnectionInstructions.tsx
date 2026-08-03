import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useMemo } from 'react';

import {
    useAwsArnsForBucket,
    useBucketPolicy,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/awsHooks';
import markdown from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/aws.md?raw';
import { MarkdownInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/MarkdownInstructions';

function Aws({ connection }: { connection: Connection }) {
    const { bucket, region } = connection.store;

    const allAwsArns = useAwsArnsForBucket(bucket);
    const policy = useBucketPolicy(bucket ?? '', allAwsArns);

    const variables = useMemo(
        () => ({
            bucket: bucket ?? '',
            region: region ?? '',
            bucketPolicy: policy.formatted,
            bucketPolicyCli: policy.cli,
        }),
        [bucket, region, policy]
    );

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}

function Azure({ connection }: { connection: Connection }) {
    const { storageAccountName, accountTenantId } = connection.store;
    const { azureApplicationClientId, azureApplicationName } =
        connection.dataPlane;

    const variables = useMemo(
        () => ({
            accountTenantId: accountTenantId ?? '',
            azureApplicationClientId: azureApplicationClientId ?? '',
            azureApplicationName: azureApplicationName ?? '',
            storageAccountName: storageAccountName ?? '',
        }),
        [
            accountTenantId,
            azureApplicationClientId,
            azureApplicationName,
            storageAccountName,
        ]
    );

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}

function Gcp({ connection }: { connection: Connection }) {
    const { bucket } = connection.store;
    const { gcpServiceAccountEmail } = connection.dataPlane;

    const variables = useMemo(
        () => ({
            bucket: bucket ?? '',
            gcpServiceAccountEmail: gcpServiceAccountEmail ?? '',
        }),
        [bucket, gcpServiceAccountEmail]
    );

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}

export function ConnectionInstructions({
    connection,
}: {
    connection: Connection;
}) {
    const { provider } = connection.store;

    switch (provider as CloudProvider) {
        case 'AWS':
            return <Aws connection={connection} />;
        case 'AZURE':
            return <Azure connection={connection} />;
        case 'GCP':
            return <Gcp connection={connection} />;
    }
    return null;
}
