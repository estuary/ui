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
import CollectionSelectorSearch from './Selector/Search';
import { CollectionData } from './Selector/types';

interface Props {
    readOnly?: boolean;
}

function BindingSearch({ readOnly = false }: Props) {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

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

    return collectionOptions.length > 0 && !specError ? (
        <CollectionSelectorSearch
            options={collectionOptions}
            readOnly={readOnly || formActive}
            selectedCollections={collectionValues}
            onChange={(value) => {
                handlers.updateCollections(value as any);
            }}
            getValue={(option: CollectionData) => option.name}
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
    ) : null;
}

export default BindingSearch;
