import { useState } from 'react';

import { Box, Divider, Stack } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import BindingSelectorTable from 'src/components/collection/Selector/Table';
import { ConfigHeader } from 'src/components/derivation/Create/ConfigHeader';
import PrefixedName from 'src/components/inputs/PrefixedName';
import LanguageSelector from 'src/components/transformation/create/LanguageSelector';
import SingleStep from 'src/components/transformation/create/SingleStep';
import StepWrapper from 'src/components/transformation/create/Wrapper';
import usePageTitle from 'src/hooks/usePageTitle';
import {
    useTransformationCreate_setCatalogName,
    useTransformationCreate_setName,
} from 'src/stores/TransformationCreate/hooks';

function DerivationCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.beta.title,
        headerLink: 'https://docs.estuary.dev/concepts/derivations/',
    });

    // Transformation Create Store
    const setCatalogName = useTransformationCreate_setCatalogName();
    const setDerivationName = useTransformationCreate_setName();

    const [entityNameError, setEntityNameError] = useState<string | null>(null);

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

                <BindingSelectorTable
                    entity="collection"
                    selectedCollections={[]}
                />
            </StepWrapper>
        </Stack>
    );
}

export default DerivationCreateConfig;
