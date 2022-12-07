import { Box, Typography, useTheme } from '@mui/material';
import {
    BindingsEditorSkeleton,
    BindingsSelectorSkeleton,
} from 'components/collection/CollectionSkeletons';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { useEntityType } from 'context/EntityContext';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { isEqual } from 'lodash';
import { ReactNode, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_details_entityName,
} from 'stores/DetailsForm';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import {
    useResourceConfig_discoveredCollections,
    useResourceConfig_resetResourceConfigAndCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Schema } from 'types';

interface Props {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function BindingsMultiEditor({
    draftSpecs = [],
    readOnly = false,
    RediscoverButton,
}: Props) {
    const theme = useTheme();

    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    // Details Form Store
    const catalogName = useDetailsForm_details_entityName();
    const imageTag = useDetailsForm_connectorImage();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const discoveredCollections = useResourceConfig_discoveredCollections();

    const setResourceSchema = useResourceConfig_setResourceSchema();

    const resourceConfig = useResourceConfig_resourceConfig();
    const resetResourceConfigAndCollections =
        useResourceConfig_resetResourceConfigAndCollections();

    const setServerUpdateRequired = useResourceConfig_setServerUpdateRequired();

    const { connectorTag } = useConnectorTag(imageTag.id);

    useEffect(() => {
        if (
            connectorId !== connectorTag?.connector_id &&
            connectorTag?.resource_spec_schema
        ) {
            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );
        }
    }, [
        setResourceSchema,
        connectorId,
        connectorTag?.connector_id,
        connectorTag?.resource_spec_schema,
    ]);

    const resourceConfigUpdated = useMemo(() => {
        let queriedResourceConfig: ResourceConfigDictionary = {};

        const collectionNameProp =
            entityType === 'materialization' ? 'source' : 'target';

        draftSpecs[0]?.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding[collectionNameProp]]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        return draftSpecs.length > 0
            ? !isEqual(resourceConfig, queriedResourceConfig)
            : false;
    }, [draftSpecs, entityType, resourceConfig]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);

    const removeDiscoveredCollectionOptions = useMemo(() => {
        if (
            workflow === 'capture_create' &&
            discoveredCollections &&
            discoveredCollections.length > 0 &&
            draftSpecs.length > 0
        ) {
            let truncatedServerCatalogName: string | null = null;

            const catalogNameOnServer = draftSpecs[0].catalog_name;

            const lastSlashIndex = catalogNameOnServer.lastIndexOf('/');

            if (lastSlashIndex !== -1) {
                truncatedServerCatalogName = catalogNameOnServer.slice(
                    0,
                    lastSlashIndex
                );
            }

            return truncatedServerCatalogName
                ? truncatedServerCatalogName !== catalogName
                : false;
        } else {
            return false;
        }
    }, [catalogName, discoveredCollections, draftSpecs, workflow]);

    useEffect(() => {
        if (removeDiscoveredCollectionOptions) {
            resetResourceConfigAndCollections();
        }
    }, [resetResourceConfigAndCollections, removeDiscoveredCollectionOptions]);

    const { liveSpecs } = useLiveSpecs('collection');

    const fetchingSpecs =
        entityType === 'materialization'
            ? liveSpecs.length === 0
            : draftSpecs.length === 0;

    return (
        <>
            {/* {entityType === 'capture' ? ( */}
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h5">
                    <FormattedMessage
                        id={`${messagePrefix}.collectionSelector.heading`}
                    />
                </Typography>

                {RediscoverButton ?? null}
            </Box>
            {/* ) : (
                <Typography variant="h5" sx={{ mb: 1 }}>
                    <FormattedMessage
                        id={`${messagePrefix}.collectionSelector.heading`}
                    />
                </Typography>
            )} */}

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <ListAndDetails
                list={
                    <BindingSelector
                        loading={fetchingSpecs}
                        skeleton={<BindingsSelectorSkeleton />}
                        readOnly={readOnly}
                    />
                }
                details={
                    <BindingsEditor
                        loading={fetchingSpecs}
                        skeleton={<BindingsEditorSkeleton />}
                        readOnly={readOnly}
                    />
                }
                backgroundColor={
                    alternativeReflexContainerBackground[theme.palette.mode]
                }
                displayBorder={true}
            />
        </>
    );
}

export default BindingsMultiEditor;
