import { LoadingButton } from '@mui/lab';
import {
    Box,
    Divider,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
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
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createRefreshToken } from 'api/tokens';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import SingleLineCode from 'components/content/SingleLineCode';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSet } from 'react-use';
import { generateGitPodURL } from 'services/gitpod';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import generateTransformSpec, {
    DerivationLanguage,
} from './generateTransformSpec';
import SingleStep from './SingleStep';
import { StepBox } from './StepBox';

const StyledStepConnector = styled(StepConnector)(() => ({
    [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: `repeating-linear-gradient(90deg, #9AB5CB, #9AB5CB 30px, transparent 30px, transparent 46px)`,
        border: 0,
        height: 2,
    },
}));

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

interface Props {
    postWindowOpen: (window: Window | null) => void;
}

function TransformationCreate({ postWindowOpen }: Props) {
    const intl = useIntl();

    const collections = useLiveSpecs('collection');

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );
    const [derivationLanguage, setDerivationLanguage] =
        useState<DerivationLanguage>('sql');
    const [entityName, setEntityName] = useState<string>('');
    const [entityPrefix, setEntityPrefix] = useState<string>('');

    const [urlLoading, setUrlLoading] = useState(false);
    const isSmall = useMediaQuery<Theme>((theme) =>
        theme.breakpoints.down('sm')
    );

    const grants = useCombinedGrantsExt({ adminOnly: true });

    const allowedPrefixes = useMemo(
        () => grants.combinedGrants.map((grant) => grant.object_role),
        [grants]
    );

    const computedEntityName = useMemo(() => {
        if (entityName) {
            if (allowedPrefixes.length === 1) {
                return `${allowedPrefixes[0]}${entityName}`;
            } else if (entityPrefix) {
                return `${entityPrefix}${entityName}`;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }, [allowedPrefixes, entityName, entityPrefix]);

    const entityNameError = useMemo(() => {
        if (entityName) {
            if (allowedPrefixes.length > 1 && !entityPrefix) {
                return intl.formatMessage({
                    id: 'newTransform.errors.prefixMissing',
                });
            }
            if (!NAME_RE.test(entityName)) {
                // TODO: be more descriptive
                return intl.formatMessage({
                    id: 'newTransform.errors.namePattern',
                });
            }
        }
        return null;
    }, [intl, allowedPrefixes, entityName, entityPrefix]);

    const submitButtonError = useMemo(() => {
        if (selectedCollectionSet.size < 1) {
            return intl.formatMessage({ id: 'newTransform.errors.collection' });
        }
        if (!entityName) {
            return intl.formatMessage({ id: 'newTransform.errors.name' });
        }
        return null;
    }, [intl, entityName, selectedCollectionSet]);

    const { enqueueSnackbar } = useSnackbar();
    const displayError = useCallback(
        (message: string) => {
            enqueueSnackbar(message, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant: 'error',
            });
        },
        [enqueueSnackbar]
    );

    const generateDraftWithSpecs = useMemo(
        () => async () => {
            if (!computedEntityName) {
                throw new Error(
                    intl.formatMessage({
                        id: 'newTransform.errors.nameInvalid',
                    })
                );
            }
            const draft = await createEntityDraft(computedEntityName);
            if (draft.error) {
                throw new Error(
                    `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                );
            }
            const draftId: string = draft.data[0].id;

            const spec = generateTransformSpec(
                derivationLanguage,
                computedEntityName,
                selectedCollectionSet
            );

            await createDraftSpec(
                draftId,
                computedEntityName,
                spec,
                'collection',
                null
            );
            return draftId;
        },
        [computedEntityName, derivationLanguage, intl, selectedCollectionSet]
    );

    const generateUrl = useMemo(
        () => async () => {
            try {
                setUrlLoading(true);

                // This is really just here to make Typescript happy,
                // we know that computedEntityName will exist because
                // generateDraftWithSpecs() checks it and throws otherwise
                if (!computedEntityName) {
                    throw new Error(
                        intl.formatMessage({
                            id: 'newTransform.errors.nameMissing',
                        })
                    );
                }

                const [token, draftId] = await Promise.all([
                    createRefreshToken(false, '1 day'),
                    generateDraftWithSpecs(),
                ]);

                return generateGitPodURL(
                    draftId,
                    token,
                    derivationLanguage,
                    selectedCollectionSet,
                    computedEntityName
                );
            } catch (e: unknown) {
                displayError(
                    intl.formatMessage({
                        id: 'newTransform.errors.urlNotGenerated',
                    })
                );
                console.error(e);
                return null;
            } finally {
                setUrlLoading(false);
            }
        },
        [
            computedEntityName,
            derivationLanguage,
            displayError,
            generateDraftWithSpecs,
            intl,
            selectedCollectionSet,
        ]
    );

    const languageSelector = useMemo(
        () => (
            <>
                <div style={{ padding: '0.5rem 16px' }}>
                    <SingleStep num={2}>
                        <Typography>
                            <FormattedMessage id="newTransform.language.title" />
                        </Typography>
                    </SingleStep>
                </div>
                <Divider />
                <RadioGroup
                    sx={{ padding: '16px', paddingTop: '4px' }}
                    value={derivationLanguage}
                    onChange={(e) =>
                        setDerivationLanguage(e.target.value as any)
                    }
                >
                    <FormControlLabel
                        value="sql"
                        control={<Radio size="small" />}
                        label={intl.formatMessage({
                            id: 'newTransform.language.sql',
                        })}
                    />
                    <FormControlLabel
                        value="typescript"
                        control={<Radio size="small" />}
                        label={intl.formatMessage({
                            id: 'newTransform.language.ts',
                        })}
                    />
                </RadioGroup>
            </>
        ),
        [derivationLanguage, intl]
    );

    return (
        <Box
            sx={{
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {!isSmall ? (
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
            <Stack direction={isSmall ? 'column' : 'row'}>
                <StepBox>
                    <CollectionSelector
                        height={350}
                        loading={collections.isValidating}
                        skeleton={<BindingsSelectorSkeleton />}
                        removeAllCollections={
                            selectedCollectionSetFunctions.reset
                        }
                        collections={selectedCollectionSet}
                        removeCollection={selectedCollectionSetFunctions.remove}
                        addCollection={selectedCollectionSetFunctions.add}
                    />
                </StepBox>
                <Box
                    sx={{
                        flex: 1,
                    }}
                >
                    <StepBox last>{languageSelector}</StepBox>
                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                        <SingleStep
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
                        </SingleStep>
                        <TextField
                            sx={{ marginBottom: 2 }}
                            label={intl.formatMessage({
                                id: 'newTransform.collection.label',
                            })}
                            required
                            fullWidth
                            error={!!entityNameError}
                            helperText={entityNameError}
                            value={entityName}
                            onChange={(event) =>
                                setEntityName(event.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {allowedPrefixes.length === 1 ? (
                                            allowedPrefixes[0]
                                        ) : (
                                            <>
                                                <Select
                                                    variant="standard"
                                                    value={entityPrefix}
                                                    onChange={(evt) => {
                                                        setEntityPrefix(
                                                            evt.target.value
                                                        );
                                                    }}
                                                >
                                                    {allowedPrefixes.map(
                                                        (prefix) => (
                                                            <MenuItem
                                                                key={prefix}
                                                                value={prefix}
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
                        <LoadingButton
                            fullWidth
                            variant="contained"
                            loading={urlLoading}
                            disabled={
                                !!entityNameError ||
                                !!submitButtonError ||
                                urlLoading
                            }
                            sx={{ marginBottom: 3 }}
                            onClick={async () => {
                                const gitpodUrl = await generateUrl();
                                if (gitpodUrl) {
                                    const gitPodWindow = window.open(
                                        gitpodUrl,
                                        '_blank'
                                    );

                                    if (!gitPodWindow || gitPodWindow.closed) {
                                        displayError(
                                            intl.formatMessage({
                                                id: 'newTransform.errors.gitPodWindow',
                                            })
                                        );
                                    }

                                    postWindowOpen(gitPodWindow);
                                }
                            }}
                        >
                            {submitButtonError ??
                                intl.formatMessage({
                                    id: 'newTransform.button.cta',
                                })}
                        </LoadingButton>
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

export default TransformationCreate;
