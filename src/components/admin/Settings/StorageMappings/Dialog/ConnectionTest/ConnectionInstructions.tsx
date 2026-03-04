import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useMemo } from 'react';

import { useAwsArnsForBucket } from './instructions/AwsHooks';

import awsMd from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/aws.md?raw';
import azureMd from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/azure.md?raw';
import gcpMd from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/gcp.md?raw';
import { MarkdownInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/MarkdownInstructions';

export function ConnectionInstructions({
    connection,
}: {
    connection: Connection;
}) {
    const { provider, bucket } = connection.store;
    const allAwsArns = useAwsArnsForBucket(
        provider === 'AWS' ? bucket : undefined
    );

    const { markdown, variables } = useMemo((): {
        markdown: string;
        variables: Record<string, string>;
    } => {
        const {
            gcpServiceAccountEmail,
            azureApplicationClientId,
            azureApplicationName,
        } = connection.dataPlane;
        const {
            region,

            // Azure-specific fields
            containerName,
            storageAccountName,
            accountTenantId,
        } = connection.store;

        switch (provider as CloudProvider) {
            case 'GCP': {
                return {
                    markdown: gcpMd,
                    variables: {
                        bucket: bucket ?? '',
                        gcpServiceAccountEmail: gcpServiceAccountEmail ?? '',
                        gsutilCommand: `gsutil iam ch serviceAccount:${gcpServiceAccountEmail}:admin gs://${bucket}`,
                    },
                };
            }
            case 'AWS': {
                const principal =
                    allAwsArns.length === 1 ? allAwsArns[0] : allAwsArns;

                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: { AWS: principal },
                            Action: [
                                's3:GetObject',
                                's3:PutObject',
                                's3:DeleteObject',
                                's3:ListBucket',
                                's3:GetBucketPolicy',
                            ],
                            Resource: [
                                `arn:aws:s3:::${bucket}`,
                                `arn:aws:s3:::${bucket}/*`,
                            ],
                        },
                    ],
                };

                return {
                    markdown: awsMd,
                    variables: {
                        bucketPolicy: JSON.stringify(policy, null, 2),
                        bucketPolicyCli: JSON.stringify(policy),
                        bucket: bucket ?? '',
                        region: region ?? '',
                    },
                };
            }
            case 'AZURE': {
                return {
                    markdown: azureMd,
                    variables: {
                        azureApplicationClientId:
                            azureApplicationClientId ?? '',
                        azureApplicationName: azureApplicationName ?? '',
                        storageAccountName: storageAccountName ?? '',
                        containerName: containerName ?? '',
                        accountTenantId: accountTenantId ?? '',
                    },
                };
            }
        }
    }, [connection, provider, bucket, allAwsArns]);

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}
