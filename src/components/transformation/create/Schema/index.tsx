import { FormattedMessage } from 'react-intl';

import { Stack, Typography } from '@mui/material';

import SchemaEditToggle from 'components/editor/Bindings/SchemaEdit/Toggle';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DerivationSchemaEditor from 'components/transformation/create/Schema/Editor';
import DerivationSchemaHeader from 'components/transformation/create/Schema/Header';
import SQLDataPreviewButton from 'components/transformation/create/Schema/SQLDataPreview/Button';

import { useTransformationCreate_catalogName } from 'stores/TransformationCreate/hooks';

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
