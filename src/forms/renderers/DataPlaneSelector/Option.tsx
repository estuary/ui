import { Stack } from '@mui/material';

import type { EnumOption } from '@jsonforms/core';

import DataPlane from 'src/components/shared/Entity/DataPlane';

interface Props {
    renderOptionProps: any;
    option: EnumOption;
}

function Option({ renderOptionProps, option }: Props) {
    const { label, value } = option;

    return (
        <Stack {...renderOptionProps} component="li" direction="row">
            <DataPlane
                dataPlaneName={value.dataPlaneName}
                formattedSuffix={label}
                hideScopeIcon
                logoSize={30}
                scope={value.scope}
            />
        </Stack>
    );
}

export default Option;
