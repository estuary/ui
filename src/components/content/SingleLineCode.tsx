import { ContentCopy } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { semiTransparentBackground } from 'context/Theme';

interface Props {
    formattedMessage: string;
    subsequentCommandExists?: boolean;
}

function SingleLineCode({ formattedMessage, subsequentCommandExists }: Props) {
    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(formattedMessage);
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
                onClick={copyToClipboard}
                sx={{
                    px: 1,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 3,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 3,
                }}
            >
                <ContentCopy />
            </Button>
        </Box>
    );
}

export default SingleLineCode;
