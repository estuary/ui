import { Box, Skeleton, TextField } from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useDraftSpecs from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import { stripName, stripPathing } from 'utils/misc-utils';
import CollectionSelectorSearch from './Selector/Search';
import { CollectionData } from './Selector/types';

interface Props {
    itemType?: string;
    emptyListComponent?: ReactNode;
    readOnly?: boolean;
    shortenName?: boolean;
}

function BindingSearch({
    itemType,
    emptyListComponent,
    shortenName,
    readOnly = false,
}: Props) {
    const entityType = useEntityType();
    const workFlow = useEntityWorkflow();

    const intl = useIntl();
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

    // We want the entityName so during edit of capture we can
    //  make sure we only fetch liveSpecs that match the capture
    const entityName = useDetailsForm_details_entityName();

    // If we are in capture create then we only show discovered
    const specType = workFlow !== 'capture_create' ? 'collection' : undefined;

    // During capture edit we only want to show things that match the name
    const specTypeFilter =
        workFlow === 'capture_edit' && entityName
            ? stripName(entityName)
            : undefined;

    // Query to fetch the current live specs to populate the Available Collections
    const {
        liveSpecs,
        error: liveSpecsError,
        isValidating: isValidatingLiveSpecs,
    } = useLiveSpecs(specType, specTypeFilter);

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
                workFlow === 'capture_create'
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
        discoveredCollectionsLabel,
        draftSpecs,
        entityType,
        existingCollectionsLabel,
        liveSpecs,
        populateCollectionOptions,
        workFlow,
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
        updateCollections: (value: CollectionData[]) => {
            setResourceConfig(value.map(({ name }) => name));

            if (value.length > 0 && discoveredCollections) {
                const latestCollection = value[value.length - 1].name;

                if (discoveredCollections.includes(latestCollection)) {
                    setRestrictedDiscoveredCollections(latestCollection);
                }
            }
        },
    };

    const specError =
        entityType === 'materialization'
            ? liveSpecsError
            : liveSpecsError ?? draftSpecsError;

    if (!populateCollectionOptions) {
        return (
            <Box sx={{ p: 1 }}>
                <Skeleton width="100%">
                    <TextField />
                </Skeleton>
            </Box>
        );
    }

    if (collectionOptions.length > 0 && !specError) {
        return (
            <CollectionSelectorSearch
                itemType={itemType}
                options={collectionOptions}
                readOnly={readOnly || formActive}
                selectedCollections={collectionValues}
                onChange={(value) => {
                    handlers.updateCollections(value as any);
                }}
                getValue={(option: CollectionData) =>
                    shortenName ? stripPathing(option.name) : option.name
                }
                AutocompleteProps={{
                    getOptionLabel: (option: CollectionData) => option.name,
                    groupBy: (option: CollectionData) => option.classification,
                    componentsProps: {
                        paper: {
                            sx: {
                                minWidth: 200,
                                width: '33vw',
                            },
                        },
                    },
                }}
            />
        );
    }

    if (emptyListComponent) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{emptyListComponent}</>;
    }

    return null;
}

export default BindingSearch;
