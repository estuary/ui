import { Box, Divider, Typography } from '@mui/material';
import DataPreview from 'components/transformation/create/DerivationEditor/SQLDataPreview/DataPreview';
import { intensifiedOutline } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_name,
    useTransformationCreate_previewActive,
} from 'stores/TransformationCreate/hooks';

function SQLDataPreview() {
    const previewActive = useTransformationCreate_previewActive();
    const entityName = useTransformationCreate_name();

    return (
        <Box
            sx={{
                borderBottom: (theme) => intensifiedOutline[theme.palette.mode],
                borderRight: (theme) => intensifiedOutline[theme.palette.mode],
                borderLeft: (theme) => intensifiedOutline[theme.palette.mode],
            }}
        >
            <Box sx={{ height: 37, p: 1 }}>
                {entityName ? (
                    <Typography
                        sx={{ fontWeight: 500 }}
                    >{`${entityName}.query`}</Typography>
                ) : null}
            </Box>

            <Divider />

            <Box sx={{ p: previewActive ? undefined : 1, height: 411 }}>
                {previewActive ? (
                    <DataPreview />
                ) : (
                    <Typography>
                        <FormattedMessage id="newTransform.editor.preview.noPreviewGenerated" />
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default SQLDataPreview;
