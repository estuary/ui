import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import {
    Box,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useAwsArnsForBucket,
    useBucketPolicy,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/instructions/awsHooks';
import MessageWithLink from 'src/components/content/MessageWithLink';
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

            <MessageWithLink messageID="storageMappings.dialog.instructions.aws.createBucketPrompt" />

            <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2 }}>
                <ListItem disablePadding sx={{ display: 'list-item' }}>
                    <ListItemText
                        primary={
                            <>
                                <strong>
                                    {intl.formatMessage({
                                        id: 'storageMappings.dialog.instructions.bucketName',
                                    })}
                                </strong>{' '}
                                <BucketAttribute>{bucket}</BucketAttribute>
                            </>
                        }
                    />
                </ListItem>
                <ListItem disablePadding sx={{ display: 'list-item' }}>
                    <ListItemText
                        primary={
                            <>
                                <strong>
                                    {intl.formatMessage({
                                        id: 'storageMappings.dialog.instructions.region',
                                    })}
                                </strong>{' '}
                                <BucketAttribute>{region}</BucketAttribute>
                            </>
                        }
                    />
                </ListItem>
            </List>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.aws.step2.title',
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
                    fontSize: 12,
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

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.aws.step2.cli',
                })}
            </Typography>

            <SingleLineCode
                value={`aws s3api put-bucket-policy --bucket ${bucket} --policy '${policy.cli}'`}
            />
        </Stack>
    );
}
