import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import { useIntl } from 'react-intl';

import { Box, Link, Stack, Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';

export function GcpInstructions({
    connection,
}: {
    connection: Connection;
}) {
    const intl = useIntl();
    const { bucket } = connection.store;
    const { gcpServiceAccountEmail } = connection.dataPlane;

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
                    href="https://cloud.google.com/storage/docs/creating-buckets"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.instructions.gcp.createBucketLink',
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
                        <TechnicalEmphasis>
                            &ldquo;{bucket}&rdquo;
                        </TechnicalEmphasis>
                    </Typography>
                </Box>
            </Box>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.title',
                })}
            </Typography>

            <Typography variant="subtitle2" fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.optionA',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.webUi.navigate',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.webUi.paste',
                })}
            </Typography>

            <SingleLineCode value={gcpServiceAccountEmail ?? ''} />

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.webUi.selectRole',
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
                value={`gsutil iam ch serviceAccount:${gcpServiceAccountEmail}:admin gs://${bucket}`}
            />
        </Stack>
    );
}
