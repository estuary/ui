import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import SingleLineCode from 'src/components/content/SingleLineCode';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';

export function GcpInstructions({ connection }: { connection: Connection }) {
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

            <MessageWithLink messageID="storageMappings.dialog.instructions.gcp.createBucketPrompt" />

            <Box component="ul" sx={{ my: 0 }}>
                <Box component="li">
                    <Typography>
                        <strong>
                            {intl.formatMessage({
                                id: 'storageMappings.dialog.instructions.bucketName',
                            })}
                        </strong>{' '}
                        <TechnicalEmphasis
                            enableBackground
                            sx={{ px: '4px', py: '2px', borderRadius: 2 }}
                        >
                            {bucket}
                        </TechnicalEmphasis>
                    </Typography>
                </Box>
            </Box>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.title',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.webUi',
                })}
            </Typography>

            <SingleLineCode value={gcpServiceAccountEmail ?? ''} />

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.webUi.selectRole',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.gcp.step2.cli',
                })}
            </Typography>

            <SingleLineCode
                value={`gsutil iam ch serviceAccount:${gcpServiceAccountEmail}:admin gs://${bucket}`}
            />
        </Stack>
    );
}
