import {
    Box,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import GitPodButton from 'components/transformation/create/GitPodButton';
import LanguageSelector from 'components/transformation/create/LanguageSelector';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useLiveSpecs from 'hooks/useLiveSpecs';
import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSet } from 'react-use';
import {
    useTransformationCreate_name,
    useTransformationCreate_setName,
} from 'stores/TransformationCreate/hooks';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import SingleStep from './SingleStep';
import StepWrapper from './Wrapper';

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

interface Props {
    postWindowOpen: (window: Window | null) => void;
}

function TransformationCreate({ postWindowOpen }: Props) {
    const intl = useIntl();

    const collections = useLiveSpecs('collection');

    const entityName = useTransformationCreate_name();
    const setEntityName = useTransformationCreate_setName();

    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const [entityPrefix, setEntityPrefix] = useState<string>('');

    // const [urlLoading, setUrlLoading] = useState(false);

    const grants = useCombinedGrantsExt({ adminOnly: true });

    const allowedPrefixes = useMemo(
        () => grants.combinedGrants.map((grant) => grant.object_role),
        [grants]
    );

    // const computedEntityName = useMemo(() => {
    //     if (entityName) {
    //         if (allowedPrefixes.length === 1) {
    //             return `${allowedPrefixes[0]}${entityName}`;
    //         } else if (entityPrefix) {
    //             return `${entityPrefix}${entityName}`;
    //         } else {
    //             return null;
    //         }
    //     } else {
    //         return null;
    //     }
    // }, [allowedPrefixes, entityName, entityPrefix]);

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

    const handlers = {
        evaluateCatalogName: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            setEntityName(event.target.value);
        },
    };

    return (
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
                    removeAllCollections={selectedCollectionSetFunctions.reset}
                    collections={selectedCollectionSet}
                    removeCollection={selectedCollectionSetFunctions.remove}
                    addCollection={selectedCollectionSetFunctions.add}
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
                    value={entityName}
                    onChange={handlers.evaluateCatalogName}
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
                                            {allowedPrefixes.map((prefix) => (
                                                <MenuItem
                                                    key={prefix}
                                                    value={prefix}
                                                >
                                                    {prefix}
                                                </MenuItem>
                                            ))}
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
                <GitPodButton
                    entityNameError={entityNameError}
                    entityPrefix={entityPrefix}
                    selectedCollections={selectedCollectionSet}
                    postWindowOpen={postWindowOpen}
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
    );
}

export default TransformationCreate;
