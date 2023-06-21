import { Stack, Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DerivationCatalogEditor from 'components/transformation/create/Catalog/Editor';
import DerivationCatalogHeader from 'components/transformation/create/Catalog/Header';
import AdvancedCatalogSettingsButton from 'components/transformation/create/DerivationEditor/Catalog/AdvancedSettings/Button';
import TransformList from 'components/transformation/create/DerivationEditor/Catalog/TransformList';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

function DerivationCatalog() {
    const theme = useTheme();

    return (
        <WrapperWithHeader header={<DerivationCatalogHeader />}>
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
                        <FormattedMessage id="newTransform.editor.catalog.description" />
                    </Typography>

                    <AdvancedCatalogSettingsButton />
                </Stack>

                <ListAndDetails
                    list={<TransformList />}
                    details={<DerivationCatalogEditor />}
                    backgroundColor={
                        alternativeReflexContainerBackground[theme.palette.mode]
                    }
                    displayBorder={true}
                    height={550}
                />
            </ErrorBoundryWrapper>
        </WrapperWithHeader>
    );
}

export default DerivationCatalog;
