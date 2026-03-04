import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import { useIntl } from 'react-intl';

import { Box, Link, Stack, Typography, useTheme } from '@mui/material';

import { useAwsArnsForBucket, useBucketPolicy } from './AwsHooks';

import SingleLineCode from 'src/components/content/SingleLineCode';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';

const BucketAttribute = ({ children }: { children: React.ReactNode }) => (
    <TechnicalEmphasis
        enableBackground
        sx={{ px: '4px', py: '1px', borderRadius: 2 }}
    >
        {children}
    </TechnicalEmphasis>
);

export function AwsInstructions({ connection }: { connection: Connection }) {
    const intl = useIntl();
    const theme = useTheme();
    const { bucket, region } = connection.store;
    const allAwsArns = useAwsArnsForBucket(bucket);
    const policy = useBucketPolicy(bucket ?? '', allAwsArns);

    return (
        <Stack spacing={2}>
            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.step1.createBucket',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.step1.createBucket.prompt',
                })}
                <Link
                    href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.instructions.aws.createBucketLink',
                    })}
                </Link>
            </Typography>

            <Box component="ul" sx={{ my: 0 }}>
                <Box component="li">
                    <Typography>
                        <strong>
                            {intl.formatMessage({
                                id: 'storageMappings.dialog.instructions.bucketName',
                            })}
                        </strong>{' '}
                        <BucketAttribute>{bucket}</BucketAttribute>
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        <strong>
                            {intl.formatMessage({
                                id: 'storageMappings.dialog.instructions.region',
                            })}
                        </strong>{' '}
                        <BucketAttribute>{region}</BucketAttribute>
                    </Typography>
                </Box>
            </Box>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.aws.step2.title',
                })}
            </Typography>

            <Typography variant="subtitle2" fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.optionA',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.aws.step2.webUi',
                })}
            </Typography>

            <Box
                component="pre"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: codeBackground[theme.palette.mode],
                    overflow: 'auto',
                    fontFamily: 'monospace',
                }}
            >
                {policy.formatted}
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mx: 0,
                    borderLeft: '4px solid',
                    borderColor: 'divider',
                    pl: 2,
                }}
            >
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.aws.step2.note',
                })}
            </Typography>

            <Typography variant="subtitle2" fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.optionB',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.pasteInTerminal',
                })}
            </Typography>

            <SingleLineCode
                value={`aws s3api put-bucket-policy --bucket ${bucket} --policy '${policy.cli}'`}
            />
        </Stack>
    );
}
