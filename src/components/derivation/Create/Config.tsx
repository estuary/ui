import { Box, Divider, Stack } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import PrefixedName from 'components/inputs/PrefixedName';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityToolbar from 'components/shared/Entity/Header';
import GitPodButton from 'components/transformation/create/GitPodButton';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import LanguageSelector from 'components/transformation/create/LanguageSelector';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import { useLiveSpecs } from 'hooks/useLiveSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSet } from 'react-use';
import { CustomEvents } from 'services/logrocket';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_setCatalogName,
    useTransformationCreate_setName,
} from 'stores/TransformationCreate/hooks';

function DerivationCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.beta.title,
        headerLink: 'https://docs.estuary.dev/concepts/derivations/',
    });

    const collections = useLiveSpecs('collection');

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const setCatalogName = useTransformationCreate_setCatalogName();

    const language = useTransformationCreate_language();
    const setDerivationName = useTransformationCreate_setName();

    const [entityNameError, setEntityNameError] = useState<string | null>(null);

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    // TODO (transform): Evaluate the value add of using the EntityToolbar component.
    //   If desired, the test and save buttons should be optional props to avoid an accidental
    //   rendering of those buttons.
    return (
        <Stack spacing={3}>
            <EntityToolbar
                GenerateButton={
                    language === 'sql' ? (
                        <InitializeDraftButton
                            entityNameError={entityNameError}
                            selectedCollections={selectedCollectionSet}
                        />
                    ) : (
                        <GitPodButton
                            entityNameError={entityNameError}
                            sourceCollectionSet={selectedCollectionSet}
                        />
                    )
                }
                TestButton={<GitPodButton buttonVariant="outlined" />}
                SaveButton={
                    <EntitySaveButton
                        taskNames={
                            typeof catalogName === 'string'
                                ? [catalogName]
                                : undefined
                        }
                        logEvent={CustomEvents.COLLECTION_CREATE}
                    />
                }
            />

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
                    loading={collections.isValidating}
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
