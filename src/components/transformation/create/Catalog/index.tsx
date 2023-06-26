import { Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DerivationCatalogEditor from 'components/transformation/create/Catalog/Editor';
import DerivationCatalogHeader from 'components/transformation/create/Catalog/Header';
import MigrationList from 'components/transformation/create/Catalog/MigrationList';
import TransformList from 'components/transformation/create/Catalog/TransformList';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

function DerivationCatalog() {
    const theme = useTheme();

    return (
        <WrapperWithHeader header={<DerivationCatalogHeader />}>
            <ErrorBoundryWrapper>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="newTransform.catalog.description" />
                </Typography>

                <ListAndDetails
                    list={<TransformList />}
                    details={<DerivationCatalogEditor />}
                    backgroundColor={
                        alternativeReflexContainerBackground[theme.palette.mode]
                    }
                    displayBorder={true}
                    height={550}
                    removeMargin
                />

                <MigrationList />
            </ErrorBoundryWrapper>
        </WrapperWithHeader>
    );
}

export default DerivationCatalog;
