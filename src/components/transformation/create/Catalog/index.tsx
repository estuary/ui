import { Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DerivationCatalogEditor from 'components/transformation/create/Catalog/Editor';
import DerivationCatalogHeader from 'components/transformation/create/Catalog/Header';
import MigrationList from 'components/transformation/create/Catalog/MigrationList';
import TransformList from 'components/transformation/create/Catalog/TransformList';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { SuccessResponse } from 'hooks/supabase-swr';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';
import { KeyedMutator } from 'swr';

interface Props {
    draftSpecs: DraftSpecQuery[];
    isValidating: boolean;
    mutate: KeyedMutator<SuccessResponse<DraftSpecQuery>>;
}

function DerivationCatalog({ draftSpecs, isValidating, mutate }: Props) {
    const theme = useTheme();

    return (
        <WrapperWithHeader header={<DerivationCatalogHeader />}>
            <ErrorBoundryWrapper>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="newTransform.catalog.description" />
                </Typography>

                <ListAndDetails
                    list={<TransformList />}
                    details={
                        <DerivationCatalogEditor
                            draftSpecs={draftSpecs}
                            isValidating={isValidating}
                            mutate={mutate}
                        />
                    }
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
