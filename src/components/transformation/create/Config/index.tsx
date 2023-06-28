import { Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import MigrationList from 'components/transformation/create/Config/catalog/MigrationList';
import TransformList from 'components/transformation/create/Config/catalog/TransformList';
import DerivationCatalogEditor from 'components/transformation/create/Config/Editor';
import DerivationCatalogHeader from 'components/transformation/create/Config/Header';
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

function DerivationConfig({ draftSpecs, isValidating, mutate }: Props) {
    const theme = useTheme();

    return (
        <WrapperWithHeader header={<DerivationCatalogHeader />}>
            <ErrorBoundryWrapper>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="newTransform.config.description" />
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

export default DerivationConfig;
