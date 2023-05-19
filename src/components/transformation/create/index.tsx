import {
    Box,
    Collapse,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    TextField,
} from '@mui/material';
import { getAuthRoles } from 'api/combinedGrantsExt';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import DerivationEditor from 'components/transformation/create/DerivationEditor';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import LanguageSelector from 'components/transformation/create/LanguageSelector';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEffectOnce, useSet } from 'react-use';
import {
    useTransformationCreate_name,
    useTransformationCreate_prefix,
    useTransformationCreate_setName,
    useTransformationCreate_setPrefix,
} from 'stores/TransformationCreate/hooks';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import SingleStep from './SingleStep';
import StepWrapper from './Wrapper';

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

// interface Props {
//     postWindowOpen: (window: Window | null) => void;
// }

function TransformationCreate() {
    const intl = useIntl();

    const collections = useLiveSpecs('collection');

    const derivationName = useTransformationCreate_name();
    const setDerivationName = useTransformationCreate_setName();

    const catalogPrefix = useTransformationCreate_prefix();
    const setCatalogPrefix = useTransformationCreate_setPrefix();

    const [prefixOptions, setPrefixOptions] = useState<string[] | null>(null);
    const [sqlEditorOpen, setSQLEditorOpen] = useState(false);

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const entityNameError = useMemo(() => {
        if (derivationName) {
            if (prefixOptions && prefixOptions.length > 1 && !catalogPrefix) {
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
        getAuthRoles('admin').then(
            (response) => {
                if (response.data && response.data.length > 0) {
                    const roles = response.data.map(
                        ({ role_prefix }) => role_prefix
                    );

                    setPrefixOptions(roles);
                    setCatalogPrefix(roles[0]);
                }
            },
            () => {
                setPrefixOptions([]);
            }
        );
    });

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
                            addCollection={selectedCollectionSetFunctions.add}
                        />
                    </StepWrapper>

                    <LanguageSelector />

                    <StepWrapper>
                        <SingleStep>
                            <FormattedMessage id="newTransform.collection.label" />
                        </SingleStep>

                        <Divider />

                        {prefixOptions ? (
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
                        ) : (
                            <Skeleton
                                height={26}
                                sx={{ mt: 1, mb: 2, mx: 2 }}
                            />
                        )}
                    </StepWrapper>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                        }}
                    >
                        <InitializeDraftButton
                            entityNameError={entityNameError}
                            selectedCollections={selectedCollectionSet}
                            setSQLEditorOpen={setSQLEditorOpen}
                        />
                    </Box>

                    {/* <Stack spacing={1}>
                        <Typography variant="caption">
                            <Box>
                                <FormattedMessage id="newTransform.instructions1" />
                            </Box>

                            <Box>
                                <FormattedMessage id="newTransform.instructions2" />
                            </Box>
                        </Typography>

                        <SingleLineCode value="flowctl --help" />
                    </Stack> */}
                </Stack>
            </Collapse>

            <Collapse in={sqlEditorOpen}>
                <DerivationEditor />
            </Collapse>
        </>
    );
}

export default TransformationCreate;
