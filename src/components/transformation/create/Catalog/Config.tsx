import { Stack, TextField, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';
import { stripPathing } from 'utils/misc-utils';

function DerivationCatalogConfig() {
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const transformConfigs = useTransformationCreate_transformConfigs();

    const transformConfig = useMemo(
        () =>
            Object.hasOwn(transformConfigs, selectedAttribute)
                ? transformConfigs[selectedAttribute]
                : null,
        [selectedAttribute, transformConfigs]
    );

    console.log(transformConfig);
    return (
        <Stack spacing={2} sx={{ py: 2 }}>
            {transformConfig ? (
                <>
                    <TextField
                        size="small"
                        label="Source Collection"
                        value={transformConfig.collection}
                    />

                    <TextField
                        size="small"
                        label="Table"
                        value={stripPathing(transformConfig.collection)}
                    />
                </>
            ) : (
                <Typography>
                    <FormattedMessage id="newTransform.catalog.alert.noTransformSelected" />
                </Typography>
            )}
        </Stack>
    );
}

export default DerivationCatalogConfig;
