import type { SingleLineCodeProps } from 'src/components/content/types';

import { Box, Button, Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { codeBackground, getButtonIcon } from 'src/context/Theme';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

const borderRadius = 3;

function SingleLineCode({
    value,
    compact,
    subsequentCommandExists,
    sx,
}: SingleLineCodeProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { isCopied, handleCopy } = useCopyToClipboard('SingleLineCode');

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
                    id: 'common.copied',
                })}
                placement="right"
                open={isCopied}
                arrow
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                <Button
                    variant="outlined"
                    color={isCopied ? 'success' : undefined}
                    onClick={() => handleCopy(value)}
                    sx={{
                        minWidth: compact ? 32 : 64,
                        px: 1,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: borderRadius,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: borderRadius,
                    }}
                >
                    {getButtonIcon(theme, isCopied ? 'success' : undefined)}
                </Button>
            </Tooltip>
        </Box>
    );
}

export default SingleLineCode;
