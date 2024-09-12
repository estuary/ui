import { EnumOption } from '@jsonforms/core';
import { Stack, Typography } from '@mui/material';
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

        const firstHyphenIndex = suffix.indexOf('-');

        let provider = '';
        let region = '';
        let cluster = '';

        if (firstHyphenIndex > -1) {
            provider = suffix.substring(0, firstHyphenIndex);

            const lastHyphenIndex = suffix.lastIndexOf('-');
            const regionOnly =
                lastHyphenIndex === -1 || lastHyphenIndex === firstHyphenIndex;

            region = regionOnly
                ? suffix.substring(firstHyphenIndex + 1)
                : suffix.substring(firstHyphenIndex + 1, lastHyphenIndex);

            cluster = regionOnly ? '' : suffix.substring(lastHyphenIndex + 1);
        }

        return { cluster, prefix, provider, region };
    }

    return { cluster: '', prefix: '', provider: '', region: '' };
};

function Option({ renderOptionProps, option }: Props) {
    const { label, value } = option;

    const { cluster, prefix, provider, region } = parseDataPlaneName(
        hasLength(value.dataPlaneName) ? value.dataPlaneName : label,
        value.scope
    );

    const formattedLabel = hasLength(provider)
        ? `${provider}: ${region} ${cluster}`
        : label;

    return (
        <Stack
            {...renderOptionProps}
            component="li"
            style={{ alignItems: 'flex-start' }}
        >
            {hasLength(prefix) ? (
                <Typography variant="caption" style={{ fontSize: 10 }}>
                    {prefix}
                </Typography>
            ) : null}

            <Typography>{formattedLabel}</Typography>
        </Stack>
    );
}

export default Option;
