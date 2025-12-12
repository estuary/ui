import { useState } from 'react';

import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';

import {
    DataPlaneDialogFieldProps,
    ServiceAccountIdentityFieldProps,
} from './types';
import { Check, Copy } from 'iconoir-react';
import { useIntl } from 'react-intl';

type CloudProvider = 'aws' | 'gcp';

export function DataPlaneDialogField({
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

export function ServiceAccountIdentityField({
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
