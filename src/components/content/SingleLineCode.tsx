import { Check, ContentCopy, ErrorOutline } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { semiTransparentBackground } from 'context/Theme';
import { ReactNode, useState } from 'react';

interface Props {
    formattedMessage: string;
    subsequentCommandExists?: boolean;
}

type TransientButtonState = 'success' | 'error' | undefined;

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
                bgcolor: (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                borderRadius: 3,
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

            <Button
                variant="outlined"
                color={transientButtonState}
                onClick={copyToClipboard}
                sx={{
                    px: 1,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 3,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 3,
                }}
            >
                {getButtonIcon(transientButtonState)}
            </Button>
        </Box>
    );
}

export default SingleLineCode;
