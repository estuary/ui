import type { SingleLineCodeProps } from 'src/components/content/types';

import { useState } from 'react';

import { Box, Button, Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { codeBackground, getButtonIcon } from 'src/context/Theme';

type TransientButtonState = 'success' | 'error' | undefined;

const borderRadius = 3;

function SingleLineCode({
    value,
    compact,
    subsequentCommandExists,
    sx,
}: SingleLineCodeProps) {
    const intl = useIntl();
    const theme = useTheme();

    const [transientButtonState, setTransientButtonState] =
        useState<TransientButtonState>(undefined);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value).then(
            () => {
                setTransientButtonState('success');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            },
            () => {
                setTransientButtonState('error');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            }
        );
    };

    return (
        <Box
            sx={{
                maxWidth: 1000,
                mb: subsequentCommandExists ? 1 : undefined,
                display: 'flex',
                bgcolor: codeBackground[theme.palette.mode],
                borderRadius,
                ...(sx ?? {}),
            }}
        >
            <Typography
                noWrap
                sx={{
                    p: 1,
                    flexGrow: 1,
                    overflowX: 'auto',
                    textOverflow: 'unset',
                }}
            >
                {value}
            </Typography>

            <Tooltip
                title={intl.formatMessage({
                    id:
                        transientButtonState === 'error'
                            ? 'common.copyFailed'
                            : 'common.copied',
                })}
                placement="right"
                open={!!transientButtonState}
                arrow
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                <Button
                    variant="outlined"
                    color={transientButtonState}
                    onClick={copyToClipboard}
                    sx={{
                        minWidth: compact ? 32 : 64,
                        px: 1,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: borderRadius,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: borderRadius,
                    }}
                >
                    {getButtonIcon(theme, transientButtonState)}
                </Button>
            </Tooltip>
        </Box>
    );
}

export default SingleLineCode;
