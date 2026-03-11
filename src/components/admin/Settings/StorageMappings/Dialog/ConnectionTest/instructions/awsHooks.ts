import { useMemo } from 'react';

import { useDataPlanes } from 'src/api/gql/dataPlanes';
import { useStorageMappings } from 'src/api/gql/storageMappings';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

/**
 * Collects all AWS IAM ARNs that need access to the given bucket,
 * from both pending (unsaved) connections and existing storage mappings.
 */
export function useAwsArnsForBucket(
    bucket: string | null | undefined
): string[] {
    const { connections: pendingConnections } = useConnectionTest();
    const { storageMappings } = useStorageMappings();
    const { dataPlanes } = useDataPlanes();

    return useMemo(() => {
        if (!bucket) return [];

        const arns = new Set<string>();

        for (const c of pendingConnections) {
            if (
                c.store.provider === 'AWS' &&
                c.store.bucket === bucket &&
                c.dataPlane.awsIamUserArn
            ) {
                arns.add(c.dataPlane.awsIamUserArn);
            }
        }

        for (const mapping of storageMappings) {
            const usesSameBucket = mapping.spec.fragmentStores.some(
                (s) => s.provider === 'AWS' && s.bucket === bucket
            );

            if (usesSameBucket) {
                for (const dpName of mapping.spec.dataPlanes) {
                    const dp = dataPlanes.find((d) => d.name === dpName);
                    if (dp?.awsIamUserArn) {
                        arns.add(dp.awsIamUserArn);
                    }
                }
            }
        }

        return [...arns];
    }, [bucket, pendingConnections, storageMappings, dataPlanes]);
}

export function useBucketPolicy(bucket: string, allAwsArns: string[]) {
    return useMemo(() => {
        const principal = allAwsArns.length === 1 ? allAwsArns[0] : allAwsArns;

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
            formatted: JSON.stringify(policy, null, 2),
            cli: JSON.stringify(policy),
        };
    }, [bucket, allAwsArns]);
}
