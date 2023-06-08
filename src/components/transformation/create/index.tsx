import {
    Box,
    Collapse,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    styled,
    TextField,
    Theme,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import SingleLineCode from 'components/content/SingleLineCode';
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
import { useEffectOnce, useSet } from 'react-use';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import {
    useTransformationCreate_language,
    useTransformationCreate_name,
    useTransformationCreate_prefix,
    useTransformationCreate_setName,
    useTransformationCreate_setPrefix,
} from 'stores/TransformationCreate/hooks';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import SingleStep from './SingleStep';
import StepWrapper from './Wrapper';

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

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

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const prefixOptions = Object.keys(adminCapabilities);

    const derivationName = useTransformationCreate_name();
    const setDerivationName = useTransformationCreate_setName();

    const catalogPrefix = useTransformationCreate_prefix();
    const setCatalogPrefix = useTransformationCreate_setPrefix();

    const language = useTransformationCreate_language();

    const [sqlEditorOpen, setSQLEditorOpen] = useState(false);

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const entityNameError = useMemo(() => {
        if (derivationName) {
            if (prefixOptions.length > 1 && !catalogPrefix) {
                return intl.formatMessage({
                    id: 'newTransform.errors.prefixMissing',
                });
            }
            if (!NAME_RE.test(derivationName)) {
                // TODO: be more descriptive
                return intl.formatMessage({
                    id: 'newTransform.errors.namePattern',
                });
            }
        }
        return null;
    }, [intl, catalogPrefix, derivationName, prefixOptions]);

    const handlers = {
        evaluateCatalogName: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            setDerivationName(event.target.value);
        },
    };

    useEffectOnce(() => {
        if (prefixOptions.length > 0) {
            setCatalogPrefix(prefixOptions[0]);
        }
    });

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

                            <TextField
                                sx={{ mt: 1, mb: 2, px: 2 }}
                                size="small"
                                variant="standard"
                                required
                                fullWidth
                                error={!!entityNameError}
                                helperText={entityNameError}
                                value={derivationName}
                                onChange={handlers.evaluateCatalogName}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {prefixOptions.length === 1 ? (
                                                prefixOptions[0]
                                            ) : (
                                                <>
                                                    <Select
                                                        size="small"
                                                        variant="standard"
                                                        value={catalogPrefix}
                                                        onChange={(evt) => {
                                                            setCatalogPrefix(
                                                                evt.target.value
                                                            );
                                                        }}
                                                    >
                                                        {prefixOptions.map(
                                                            (prefix) => (
                                                                <MenuItem
                                                                    key={prefix}
                                                                    value={
                                                                        prefix
                                                                    }
                                                                >
                                                                    {prefix}
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>

                                                    <Divider orientation="vertical" />
                                                </>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
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
                                    selectedCollections={selectedCollectionSet}
                                    postWindowOpen={postWindowOpen}
                                />
                            )}
                        </Box>
                    </Stack>
                </Collapse>

                <Collapse in={sqlEditorOpen}>
                    <DerivationEditor />
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

                            <TextField
                                sx={{ marginBottom: 2 }}
                                label={intl.formatMessage({
                                    id: 'newTransform.collection.label',
                                })}
                                required
                                fullWidth
                                error={!!entityNameError}
                                helperText={entityNameError}
                                value={derivationName}
                                onChange={(event) =>
                                    setDerivationName(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {prefixOptions.length === 1 ? (
                                                prefixOptions[0]
                                            ) : (
                                                <>
                                                    <Select
                                                        size="small"
                                                        variant="standard"
                                                        value={catalogPrefix}
                                                        onChange={(evt) => {
                                                            setCatalogPrefix(
                                                                evt.target.value
                                                            );
                                                        }}
                                                    >
                                                        {prefixOptions.map(
                                                            (prefix) => (
                                                                <MenuItem
                                                                    key={prefix}
                                                                    value={
                                                                        prefix
                                                                    }
                                                                >
                                                                    {prefix}
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>

                                                    <Divider orientation="vertical" />
                                                </>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <GitPodButton
                                entityNameError={entityNameError}
                                selectedCollections={selectedCollectionSet}
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
