import { Check, ContentCopy, ErrorOutline } from '@mui/icons-material';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { codeBackground } from 'context/Theme';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    formattedMessage: string;
    subsequentCommandExists?: boolean;
}

type TransientButtonState = 'success' | 'error' | undefined;

const borderRadius = 3;

const getButtonIcon = (buttonState: TransientButtonState): ReactNode => {
    switch (buttonState) {
        case 'success':
            return <Check />;
        case 'error':
            return <ErrorOutline />;
        default:
            return <ContentCopy />;
    }
};

function SingleLineCode({ formattedMessage, subsequentCommandExists }: Props) {
    const intl = useIntl();

    const [transientButtonState, setTransientButtonState] =
        useState<TransientButtonState>(undefined);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formattedMessage).then(
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
                mb: subsequentCommandExists ? 1 : undefined,
                display: 'flex',
                bgcolor: (theme) => codeBackground[theme.palette.mode],
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
                {formattedMessage}
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
                    {getButtonIcon(transientButtonState)}
                </Button>
            </Tooltip>
        </Box>
    );
}

export default SingleLineCode;
