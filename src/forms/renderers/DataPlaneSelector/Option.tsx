import { EnumOption } from '@jsonforms/core';
import { Box, Typography } from '@mui/material';
import { DataPlaneOption } from 'stores/DetailsForm/types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    renderOptionProps: any;
    option: EnumOption;
}

const parseDataPlaneName = (
    dataPlaneName: string,
    scope: DataPlaneOption['scope']
) => {
    const basePrefix = `ops/dp/${scope}/`;

    if (dataPlaneName.startsWith(basePrefix)) {
        const truncatedName = dataPlaneName.substring(basePrefix.length);

        const slashIndex = truncatedName.lastIndexOf('/');

        const prefix =
            slashIndex === -1 ? '' : truncatedName.substring(0, slashIndex + 1);

        const suffix =
            slashIndex === -1
                ? truncatedName
                : truncatedName.substring(slashIndex + 1);

        const [provider, rest] = suffix.split('-', 2);

        const hyphenIndex = rest.lastIndexOf('-');

        const region =
            hyphenIndex === -1 ? rest : rest.substring(0, hyphenIndex);

        const cluster =
            hyphenIndex === -1 ? '' : rest.substring(hyphenIndex + 1);

        return { cluster, prefix, provider, region };
    }

    return { cluster: '', prefix: dataPlaneName, provider: '', region: '' };
};

function Option({ renderOptionProps, option }: Props) {
    const { label, value } = option;

    const { cluster, prefix, provider, region } = parseDataPlaneName(
        hasLength(value.dataPlaneName) ? value.dataPlaneName : label,
        value.scope
    );

    const evaluatedLabel =
        region || cluster
            ? `${prefix}${provider}: ${region} ${cluster}`
            : prefix;

    return (
        <Box component="li" {...renderOptionProps}>
            <Typography>{evaluatedLabel}</Typography>
        </Box>
    );
}

export default Option;
