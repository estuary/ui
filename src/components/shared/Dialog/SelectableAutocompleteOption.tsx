import type { AutocompleteRenderOptionState } from '@mui/material';
import type { HTMLAttributes, ReactNode } from 'react';

import { Box, Stack, useTheme } from '@mui/material';

import { Check } from 'iconoir-react';

interface SelectableAutocompleteOptionProps {
    Content: ReactNode;
    renderOptionProps: HTMLAttributes<HTMLElement>;
    state: AutocompleteRenderOptionState;
}

const SelectableAutocompleteOption = ({
    Content,
    renderOptionProps,
    state,
}: SelectableAutocompleteOptionProps) => {
    const theme = useTheme();

    return (
        <Box
            {...renderOptionProps}
            component="li"
            style={{
                alignItems: 'flex-start',
                display: 'flex',
                paddingLeft: 10,
                paddingRight: 8,
            }}
        >
            {state.selected ? (
                <Check
                    style={{
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                        fontSize: 12,
                        marginRight: 4,
                        marginTop: 2,
                    }}
                />
            ) : (
                <Box style={{ flexShrink: 0, marginRight: 4, width: 18 }} />
            )}

            <Stack>{Content}</Stack>
        </Box>
    );
};

export default SelectableAutocompleteOption;
