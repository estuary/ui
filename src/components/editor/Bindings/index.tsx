import { ReactNode, useEffect, useMemo } from 'react';

import { isEqual } from 'lodash';
import { Schema } from 'types';
import { FormattedMessage, useIntl } from 'react-intl';

import { Typography, useTheme } from '@mui/material';

import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { createEditorStore } from 'components/editor/Store/create';

import { useEntityType } from 'context/EntityContext';
import { LocalZustandProvider } from 'context/LocalZustand';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';

import {
    useDetailsForm_connectorImage,
    useDetailsForm_details_entityName,
} from 'stores/DetailsForm/hooks';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import { EditorStoreNames } from 'stores/names';
import {
    useResourceConfig_discoveredCollections,
    useResourceConfig_resetResourceConfigAndCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';

import { getCollectionName, getCollectionNameProp } from 'utils/workflow-utils';

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
    const intl = useIntl();
    const theme = useTheme();

    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

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

        const collectionNameProp = getCollectionNameProp(entityType);

        draftSpecs[0]?.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [getCollectionName(binding[collectionNameProp])]: {
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
            const catalogNameOnServer = draftSpecs[0].catalog_name;

            return catalogNameOnServer
                ? !catalogNameOnServer.startsWith(catalogName)
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

    // For captures we want to show the bindings config as "Bindings"
    //  Other entities we still call them "collections" so we set to undefined
    //      as the default display is "collections"
    const itemType =
        entityType === 'capture'
            ? intl.formatMessage({ id: 'terms.bindings' })
            : undefined;

    return (
        <LocalZustandProvider createStore={localStore}>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <ListAndDetails
                list={
                    <BindingSelector
                        itemType={itemType}
                        shortenName={entityType === 'capture'}
                        readOnly={readOnly}
                        RediscoverButton={RediscoverButton}
                    />
                }
                details={<BindingsEditor readOnly={readOnly} />}
                backgroundColor={
                    alternativeReflexContainerBackground[theme.palette.mode]
                }
                displayBorder={true}
                height={550}
            />
        </LocalZustandProvider>
    );
}

export default BindingsMultiEditor;
