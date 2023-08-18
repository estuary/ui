import { Button, Typography } from '@mui/material';
import { typographyTruncation } from 'context/Theme';
import { stripPathing } from 'utils/misc-utils';
import BindingsSelectorErrorIndicator from './ErrorIndicator';

interface RowProps {
    collection: string;
    shortenName?: boolean;
}

function BindingsSelectorName({ collection, shortenName }: RowProps) {
    return (
        <Button
            variant="text"
            disableFocusRipple
            startIcon={
                <BindingsSelectorErrorIndicator collection={collection} />
            }
            sx={{
                'color': (theme) => theme.palette.text.primary,
                'height': '100%',
                'justifyContent': 'left',
                'textTransform': 'none',
                'width': '100%',
                '&:focus, &:hover': {
                    bgcolor: 'transparent',
                },
            }}
        >
            <Typography {...typographyTruncation}>
                {shortenName ? stripPathing(collection) : collection}
            </Typography>
        </Button>
    );
}

export default BindingsSelectorName;
