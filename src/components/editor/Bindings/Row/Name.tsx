import type { SelectorNameProps } from 'src/components/editor/Bindings/Row/types';

import { Button, Typography } from '@mui/material';

import Highlighter from 'src/components/editor/Bindings/Row/Highlighter';
import { HIGHLIGHT_CLASS_NAME } from 'src/components/editor/Bindings/Row/shared';
import { typographyTruncation } from 'src/context/Theme';

function BindingsSelectorName({
    collection,
    highlightChunks,
    filterValue,
    buttonProps = {},
}: SelectorNameProps) {
    return (
        <Button
            variant="text"
            disableFocusRipple
            sx={{
                'color': (theme) => theme.palette.text.primary,
                'height': '100%',
                'justifyContent': 'left',
                'textTransform': 'none',
                'width': '100%',
                '&:focus, &:hover': {
                    bgcolor: 'transparent',
                },
                [`& .${HIGHLIGHT_CLASS_NAME}`]: {
                    background: 'none',
                    fontWeight: 700,
                    mx: 0.25,
                },
            }}
            {...buttonProps}
        >
            <Typography component="span" {...typographyTruncation}>
                <Highlighter
                    chunks={highlightChunks}
                    output={collection.join('')}
                />
            </Typography>
        </Button>
    );
}

export default BindingsSelectorName;
