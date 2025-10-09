import type { Theme } from '@mui/material';
import type { TransformationCreateProps } from 'src/components/transformation/create/types';

import { useMemo, useState } from 'react';

import {
    Box,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    styled,
    Typography,
    useMediaQuery,
} from '@mui/material';

import { useIntl } from 'react-intl';

import SingleLineCode from 'src/components/content/SingleLineCode';
import BindingSelector from 'src/components/editor/Bindings/Selector';
import PrefixedName from 'src/components/inputs/PrefixedName';
import DraftIdGeneratorButton from 'src/components/transformation/create/DraftIdGeneratorButton';
import LegacyLanguageSelector from 'src/components/transformation/create/legacy/LanguageSelector';
import LegacySingleStep from 'src/components/transformation/create/legacy/SingleStep';
import { LegacyStepWrapper } from 'src/components/transformation/create/legacy/Wrapper';
import {
    useBinding_collections,
    useBinding_hydrated,
} from 'src/stores/Binding/hooks';
import {
    useTransformationCreate_setCatalogName,
    useTransformationCreate_setName,
} from 'src/stores/TransformationCreate/hooks';

// TODO (transform): Remove the StyledStepConnector when the new transform create workflow can be released
//   because it is only used in the legacy workflow.
const StyledStepConnector = styled(StepConnector)(() => ({
    [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: `repeating-linear-gradient(90deg, #9AB5CB, #9AB5CB 30px, transparent 30px, transparent 46px)`,
        border: 0,
        height: 2,
    },
}));

function TransformationCreate({
    draftCreationCallback,
}: TransformationCreateProps) {
    const intl = useIntl();
    const belowSm = useMediaQuery<Theme>((theme) =>
        theme.breakpoints.down('sm')
    );

    // Transformation Create Store
    const setDerivationName = useTransformationCreate_setName();
    const setCatalogName = useTransformationCreate_setCatalogName();

    const [entityNameError, setEntityNameError] = useState<string | null>(null);

    // Hacky - please do not spread this pattern around. Just made it easy to
    //  get this working ASAP and we're gonna replace this anyway
    // TODO (bindings) needs to refactor stores so transforms is not
    //  pulling from 'resourceConfig' for collections. Need a good
    //  solution of setting the list of selected collections anywhere
    const collections = useBinding_collections();
    const selectedCollectionSet = useMemo(
        () => new Set<string>(collections),
        [collections]
    );

    const collectionsHydrated = useBinding_hydrated();

    return (
        <Box
            sx={{
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {!belowSm ? (
                <Box sx={{ width: '100%', marginBottom: 4, flex: 0 }}>
                    <Stepper
                        alternativeLabel
                        connector={<StyledStepConnector />}
                    >
                        <Step active>
                            <StepLabel>
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'newTransform.stepper.step1.label',
                                    })}
                                </Typography>
                            </StepLabel>
                        </Step>

                        <Step active>
                            <StepLabel>
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'newTransform.stepper.step2.label',
                                    })}
                                </Typography>
                            </StepLabel>
                        </Step>
                    </Stepper>
                </Box>
            ) : null}

            <Stack direction={belowSm ? 'column' : 'row'}>
                <LegacyStepWrapper>
                    <BindingSelector
                        legacyTransformHeightHack={370}
                        hideFooter
                        disableSelect
                        readOnly={!collectionsHydrated}
                    />
                </LegacyStepWrapper>

                <Box
                    sx={{
                        flex: 1,
                    }}
                >
                    <LegacyLanguageSelector />

                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                        <LegacySingleStep
                            always
                            num={3}
                            StepperProps={{
                                sx: { marginBottom: 2 },
                                alternativeLabel: true,
                            }}
                        >
                            <Typography>
                                {intl.formatMessage({
                                    id: 'newTransform.stepper.step3.label',
                                })}
                            </Typography>
                        </LegacySingleStep>

                        <PrefixedName
                            size="medium"
                            label={intl.formatMessage({
                                id: 'newTransform.collection.label',
                            })}
                            onChange={(newName, errors) => {
                                setCatalogName(newName);
                                setEntityNameError(errors);
                            }}
                            onNameChange={(newName, errors) => {
                                setDerivationName(newName);
                                setEntityNameError(errors);
                            }}
                        />

                        <DraftIdGeneratorButton
                            entityNameError={entityNameError}
                            sourceCollectionSet={selectedCollectionSet}
                            draftCreationCallback={draftCreationCallback}
                        />

                        <Stack spacing={1}>
                            <Typography variant="caption">
                                <Box>
                                    {intl.formatMessage({
                                        id: 'newTransform.instructions1',
                                    })}
                                </Box>
                                <Box>
                                    {intl.formatMessage({
                                        id: 'newTransform.instructions2',
                                    })}
                                </Box>
                            </Typography>

                            <SingleLineCode
                                value={intl.formatMessage({
                                    id: 'newTransform.instructions2.code',
                                })}
                            />
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}

export default TransformationCreate;
