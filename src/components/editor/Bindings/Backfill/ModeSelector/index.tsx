import type { BackfillModeSelectorProps } from 'src/components/editor/Bindings/Backfill/types';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import useBackfillModeOptions from 'src/hooks/bindings/useBackfillModeOptions';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

function BackfillModeSelector({ disabled }: BackfillModeSelectorProps) {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();

    const [setBackfillMode] = useBindingStore((state) => [
        state.setBackfillMode,
    ]);

    const { currentOption, isOptionEqualToValue, options } =
        useBackfillModeOptions();

    if (backfillCount < 1) {
        return null;
    }

    return (
        <Box sx={{ minWidth: 350, maxWidth: 350, mt: 3, ml: 1 }}>
            <Typography id="backfill-mode-label" fontWeight={700}>
                {intl.formatMessage({ id: 'workflows.dataFlowBackfill.label' })}
            </Typography>
            <Autocomplete
                isOptionEqualToValue={isOptionEqualToValue}
                value={currentOption}
                options={options}
                onChange={(_event, option: any) => {
                    setBackfillMode(option.val);
                }}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            InputLabelProps={{
                                'aria-labelledby': 'backfill-mode-label',
                            }}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option: any) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                }}
            />
        </Box>
    );
}

export default BackfillModeSelector;
