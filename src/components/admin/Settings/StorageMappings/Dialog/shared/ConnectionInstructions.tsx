import type { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { Connection } from './ConnectionTestContext';
import awsMd from './instructions/aws.md?raw';
import azureMd from './instructions/azure.md?raw';
import gcpMd from './instructions/gcp.md?raw';

import { MarkdownInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/MarkdownInstructions';

export function ConnectionInstructions({
    connection,
}: {
    connection: Connection;
}) {
    const { markdown, variables } = useMemo((): {
        markdown: string;
        variables: Record<string, string>;
    } => {
        const {
            awsIamUserArn,
            gcpServiceAccountEmail,
            azureApplicationClientId,
            azureApplicationName,
        } = connection.dataPlane;
        const {
            provider,
            region,
            bucket,
            storage_prefix,

            // Azure-specific fields
            container_name,
            storage_account_name,
            account_tenant_id,
        } = connection.store;

        switch (provider as CloudProvider) {
            case 'GCP': {
                return {
                    markdown: gcpMd,
                    variables: {
                        gcpServiceAccountEmail,
                        gsutilCommand: `gsutil iam ch serviceAccount:${gcpServiceAccountEmail}:admin gs://${bucket}`,
                    },
                };
            }
            case 'AWS': {
                const bucketPolicy = JSON.stringify(
                    {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Principal: { AWS: awsIamUserArn },
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
                    },
                    null,
                    2
                );

                return {
                    markdown: awsMd,
                    variables: { awsIamUserArn, bucketPolicy },
                };
            }
            case 'AZURE': {
                return {
                    markdown: azureMd,
                    variables: {
                        azureApplicationName,
                        storageAccountName,
                        container_name,
                    },
                };
            }
        }
    }, [connection]);

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}
