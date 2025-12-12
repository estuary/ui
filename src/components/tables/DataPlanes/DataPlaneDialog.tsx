import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useState } from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';

import { Check, Copy, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    getProviderDisplayName,
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

type CloudProvider = 'aws' | 'gcp';

interface DataPlaneDialogFieldProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
}

function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    const theme = useTheme();
    const [isCopied, setIsCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            });
        }
    };

    return (
        <Stack
            onClick={showCopyButton ? handleCopy : undefined}
            onMouseEnter={showCopyButton ? () => setIsHovered(true) : undefined}
            onMouseLeave={
                showCopyButton ? () => setIsHovered(false) : undefined
            }
            sx={{
                py: 1,
                cursor: showCopyButton && value ? 'pointer' : 'default',
            }}
        >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {label}
            </Typography>
            {showCopyButton ? (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        transition: 'background-color 0.1s ease-in-out',
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 500,
                            fontFamily: 'Monospace',
                            fontSize: 12,
                            color: 'text.secondary',
                            lineHeight: 1,
                        }}
                    >
                        {value || '-'}
                    </Typography>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 12,
                            height: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Check
                            style={{
                                position: 'absolute',
                                fontSize: 12,
                                color: theme.palette.success.main,
                                opacity: isCopied ? 1 : 0,
                                transition: 'opacity 0.1s ease-out',
                            }}
                        />
                        <Copy
                            style={{
                                position: 'absolute',
                                fontSize: 12,
                                color: theme.palette.text.disabled,
                                opacity: !isCopied && isHovered ? 1 : 0,
                                transition: 'opacity 0.1s ease-in',
                            }}
                        />
                    </Box>
                </Stack>
            ) : (
                <Typography color="text.secondary">{value || '-'}</Typography>
            )}
        </Stack>
    );
}

interface ServiceAccountIdentityFieldProps {
    awsArn: string | null;
    gcpEmail: string | null;
}

function ServiceAccountIdentityField({
    awsArn,
    gcpEmail,
}: ServiceAccountIdentityFieldProps) {
    const intl = useIntl();
    const theme = useTheme();
    const [isCopied, setIsCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isToggleHovered, setIsToggleHovered] = useState(false);

    const hasAws = Boolean(awsArn);
    const hasGcp = Boolean(gcpEmail);

    const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(
        hasAws ? 'aws' : 'gcp'
    );

    const handleProviderChange = (
        _event: React.MouseEvent<HTMLElement>,
        newProvider: CloudProvider | null
    ) => {
        if (newProvider !== null) {
            setSelectedProvider(newProvider);
            setIsCopied(false);
        }
    };

    const currentValue = selectedProvider === 'aws' ? awsArn : gcpEmail;

    const handleCopy = () => {
        if (currentValue) {
            navigator.clipboard.writeText(currentValue).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            });
        }
    };

    if (!hasAws && !hasGcp) {
        return null;
    }

    return (
        <Stack
            sx={{
                py: 1,
                cursor: currentValue ? 'pointer' : 'default',
            }}
            onClick={handleCopy}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    mb: 1,
                }}
            >
                <Typography variant="subtitle2" fontWeight={600}>
                    {intl.formatMessage({
                        id: 'admin.dataPlanes.dialog.service_account_identity',
                    })}
                </Typography>
                {hasAws && hasGcp && (
                    <ToggleButtonGroup
                        value={selectedProvider}
                        exclusive
                        onChange={handleProviderChange}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={() => setIsToggleHovered(true)}
                        onMouseLeave={() => setIsToggleHovered(false)}
                        size="small"
                    >
                        <ToggleButton
                            value="aws"
                            sx={{ py: 0.25, px: 1, borderRadius: 3 }}
                        >
                            <Typography variant="caption">AWS</Typography>
                        </ToggleButton>
                        <ToggleButton
                            value="gcp"
                            sx={{ py: 0.25, px: 1, borderRadius: 3 }}
                        >
                            <Typography variant="caption">GCP</Typography>
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                    sx={{
                        fontWeight: 500,
                        fontFamily: 'Monospace',
                        fontSize: 12,
                        color: 'text.secondary',
                        lineHeight: 1,
                    }}
                >
                    {currentValue || '-'}
                </Typography>
                <Box
                    sx={{
                        position: 'relative',
                        width: 12,
                        height: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Check
                        style={{
                            position: 'absolute',
                            fontSize: 12,
                            color: theme.palette.success.main,
                            opacity: isCopied ? 1 : 0,
                            transition: 'opacity 0.1s ease-out',
                        }}
                    />
                    <Copy
                        style={{
                            position: 'absolute',
                            fontSize: 12,
                            color: theme.palette.text.disabled,
                            opacity:
                                !isCopied && isHovered && !isToggleHovered
                                    ? 1
                                    : 0,
                            transition: 'opacity 0.1s ease-in',
                        }}
                    />
                </Box>
            </Stack>
        </Stack>
    );
}

interface DataPlaneDialogProps {
    open: boolean;
    onClose: () => void;
    dataPlane: BaseDataPlaneQuery | null;
}

function DataPlaneDialog({ open, onClose, dataPlane }: DataPlaneDialogProps) {
    const intl = useIntl();
    const theme = useTheme();
    const parseCidrBlocks = useParseCidrBlocks();

    const dataPlaneDetails = dataPlane
        ? generateDataPlaneOption(dataPlane)
        : null;

    const { ipv4, ipv6 } = parseCidrBlocks(dataPlane?.cidr_blocks);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="data-plane-dialog-title"
        >
            {dataPlane && dataPlaneDetails ? (
                <>
                    <DialogTitle id="data-plane-dialog-title">
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                // sx={{ mb: 1 }}
                            >
                                <DataPlaneIcon
                                    provider={
                                        dataPlaneDetails.dataPlaneName.provider
                                    }
                                    scope={dataPlaneDetails.scope}
                                    size={30}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{ ml: 1, fontWeight: 600 }}
                                >
                                    {getRegionDisplayName(
                                        dataPlaneDetails.dataPlaneName.provider,
                                        dataPlaneDetails.dataPlaneName.region
                                    )}
                                </Typography>
                            </Stack>{' '}
                            <IconButton
                                onClick={onClose}
                                size="small"
                                aria-label={intl.formatMessage({
                                    id: 'cta.close',
                                })}
                            >
                                <Xmark
                                    style={{
                                        fontSize: '1rem',
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </IconButton>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            {intl.formatMessage({
                                id: 'admin.dataPlanes.dialog.description',
                            })}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={1}>
                            {dataPlaneDetails.dataPlaneName?.provider ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'admin.dataPlanes.dialog.cloud_provider',
                                    })}
                                    value={getProviderDisplayName(
                                        dataPlaneDetails.dataPlaneName.provider
                                    )}
                                    showCopyButton={false}
                                />
                            ) : null}

                            {dataPlaneDetails.dataPlaneName?.region ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'admin.dataPlanes.column.header.region_code',
                                    })}
                                    value={
                                        dataPlaneDetails.dataPlaneName.region
                                    }
                                    showCopyButton={false}
                                />
                            ) : null}

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'admin.dataPlanes.dialog.internal_id',
                                })}
                                value={dataPlane.data_plane_name}
                            />

                            <ServiceAccountIdentityField
                                awsArn={dataPlane.aws_iam_user_arn}
                                gcpEmail={dataPlane.gcp_service_account_email}
                            />

                            {dataPlane.data_plane_fqdn ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'data.idProvider',
                                    })}
                                    value={`${OPENID_HOST}/${dataPlane.data_plane_fqdn}`}
                                />
                            ) : null}

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.ipv4',
                                })}
                                value={ipv4}
                            />

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.ipv6',
                                })}
                                value={ipv6}
                            />
                        </Stack>
                    </DialogContent>
                </>
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
