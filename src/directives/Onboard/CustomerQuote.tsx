import { Box } from '@mui/material';

interface Props {
    hideQuote: boolean;
}
function CustomerQuote({ hideQuote }: Props) {
    if (hideQuote) {
        return null;
    } else {
        return (
            <Box
                sx={{
                    width: '50%',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                new quote here
            </Box>
        );
    }
}

export default CustomerQuote;
