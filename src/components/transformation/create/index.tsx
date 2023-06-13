import {
    Box,
    Collapse,
    Divider,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    styled,
    Theme,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import SingleLineCode from 'components/content/SingleLineCode';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import PrefixedName from 'components/inputs/PrefixedName';
import EntityError from 'components/shared/Entity/Error';
import DerivationEditor from 'components/transformation/create/DerivationEditor';
import GitPodButton from 'components/transformation/create/GitPodButton';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import LanguageSelector from 'components/transformation/create/LanguageSelector';
import LegacyLanguageSelector from 'components/transformation/create/legacy/LanguageSelector';
import LegacySingleStep from 'components/transformation/create/legacy/SingleStep';
import { LegacyStepWrapper } from 'components/transformation/create/legacy/Wrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSet } from 'react-use';
import {
    useFormStateStore_error,
    useFormStateStore_logToken,
} from 'stores/FormState/hooks';
import {
    useTransformationCreate_language,
    useTransformationCreate_setName,
    useTransformationCreate_setPrefix,
} from 'stores/TransformationCreate/hooks';
import SingleStep from './SingleStep';
import StepWrapper from './Wrapper';

// This is a way to very simply "hide" the flow where anyone
//  can create a tenant but allow us to test it out in prod.
const hiddenSearchParam = 'please_show';

// TODO (transform): Remove the StyledStepConnector when the new transform create workflow can be released
//   because it is only used in the legacy workflow.
const StyledStepConnector = styled(StepConnector)(() => ({
    [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: `repeating-linear-gradient(90deg, #9AB5CB, #9AB5CB 30px, transparent 30px, transparent 46px)`,
        border: 0,
        height: 2,
    },
}));

interface Props {
    postWindowOpen: (window: Window | null) => void;
}

function TransformationCreate({ postWindowOpen }: Props) {
    const newTransformWorkflow = useGlobalSearchParams(
        GlobalSearchParams.HIDDEN_TRANSFORM_WORKFLOW
    );
    const showNewWorkflow = useMemo(
        () => newTransformWorkflow === hiddenSearchParam,
        [newTransformWorkflow]
    );

    const intl = useIntl();
    const belowSm = useMediaQuery<Theme>((theme) =>
        theme.breakpoints.down('sm')
    );

    const collections = useLiveSpecs('collection');

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const logToken = useFormStateStore_logToken();
    const publicationError = useFormStateStore_error();

    // Transformation Create Store
    const setDerivationName = useTransformationCreate_setName();
    const setCatalogPrefix = useTransformationCreate_setPrefix();
    const language = useTransformationCreate_language();

    const [entityNameError, setEntityNameError] = useState<string | null>(null);
    const [sqlEditorOpen, setSQLEditorOpen] = useState(false);

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    if (showNewWorkflow) {
        return (
            <>
                <Collapse in={!sqlEditorOpen}>
                    <Stack spacing={3} sx={{ pt: 2 }}>
                        <StepWrapper>
                            <SingleStep>
                                <FormattedMessage id="newTransform.baseConfig.sourceCollections.label" />
                            </SingleStep>

                            <Divider />

                            <CollectionSelector
                                height={350}
                                loading={collections.isValidating}
                                skeleton={<BindingsSelectorSkeleton />}
                                removeAllCollections={
                                    selectedCollectionSetFunctions.reset
                                }
                                collections={selectedCollectionSet}
                                removeCollection={
                                    selectedCollectionSetFunctions.remove
                                }
                                addCollection={
                                    selectedCollectionSetFunctions.add
                                }
                            />
                        </StepWrapper>

                        <LanguageSelector />

                        <StepWrapper>
                            <SingleStep>
                                <FormattedMessage id="newTransform.collection.label" />
                            </SingleStep>

                            <Divider />

                            <Box sx={{ py: 1, px: 2 }}>
                                <PrefixedName
                                    standardVariant
                                    label={null}
                                    onNameChange={(newName, errors) => {
                                        setDerivationName(newName);
                                        setEntityNameError(errors);
                                    }}
                                    onPrefixChange={(prefix, errors) => {
                                        setCatalogPrefix(prefix);
                                        setEntityNameError(errors);
                                    }}
                                />
                            </Box>
                        </StepWrapper>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                            }}
                        >
                            {language === 'sql' ? (
                                <InitializeDraftButton
                                    entityNameError={entityNameError}
                                    selectedCollections={selectedCollectionSet}
                                    setSQLEditorOpen={setSQLEditorOpen}
                                />
                            ) : (
                                <GitPodButton
                                    entityNameError={entityNameError}
                                    sourceCollectionSet={selectedCollectionSet}
                                    postWindowOpen={postWindowOpen}
                                />
                            )}
                        </Box>
                    </Stack>
                </Collapse>

                <Collapse in={sqlEditorOpen}>
                    <Collapse in={publicationError !== null} unmountOnExit>
                        {publicationError ? (
                            <EntityError
                                title={publicationError.title}
                                error={publicationError.error}
                                logToken={logToken}
                                draftId={draftId}
                            />
                        ) : null}
                    </Collapse>
                    <DerivationEditor postWindowOpen={postWindowOpen} />
                </Collapse>
            </>
        );
    } else {
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
                                        <FormattedMessage id="newTransform.stepper.step1.label" />
                                    </Typography>
                                </StepLabel>
                            </Step>

                            <Step active>
                                <StepLabel>
                                    <Typography>
                                        <FormattedMessage id="newTransform.stepper.step2.label" />
                                    </Typography>
                                </StepLabel>
                            </Step>
                        </Stepper>
                    </Box>
                ) : null}

                <Stack direction={belowSm ? 'column' : 'row'}>
                    <LegacyStepWrapper>
                        <CollectionSelector
                            height={350}
                            loading={collections.isValidating}
                            skeleton={<BindingsSelectorSkeleton />}
                            removeAllCollections={
                                selectedCollectionSetFunctions.reset
                            }
                            collections={selectedCollectionSet}
                            removeCollection={
                                selectedCollectionSetFunctions.remove
                            }
                            addCollection={selectedCollectionSetFunctions.add}
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
                                    <FormattedMessage id="newTransform.stepper.step3.label" />
                                </Typography>
                            </LegacySingleStep>

                            <PrefixedName
                                size="medium"
                                label={intl.formatMessage({
                                    id: 'newTransform.collection.label',
                                })}
                                onChange={(newName, errors) => {
                                    setDerivationName(newName);
                                    setEntityNameError(errors);
                                }}
                                onPrefixChange={(prefix, errors) => {
                                    setCatalogPrefix(prefix);
                                    setEntityNameError(errors);
                                }}
                            />

                            <GitPodButton
                                entityNameError={entityNameError}
                                sourceCollectionSet={selectedCollectionSet}
                                postWindowOpen={postWindowOpen}
                            />

                            <Stack spacing={1}>
                                <Typography variant="caption">
                                    <Box>
                                        <FormattedMessage id="newTransform.instructions1" />
                                    </Box>
                                    <Box>
                                        <FormattedMessage id="newTransform.instructions2" />
                                    </Box>
                                </Typography>

                                <SingleLineCode value="flowctl --help" />
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </Box>
        );
    }
}

export default TransformationCreate;
