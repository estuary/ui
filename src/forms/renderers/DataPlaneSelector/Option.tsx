import { EnumOption } from '@jsonforms/core';
import { Stack, Typography } from '@mui/material';
import { hasLength } from 'utils/misc-utils';

interface Props {
    renderOptionProps: any;
    option: EnumOption;
}

function Option({ renderOptionProps, option }: Props) {
    const { label, value } = option;

    return (
        <Stack
            {...renderOptionProps}
            component="li"
            style={{ alignItems: 'flex-start' }}
        >
            {hasLength(value.dataPlaneName.prefix) ? (
                <Typography variant="caption" style={{ fontSize: 10 }}>
                    {value.dataPlaneName.prefix}
                </Typography>
            ) : null}

            <Typography>{label}</Typography>
        </Stack>
    );
}

export default Option;
