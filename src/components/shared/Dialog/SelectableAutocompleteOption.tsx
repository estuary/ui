import type { AutocompleteRenderOptionState } from '@mui/material';
import type { HTMLAttributes, ReactNode } from 'react';

import { Box, Stack, useTheme } from '@mui/material';

import { Check } from 'iconoir-react';

interface SelectableAutocompleteOptionProps {
    Content: ReactNode;
    renderOptionProps: HTMLAttributes<HTMLElement> & { key: any };
    state: AutocompleteRenderOptionState;
}

const SelectableAutocompleteOption = ({
    Content,
    renderOptionProps,
    state,
}: SelectableAutocompleteOptionProps) => {
    const theme = useTheme();

    const { key, ...optionProps } = renderOptionProps;

    return (
        <Box
            {...optionProps}
            component="li"
            key={key}
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
                        fontSize: 12,
                        marginRight: 4,
                        marginTop: 2,
                    }}
                />
            ) : (
                <Box style={{ width: 18, marginRight: 4 }} />
            )}

            <Stack>{Content}</Stack>
        </Box>
    );
};

export default SelectableAutocompleteOption;
