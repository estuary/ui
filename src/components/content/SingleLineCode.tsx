import { Box, Button, Tooltip, Typography, useTheme } from '@mui/material';
import { codeBackground, getButtonIcon } from 'context/Theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    value: string;
    subsequentCommandExists?: boolean;
}

type TransientButtonState = 'success' | 'error' | undefined;

const borderRadius = 3;

function SingleLineCode({ value, subsequentCommandExists }: Props) {
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
