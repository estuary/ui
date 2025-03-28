import { Button, Typography } from '@mui/material';

import { typographyTruncation } from 'src/context/Theme';
import { stripPathing } from 'src/utils/misc-utils';
import BindingsSelectorErrorIndicator from 'src/components/editor/Bindings/Row/ErrorIndicator';
import type { SelectorNameProps } from 'src/components/editor/Bindings/Row/types';


function BindingsSelectorName({
    bindingUUID,
    collection,
    shortenName,
}: SelectorNameProps) {
    return (
        <Button
            variant="text"
            disableFocusRipple
            startIcon={
                <BindingsSelectorErrorIndicator
                    bindingUUID={bindingUUID}
                    collection={collection}
                />
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
