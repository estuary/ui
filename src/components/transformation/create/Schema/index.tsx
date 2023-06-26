import { Typography } from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import DerivationSchemaEditor from 'components/transformation/create/Schema/Editor';
import DerivationSchemaHeader from 'components/transformation/create/Schema/Header';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_catalogName } from 'stores/TransformationCreate/hooks';

function DerivationSchema() {
    const catalogName = useTransformationCreate_catalogName();

    return (
        <WrapperWithHeader header={<DerivationSchemaHeader />}>
            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="newTransform.schema.description" />
            </Typography>

            <DerivationSchemaEditor entityName={catalogName} />
        </WrapperWithHeader>
    );
}

export default DerivationSchema;
