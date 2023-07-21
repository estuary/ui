import { FormattedMessage } from 'react-intl';

import { Typography, useTheme } from '@mui/material';

import ListAndDetails from 'components/editor/ListAndDetails';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import MigrationList from 'components/transformation/create/Config/catalog/MigrationList';
import TransformList from 'components/transformation/create/Config/catalog/TransformList';
import DerivationCatalogEditor from 'components/transformation/create/Config/Editor';
import DerivationCatalogHeader from 'components/transformation/create/Config/Header';

import { alternativeReflexContainerBackground } from 'context/Theme';

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
