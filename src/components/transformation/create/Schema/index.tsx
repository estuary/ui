import { Stack, Typography } from '@mui/material';
import SchemaEditToggle from 'src/components/editor/Bindings/SchemaEdit/Toggle';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import DerivationSchemaEditor from 'src/components/transformation/create/Schema/Editor';
import DerivationSchemaHeader from 'src/components/transformation/create/Schema/Header';
import SQLDataPreviewButton from 'src/components/transformation/create/Schema/SQLDataPreview/Button';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_catalogName } from 'src/stores/TransformationCreate/hooks';

function DerivationSchema() {
    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();

    return (
        <WrapperWithHeader
            header={<DerivationSchemaHeader />}
            hideBorder={!draftId}
        >
            <ErrorBoundryWrapper>
                <Stack
                    direction="row"
                    sx={{
                        mb: 3,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography sx={{ mr: 2 }}>
                        <FormattedMessage id="newTransform.schema.description" />
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        <SQLDataPreviewButton />

                        <SchemaEditToggle />
                    </Stack>
                </Stack>

                <DerivationSchemaEditor entityName={catalogName} />
            </ErrorBoundryWrapper>
        </WrapperWithHeader>
    );
}

export default DerivationSchema;
