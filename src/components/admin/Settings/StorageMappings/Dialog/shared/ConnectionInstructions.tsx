import type { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { MarkdownInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/MarkdownInstructions';

import awsMd from './instructions/aws.md?raw';
import azureMd from './instructions/azure.md?raw';
import gcpMd from './instructions/gcp.md?raw';

interface ConnectionInstructionsProps {
    provider: CloudProvider;
    bucket: string;
    iamArn: string;
    gcpServiceAccountEmail: string;
    storageAccountName?: string;
    azureApplicationClientId?: string;
    azureApplicationName?: string;
}

export function ConnectionInstructions({
    provider,
    bucket,
    iamArn,
    gcpServiceAccountEmail,
    storageAccountName,
    azureApplicationClientId,
    azureApplicationName,
}: ConnectionInstructionsProps) {
    const { markdown, variables } = useMemo((): {
        markdown: string;
        variables: Record<string, string>;
    } => {
        switch (provider) {
            case 'GCP': {
                const serviceAccount =
                    gcpServiceAccountEmail ||
                    'flow@estuary-data.iam.gserviceaccount.com';

                return {
                    markdown: gcpMd,
                    variables: {
                        serviceAccount,
                        gsutilCommand: `gsutil iam ch serviceAccount:${serviceAccount}:admin gs://${bucket || 'your-bucket'}`,
                    },
                };
            }
            case 'AWS': {
                const arn =
                    iamArn ||
                    'arn:aws:iam::123456789012:role/estuary-flow-role';

                const bucketPolicy = JSON.stringify(
                    {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Principal: { AWS: arn },
                                Action: [
                                    's3:GetObject',
                                    's3:PutObject',
                                    's3:DeleteObject',
                                    's3:ListBucket',
                                    's3:GetBucketPolicy',
                                ],
                                Resource: [
                                    `arn:aws:s3:::${bucket || 'your-bucket'}`,
                                    `arn:aws:s3:::${bucket || 'your-bucket'}/*`,
                                ],
                            },
                        ],
                    },
                    null,
                    2
                );

                return {
                    markdown: awsMd,
                    variables: { iamArn: arn, bucketPolicy },
                };
            }
            case 'AZURE': {
                const clientId =
                    azureApplicationClientId ||
                    '00000000-0000-0000-0000-000000000000';
                const appName = azureApplicationName || 'UH OH';
                const consentUrl = `https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id=${clientId}&scope=https://storage.azure.com/.default`;

                return {
                    markdown: azureMd,
                    variables: {
                        appName,
                        consentUrl,
                        storageAccountNameFragment: storageAccountName
                            ? `\`${storageAccountName}\``
                            : '',
                        containerFragment: bucket
                            ? `Container: \`${bucket}\``
                            : '',
                    },
                };
            }
        }
    }, [
        provider,
        bucket,
        iamArn,
        gcpServiceAccountEmail,
        storageAccountName,
        azureApplicationClientId,
        azureApplicationName,
    ]);

    return <MarkdownInstructions markdown={markdown} variables={variables} />;
}
