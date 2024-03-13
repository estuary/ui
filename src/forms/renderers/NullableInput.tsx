import { optionIs, RankedTester, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Button, Stack } from '@mui/material';
import { useCallback } from 'react';
import { Options } from 'types/jsonforms';

export const nullableControlTester: RankedTester = rankWith(
    10,
    optionIs(Options.nullable, true)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const NullableRenderer = (props: any) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { handleChange, path, enabled } = props;

    const nullField = useCallback(() => {
        console.log('null out the field', { handleChange, path });
    }, [handleChange, path]);

    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <MaterialInputControl {...props} input={MuiInputText} />

            <Box>
                <Button
                    disabled={!enabled}
                    onClick={nullField}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Null
                </Button>
            </Box>
        </Stack>
    );
};

export const NullableControl = withJsonFormsControlProps(NullableRenderer);
