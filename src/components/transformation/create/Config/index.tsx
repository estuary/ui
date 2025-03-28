import { Typography, useTheme } from '@mui/material';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import MigrationList from 'src/components/transformation/create/Config/catalog/MigrationList';
import TransformList from 'src/components/transformation/create/Config/catalog/TransformList';
import DerivationCatalogEditor from 'src/components/transformation/create/Config/Editor';
import DerivationCatalogHeader from 'src/components/transformation/create/Config/Header';
import { alternativeReflexContainerBackground } from 'src/context/Theme';
import { FormattedMessage } from 'react-intl';

function DerivationConfig() {
    const theme = useTheme();

    return (
        <WrapperWithHeader header={<DerivationCatalogHeader />}>
            <ErrorBoundryWrapper>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="newTransform.config.description" />
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

export default DerivationConfig;
