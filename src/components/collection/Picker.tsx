import {
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    TextField,
} from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useDraftSpecs from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
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
import { detectRemoveOptionWithBackspace } from 'utils/mui-utils';

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

    const [collectionData, setCollectionData] = useState<CollectionData[]>([]);
    const [missingInput, setMissingInput] = useState(false);

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

    const populateCollectionData = useMemo(() => {
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
        if (populateCollectionData) {
            const liveSpecCollectionData: CollectionData[] =
                workflow === 'capture_create'
                    ? []
                    : liveSpecs.map(({ catalog_name }) => ({
                          name: catalog_name,
                          classification: existingCollectionsLabel,
                      }));

            const draftSpecCollectionData: CollectionData[] =
                entityType === 'capture'
                    ? draftSpecs
                          .filter(({ spec_type }) => spec_type === 'collection')
                          .map(({ catalog_name }) => ({
                              name: catalog_name,
                              classification: discoveredCollectionsLabel,
                          }))
                    : [];

            const draftSpecCollections: string[] = draftSpecCollectionData.map(
                (collection) => collection.name
            );

            const collectionsOnServer: CollectionData[] = [
                ...draftSpecCollectionData,
                ...liveSpecCollectionData.filter(
                    ({ name }) => !draftSpecCollections.includes(name)
                ),
            ];

            setCollectionData(collectionsOnServer);
        }
    }, [
        setCollectionData,
        discoveredCollectionsLabel,
        draftSpecs,
        entityType,
        existingCollectionsLabel,
        liveSpecs,
        populateCollectionData,
        workflow,
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

    return collections && collectionData.length > 0 && !specError ? (
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
                options={collectionData}
                groupBy={(option) => option.classification}
                getOptionLabel={(option) => option.name}
                value={collections.map(
                    (collectionName) =>
                        collectionData.find(
                            ({ name }) => name === collectionName
                        ) ?? {
                            name: collectionName,
                            classification: discoveredCollections?.includes(
                                collectionName
                            )
                                ? discoveredCollectionsLabel
                                : existingCollectionsLabel,
                        }
                )}
                size="small"
                filterSelectedOptions
                fullWidth
                onChange={handlers.updateCollections}
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
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
