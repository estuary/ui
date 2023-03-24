import { LoadingButton } from '@mui/lab';
import {
    Box,
    BoxProps,
    CircularProgress,
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
    StepperProps as StepperPropsType,
    styled,
    TextField,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByCatalogNames } from 'api/liveSpecsExt';
import { createRefreshToken } from 'api/tokens';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';

// Something seems to be conflicting with the import re-ordering of this
// eslint-disable-next-line import/order
import { Buffer } from 'buffer';
import SingleLineCode from 'components/content/SingleLineCode';
import { useSet } from 'react-use';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { BindingsSelectorSkeleton } from './CollectionSkeletons';
import CollectionSelector from './Selector';

const StyledStepConnector = styled(StepConnector)(() => ({
    [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: `repeating-linear-gradient(90deg, #9AB5CB, #9AB5CB 30px, transparent 30px, transparent 46px)`,
        border: 0,
        height: 2,
    },
}));

const StepBox = styled(Box)<BoxProps & { last?: boolean }>(
    ({ theme, last }) => ({
        border: '1px solid #9AB5CB',
        borderRadius: 3,
        flex: 1,
        // Prevents the white background of the header from chopping off
        //the rounded corners of the border
        overflow: 'hidden',
        ...(!last
            ? {
                  [theme.breakpoints.down('sm')]: {
                      marginBottom: 24,
                  },
                  [theme.breakpoints.up('sm')]: {
                      marginRight: 24,
                  },
              }
            : {}),
    })
);

const SingleStep: React.FC<{
    num: number;
    always?: boolean;
    children?: React.ReactChild;
    StepperProps?: StepperPropsType;
}> = ({ num, always, children, StepperProps }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const wrappedChildren = <Typography variant="h6">{children}</Typography>;

    if (isSmall || always) {
        return (
            <Stepper connector={null} {...(StepperProps ?? {})}>
                <Step sx={{ padding: 0 }} index={num - 1} active>
                    <StepLabel>{wrappedChildren}</StepLabel>
                </Step>
            </Stepper>
        );
    } else {
        return wrappedChildren;
    }
};

// TODO: Change this to master when the PR gets merged
const GIT_REPO =
    'https://github.com/estuary/flow-gitpod-base/tree/jshearer/getting_started';
type DerivationLanguage = 'sql' | 'typescript';
const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

function NewCollection() {
    const [derivationLanguage, setDerivationLanguage] =
        useState<DerivationLanguage>('sql');
    const collections = useLiveSpecs('collection');

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

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
                return 'No prefix selected';
            }
            if (!NAME_RE.test(entityName)) {
                // TODO: be more descriptive
                return 'Name does not match pattern';
            }
        }
        return null;
    }, [allowedPrefixes, entityName, entityPrefix]);

    const submitButtonError = useMemo(() => {
        if (selectedCollectionSet.size < 1) {
            return 'Select A Source Collection';
        }
        if (!entityName) {
            return 'Name Your Transform';
        }
        return null;
    }, [entityName, selectedCollectionSet]);

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
                throw new Error('Invalid entity name');
            }
            const draft = await createEntityDraft(computedEntityName);
            if (draft.error) {
                throw new Error(
                    `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                );
            }
            const draftId: string = draft.data[0].id;
            const specsByName = await getLiveSpecsByCatalogNames(
                null,
                Array.from(selectedCollectionSet)
            );
            if (specsByName.error) {
                throw new Error(
                    `[${specsByName.error.code}]: ${specsByName.error.message}, ${specsByName.error.details}, ${specsByName.error.hint}`
                );
            }

            for (const spec of specsByName.body) {
                // eslint-disable-next-line no-await-in-loop
                await createDraftSpec(
                    draftId,
                    spec.catalog_name,
                    spec.spec,
                    spec.spec_type,
                    spec.last_pub_id
                );
            }
            return draftId;
        },
        [computedEntityName, selectedCollectionSet]
    );

    const generateGitpodUrl = useMemo(
        () => async () => {
            try {
                setUrlLoading(true);

                // This is really just here to make Typescript happy,
                // we know that computedEntityName will exist because
                // generateDraftWithSpecs() checks it and throws otherwise
                if (!computedEntityName) {
                    throw new Error('Missing entity name');
                }

                const [token, draftId] = await Promise.all([
                    createRefreshToken(false, '1 day'),
                    generateDraftWithSpecs(),
                ]);

                const url = `https://gitpod.io/#FLOW_DRAFT_ID=${encodeURIComponent(
                    draftId
                )},FLOW_REFRESH_TOKEN=${encodeURIComponent(
                    Buffer.from(JSON.stringify(token.body)).toString('base64')
                )},FLOW_TEMPLATE_TYPE=${derivationLanguage},FLOW_TEMPLATE_MODE=${
                    selectedCollectionSet.size > 1 ? 'multi' : 'single'
                },FLOW_COLLECTION_NAME=${encodeURIComponent(
                    computedEntityName
                )}/${GIT_REPO}`;
                return url;
            } catch (e: unknown) {
                displayError('Failed to open GitPod');
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
            selectedCollectionSet.size,
        ]
    );

    const languageSelector = useMemo(
        () => (
            <>
                <div style={{ padding: '0.5rem 16px' }}>
                    <SingleStep num={2}>Language</SingleStep>
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
                        label="SQL"
                    />
                    <FormControlLabel
                        value="typescript"
                        control={<Radio size="small" />}
                        label="Typescript"
                    />
                </RadioGroup>
            </>
        ),
        [derivationLanguage]
    );

    if (collections.isValidating) {
        return <CircularProgress />;
    } else {
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
                                <StepLabel>Select your collection</StepLabel>
                            </Step>
                            <Step active>
                                <StepLabel>Transformation Language</StepLabel>
                            </Step>
                        </Stepper>
                    </Box>
                ) : null}
                <Stack direction={isSmall ? 'column' : 'row'}>
                    <StepBox>
                        <CollectionSelector
                            height={350}
                            loading={false}
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
                                Write Transformation
                            </SingleStep>
                            <TextField
                                sx={{ marginBottom: 2 }}
                                label="Collection Name"
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
                            <LoadingButton
                                disabled={
                                    !!entityNameError || !!submitButtonError
                                }
                                fullWidth
                                variant="contained"
                                loading={urlLoading}
                                sx={{ marginBottom: 3 }}
                                loadingPosition="end"
                                onClick={async () => {
                                    const gitpodUrl = await generateGitpodUrl();
                                    if (gitpodUrl) {
                                        window.open(gitpodUrl, '_blank');
                                    }
                                }}
                            >
                                {submitButtonError ?? 'Proceed to GitPod'}
                            </LoadingButton>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgb(150,150,150)' }}
                            >
                                You will be set up with an environment to create
                                a transform. Create your query and use the CLI
                                to continue, e.g
                                <SingleLineCode value="flowctl --help" />
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>
        );
    }
}

export default NewCollection;
