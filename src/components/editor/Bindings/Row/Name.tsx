import type { SelectorNameProps } from 'src/components/editor/Bindings/Row/types';

import { Box, Button, Typography } from '@mui/material';

import BindingsSelectorErrorIndicator from 'src/components/editor/Bindings/Row/ErrorIndicator';
import { typographyTruncation } from 'src/context/Theme';

function BindingsSelectorName({
    bindingUUID,
    collection,
    highlightName: foo,
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
            }}
        >
            <Typography
                {...typographyTruncation}
                sx={{
                    ...typographyTruncation.sx,
                    ...(foo
                        ? {
                              '& span:first-of-type': {
                                  opacity: 0.7,
                              },
                          }
                        : {}),
                }}
            >
                {collection.map((part, index) => {
                    return (
                        <Box
                            component="span"
                            key={`binding_col_name_${part}_${index}`}
                        >
                            {part}
                        </Box>
                    );
                })}
            </Typography>
        </Button>
    );
}

export default BindingsSelectorName;
