import { EnumOption } from '@jsonforms/core';
import { Stack, Typography } from '@mui/material';
import { hasLength } from 'utils/misc-utils';
import DataPlaneIcon from './DataPlaneIcon';

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
            direction="row"
            spacing={1}
            style={{ alignItems: 'center', justifyContent: 'start' }}
        >
            {value.dataPlaneName ? (
                <DataPlaneIcon
                    hideScopeIcon
                    provider={value.dataPlaneName.provider}
                    scope={value.scope}
                    size={30}
                />
            ) : null}

            <Stack>
                {hasLength(value.dataPlaneName.prefix) ? (
                    <Typography variant="caption" style={{ fontSize: 10 }}>
                        {value.dataPlaneName.prefix}
                    </Typography>
                ) : null}

                <Typography>{label}</Typography>
            </Stack>
        </Stack>
    );
}

export default Option;
