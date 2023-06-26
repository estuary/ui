import { Stack, Typography } from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DerivationSchemaEditor from 'components/transformation/create/Schema/Editor';
import DerivationSchemaHeader from 'components/transformation/create/Schema/Header';
import SQLDataPreviewButton from 'components/transformation/create/Schema/SQLDataPreview/Button';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_catalogName } from 'stores/TransformationCreate/hooks';

function DerivationSchema() {
    const catalogName = useTransformationCreate_catalogName();

    return (
        <WrapperWithHeader header={<DerivationSchemaHeader />}>
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

                    <SQLDataPreviewButton />
                </Stack>
            </ErrorBoundryWrapper>

            <DerivationSchemaEditor entityName={catalogName} />
        </WrapperWithHeader>
    );
}

export default DerivationSchema;
