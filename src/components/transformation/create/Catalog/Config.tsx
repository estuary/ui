import { Box, Stack, TextField, Typography } from '@mui/material';
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

    return (
        <Stack spacing={3} sx={{ py: 2 }}>
            {transformConfig ? (
                <>
                    <Box>
                        <Typography variant="subtitle1">
                            Source Collection
                        </Typography>

                        <Typography sx={{ ml: 1.5 }}>
                            {transformConfig.collection}
                        </Typography>
                    </Box>

                    <Stack>
                        <TextField
                            size="small"
                            variant="standard"
                            label="Transform Name"
                            value={stripPathing(transformConfig.collection)}
                        />

                        <Typography
                            variant="caption"
                            color={(theme) => theme.palette.text.secondary}
                            sx={{ mt: '3px' }}
                        >
                            Unique name of the transformation, containing only
                            Unicode letters, numbers, hyphens, or underscores
                            (no spaces or other punctuation).
                        </Typography>
                    </Stack>
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
