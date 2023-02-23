import {
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    TextField,
    Typography,
} from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { truncateTextSx } from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';
import useDraftSpecs from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { Check } from 'iconoir-react';
import { isEqual } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import {
    detectAutoCompleteInputReset,
    detectRemoveOptionWithBackspace,
} from 'utils/mui-utils';

interface Props {
    readOnly?: boolean;
}

interface CollectionData {
    name: string;
    classification: string;
}

function CollectionPicker({ readOnly = false }: Props) {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );
    const discoveredCollectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.discoveredCollections',
        })
    );
    const existingCollectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.existingCollections',
        })
    );

    const [collectionValues, setCollectionValues] = useState<CollectionData[]>(
        []
    );
    const [collectionOptions, setCollectionOptions] = useState<
        CollectionData[]
    >([]);
    const [missingInput, setMissingInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const {
        liveSpecs,
        error: liveSpecsError,
        isValidating: isValidatingLiveSpecs,
    } = useLiveSpecs('collection');

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const collections = useResourceConfig_collections();
    const discoveredCollections = useResourceConfig_discoveredCollections();
    const setRestrictedDiscoveredCollections =
        useResourceConfig_setRestrictedDiscoveredCollections();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const {
        draftSpecs,
        error: draftSpecsError,
        isValidating: isValidatingDraftSpecs,
    } = useDraftSpecs(persistedDraftId);

    const populateCollectionOptions = useMemo(() => {
        return entityType === 'materialization'
            ? liveSpecs.length > 0
            : !isValidatingLiveSpecs &&
                  !isValidatingDraftSpecs &&
                  draftSpecs.length > 0;
    }, [
        draftSpecs.length,
        entityType,
        liveSpecs.length,
        isValidatingDraftSpecs,
        isValidatingLiveSpecs,
    ]);

    useEffect(() => {
        if (populateCollectionOptions) {
            const liveSpecCollectionOptions: CollectionData[] =
                workflow === 'capture_create'
                    ? []
                    : liveSpecs.map(({ catalog_name }) => ({
                          name: catalog_name,
                          classification: existingCollectionsLabel,
                      }));

            const draftSpecCollectionOptions: CollectionData[] =
                entityType === 'capture'
                    ? draftSpecs
                          .filter(({ spec_type }) => spec_type === 'collection')
                          .map(({ catalog_name }) => ({
                              name: catalog_name,
                              classification: discoveredCollectionsLabel,
                          }))
                    : [];

            const draftSpecCollections: string[] =
                draftSpecCollectionOptions.map((collection) => collection.name);

            const collectionsOnServer: CollectionData[] = [
                ...draftSpecCollectionOptions,
                ...liveSpecCollectionOptions.filter(
                    ({ name }) => !draftSpecCollections.includes(name)
                ),
            ];

            setCollectionOptions(collectionsOnServer);
        }
    }, [
        setCollectionOptions,
        discoveredCollectionsLabel,
        draftSpecs,
        entityType,
        existingCollectionsLabel,
        liveSpecs,
        populateCollectionOptions,
        workflow,
    ]);

    const populateCollectionValues = useMemo(() => {
        return collections?.every((collection) =>
            collectionOptions.find(({ name }) => name === collection)
        );
    }, [collections, collectionOptions]);

    useEffect(() => {
        if (populateCollectionValues && collections) {
            const values = collections.map(
                (collection) =>
                    collectionOptions.find(
                        ({ name }) => name === collection
                    ) ?? {
                        name: collection,
                        classification: discoveredCollections?.includes(
                            collection
                        )
                            ? discoveredCollectionsLabel
                            : existingCollectionsLabel,
                    }
            );

            setCollectionValues(values);
        }
    }, [
        setCollectionValues,
        collections,
        collectionOptions,
        discoveredCollections,
        discoveredCollectionsLabel,
        existingCollectionsLabel,
        populateCollectionValues,
    ]);

    const handlers = {
        updateCollections: (
            event: React.SyntheticEvent,
            value: CollectionData[],
            reason: AutocompleteChangeReason
        ) => {
            const removeOptionWithBackspace = detectRemoveOptionWithBackspace(
                event,
                reason
            );

            if (!removeOptionWithBackspace) {
                setResourceConfig(value.map(({ name }) => name));

                if (value.length > 0 && discoveredCollections) {
                    const latestCollection = value[value.length - 1].name;

                    if (discoveredCollections.includes(latestCollection)) {
                        setRestrictedDiscoveredCollections(latestCollection);
                    }
                }
            }
        },
        validateSelection: () => {
            setMissingInput(!collections || collections.length === 0);
        },
    };

    const specError =
        entityType === 'materialization'
            ? liveSpecsError
            : liveSpecsError ?? draftSpecsError;

    return collectionOptions.length > 0 && !specError ? (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Autocomplete
                disabled={readOnly || formActive}
                multiple
                options={collectionOptions}
                groupBy={(option) => option.classification}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => isEqual(option, value)}
                value={collectionValues}
                inputValue={inputValue}
                size="small"
                fullWidth
                onChange={handlers.updateCollections}
                onInputChange={(_event, newInputValue, reason) => {
                    const inputBeingReset =
                        detectAutoCompleteInputReset(reason);

                    if (!inputBeingReset) {
                        setInputValue(newInputValue);
                    }
                }}
                blurOnSelect={false}
                disableCloseOnSelect
                disableClearable
                renderTags={() => null}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={collectionsLabel}
                        required
                        error={missingInput}
                        variant="standard"
                        onBlur={handlers.validateSelection}
                    />
                )}
                renderOption={(props, option, { selected }) => {
                    return (
                        // TODO (styling) weirdly the paddingLeft was getting overwritten
                        //  for dark mode and caused the icon to be too close to the edge
                        //  so hardcoding the padding here for now
                        <li {...props} style={{ paddingLeft: 24 }}>
                            <Box
                                sx={{
                                    ml: -2,
                                    mr: 0.5,
                                }}
                            >
                                <Check
                                    aria-checked={selected}
                                    style={{
                                        visibility: selected
                                            ? 'visible'
                                            : 'hidden',
                                    }}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    ...truncateTextSx,
                                }}
                            >
                                {option.name}
                            </Typography>
                        </li>
                    );
                }}
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
