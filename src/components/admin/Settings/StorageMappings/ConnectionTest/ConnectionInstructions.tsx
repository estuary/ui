import type { StorageMappingConnection } from 'src/api/gql/storageMappings';

import { useMemo } from 'react';

import {
    useAwsArnsForBucket,
    useBucketPolicy,
} from 'src/components/admin/Settings/StorageMappings/ConnectionTest/awsHooks';
import awsMarkdown from 'src/components/admin/Settings/StorageMappings/ConnectionTest/instructions/aws.md?raw';
import azureMarkdown from 'src/components/admin/Settings/StorageMappings/ConnectionTest/instructions/azure.md?raw';
import gcpMarkdown from 'src/components/admin/Settings/StorageMappings/ConnectionTest/instructions/gcp.md?raw';
import { MarkdownInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/MarkdownInstructions';

function Aws({ connection }: { connection: StorageMappingConnection }) {
    const { bucket, region } = connection.fragmentStore;

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

    return (
        <MarkdownInstructions markdown={awsMarkdown} variables={variables} />
    );
}

function Azure({ connection }: { connection: StorageMappingConnection }) {
    const { storageAccountName, accountTenantId } = connection.fragmentStore;
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

    return (
        <MarkdownInstructions markdown={azureMarkdown} variables={variables} />
    );
}

function Gcp({ connection }: { connection: StorageMappingConnection }) {
    const { bucket } = connection.fragmentStore;
    const { gcpServiceAccountEmail } = connection.dataPlane;

    const variables = useMemo(
        () => ({
            bucket: bucket ?? '',
            gcpServiceAccountEmail: gcpServiceAccountEmail ?? '',
        }),
        [bucket, gcpServiceAccountEmail]
    );

    return (
        <MarkdownInstructions markdown={gcpMarkdown} variables={variables} />
    );
}

export function ConnectionInstructions({
    connection,
}: {
    connection: StorageMappingConnection;
}) {
    const { provider } = connection.fragmentStore;

    switch (provider) {
        case 'S3':
            return <Aws connection={connection} />;
        case 'AZURE':
            return <Azure connection={connection} />;
        case 'GCS':
            return <Gcp connection={connection} />;
        default:
            return null;
    }
}
