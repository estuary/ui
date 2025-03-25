import { Stack, Typography, useTheme } from '@mui/material';
import AutoDiscoverySettings from 'components/capture/AutoDiscoverySettings';
import CaptureInterval from 'components/capture/Interval';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { createEditorStore } from 'components/editor/Store/create';
import SourceCapture from 'components/materialization/SourceCapture';
import Backfill from 'components/shared/Entity/Backfill';
import { useEntityType } from 'context/EntityContext';
import { LocalZustandProvider } from 'context/LocalZustand';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';

import AdvancedOptions from 'components/materialization/AdvancedOptions';
import type { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useServerUpdateRequiredMonitor } from 'hooks/useServerUpdateRequiredMonitor';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useBinding_discoveredCollections,
    useBinding_removeDiscoveredBindings,
} from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import { EditorStoreNames } from 'stores/names';

interface Props {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

const height = 550;

function BindingsMultiEditor({
    draftSpecs = [],
    readOnly = false,
    RediscoverButton,
}: Props) {
    // This keeps an eye on resource config and updates if there is a need
    useServerUpdateRequiredMonitor(draftSpecs);

    const intl = useIntl();
    const theme = useTheme();

    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    // Binding Store
    const discoveredCollections = useBinding_discoveredCollections();
    const removeDiscoveredBindings = useBinding_removeDiscoveredBindings();

    // Details Form Store
    const catalogName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const removeDiscoveredCollectionOptions = useMemo(() => {
        if (
            workflow === 'capture_create' &&
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
    }, [catalogName, discoveredCollections.length, draftSpecs, workflow]);

    useEffect(() => {
        if (removeDiscoveredCollectionOptions) {
            removeDiscoveredBindings();
        }
    }, [removeDiscoveredBindings, removeDiscoveredCollectionOptions]);

    // For captures we want to show the bindings config as "Bindings"
    //  Other entities we still call them "collections" so we set to undefined
    //      as the default display is "collections"
    const itemType =
        entityType === 'capture'
            ? intl.formatMessage({ id: 'terms.bindings' })
            : intl.formatMessage({ id: 'terms.collections' });

    return (
        <LocalZustandProvider createStore={localStore}>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <Stack spacing={5} sx={{ mb: 5 }}>
                {entityType === 'capture' ? <AutoDiscoverySettings /> : null}

                {entityType === 'capture' ? <CaptureInterval /> : null}

                {entityType === 'materialization' ? <SourceCapture /> : null}

                <Backfill />

                <AdvancedOptions />
            </Stack>

            <ListAndDetails
                list={
                    <BindingSelector
                        height={height - 25}
                        itemType={itemType}
                        readOnly={readOnly}
                        RediscoverButton={RediscoverButton}
                    />
                }
                details={
                    <BindingsEditor itemType={itemType} readOnly={readOnly} />
                }
                backgroundColor={
                    alternativeReflexContainerBackground[theme.palette.mode]
                }
                displayBorder={true}
                height={height}
            />
        </LocalZustandProvider>
    );
}

export default BindingsMultiEditor;
