import type { SelectorNameProps } from 'src/components/editor/Bindings/Row/types';

import { Button, Typography } from '@mui/material';

import Highlighter from 'react-highlight-words';

import BindingsSelectorErrorIndicator from 'src/components/editor/Bindings/Row/ErrorIndicator';
import { NameHighlight } from 'src/components/editor/Bindings/Row/NameHighlight';
import {
    HIGHLIGHT_CLASS_NAME,
    UNHIGHLIGHT_CLASS_NAME,
} from 'src/components/editor/Bindings/Row/shared';
import { typographyTruncation } from 'src/context/Theme';

function BindingsSelectorName({
    bindingUUID,
    collection,
    filterValue,
}: SelectorNameProps) {
    return (
        <Button
            variant="text"
            disableFocusRipple
            startIcon={
                <BindingsSelectorErrorIndicator
                    bindingUUID={bindingUUID}
                    collection={collection[0]}
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
                [`& .${HIGHLIGHT_CLASS_NAME}`]: {
                    mx: 0.25,
                },
            }}
        >
            <Typography component="span" {...typographyTruncation}>
                <Highlighter
                    autoEscape={false}
                    highlightClassName={HIGHLIGHT_CLASS_NAME}
                    highlightTag={NameHighlight}
                    searchWords={[filterValue ?? '']}
                    textToHighlight={collection.join('')}
                    unhighlightClassName={UNHIGHLIGHT_CLASS_NAME}
                />
            </Typography>
        </Button>
    );
}

export default BindingsSelectorName;
