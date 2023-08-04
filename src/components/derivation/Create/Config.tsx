import { Box, Divider, Stack } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import PrefixedName from 'components/inputs/PrefixedName';
import LanguageSelector from 'components/transformation/create/LanguageSelector';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import usePageTitle from 'hooks/usePageTitle';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSet } from 'react-use';

import {
    useTransformationCreate_setCatalogName,
    useTransformationCreate_setName,
} from 'stores/TransformationCreate/hooks';
import { ConfigHeader } from './ConfigHeader';

function DerivationCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.beta.title,
        headerLink: 'https://docs.estuary.dev/concepts/derivations/',
    });

    // Transformation Create Store
    const setCatalogName = useTransformationCreate_setCatalogName();
    const setDerivationName = useTransformationCreate_setName();

    const [entityNameError, setEntityNameError] = useState<string | null>(null);

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    return (
        <Stack spacing={3}>
            <ConfigHeader entityNameError={entityNameError} />

            <StepWrapper>
                <SingleStep>
                    <FormattedMessage id="newTransform.collection.label" />
                </SingleStep>

                <Divider />

                <Box sx={{ py: 1, px: 2 }}>
                    <PrefixedName
                        standardVariant
                        label={null}
                        onChange={(newName, errors) => {
                            setCatalogName(newName);
                            setEntityNameError(errors);
                        }}
                        onNameChange={(newName, errors) => {
                            setDerivationName(newName);
                            setEntityNameError(errors);
                        }}
                    />
                </Box>
            </StepWrapper>

            <LanguageSelector />

            <StepWrapper>
                <SingleStep>
                    <FormattedMessage id="newTransform.baseConfig.sourceCollections.label" />
                </SingleStep>

                <Divider />

                <CollectionSelector
                    height={350}
                    loading={false}
                    skeleton={<BindingsSelectorSkeleton />}
                    removeAllCollections={selectedCollectionSetFunctions.reset}
                    collections={selectedCollectionSet}
                    removeCollection={selectedCollectionSetFunctions.remove}
                    addCollection={selectedCollectionSetFunctions.add}
                />
            </StepWrapper>
        </Stack>
    );
}

export default DerivationCreateConfig;
