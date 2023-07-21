import { ReactNode, useState } from 'react';

import { Check, Copy, WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import {
    Box,
    Button,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { codeBackground } from 'context/Theme';

interface Props {
    value: string;
    subsequentCommandExists?: boolean;
}

type TransientButtonState = 'success' | 'error' | undefined;

const borderRadius = 3;

const getButtonIcon = (
    theme: Theme,
    buttonState: TransientButtonState
): ReactNode => {
    switch (buttonState) {
        case 'success':
            return <Check style={{ color: theme.palette.success.main }} />;
        case 'error':
            return (
                <WarningCircle style={{ color: theme.palette.error.main }} />
            );
        default:
            return <Copy style={{ color: theme.palette.primary.main }} />;
    }
};

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
