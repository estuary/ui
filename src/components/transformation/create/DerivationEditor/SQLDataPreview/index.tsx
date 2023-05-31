import { Box, Divider, Typography } from '@mui/material';
import DataPreview from 'components/transformation/create/DerivationEditor/SQLDataPreview/DataPreview';
import { intensifiedOutline } from 'context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_name,
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

function SQLDataPreview() {
    const transformConfigs = useTransformationCreate_transformConfigs();
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const attributeType = useTransformationCreate_attributeType();
    const entityName = useTransformationCreate_name();

    const [filename, collection]: [string | null, string | null] =
        useMemo(() => {
            if (
                attributeType === 'transform' &&
                selectedAttribute &&
                !isEmpty(transformConfigs)
            ) {
                return [
                    transformConfigs[selectedAttribute].filename.replace(
                        'lambda',
                        'query'
                    ),
                    transformConfigs[selectedAttribute].collection,
                ];
            } else {
                return [null, null];
            }
        }, [attributeType, selectedAttribute, transformConfigs]);

    return (
        <Box
            sx={{
                flexGrow: 1,
                borderBottom: (theme) => intensifiedOutline[theme.palette.mode],
                borderRight: (theme) => intensifiedOutline[theme.palette.mode],
                borderLeft: (theme) => intensifiedOutline[theme.palette.mode],
            }}
        >
            <Box sx={{ height: 37, p: 1 }}>
                {filename ? (
                    <Typography
                        sx={{ fontWeight: 500 }}
                    >{`${entityName}.query`}</Typography>
                ) : null}
            </Box>

            <Divider />

            <Box sx={{ p: 1 }}>
                {collection && collection.length > 46 ? (
                    <DataPreview collectionName={collection} />
                ) : (
                    <Typography>
                        Click PREVIEW to execute your query.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default SQLDataPreview;
