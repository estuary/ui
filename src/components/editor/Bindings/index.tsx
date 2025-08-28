import type { ReactNode } from 'react';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';

import { useEffect, useMemo } from 'react';

import { Stack, Typography, useTheme } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import AutoDiscoverySettings from 'src/components/capture/AutoDiscoverySettings';
import CaptureInterval from 'src/components/capture/Interval';
import BindingsEditor from 'src/components/editor/Bindings/Editor';
import BindingSelector from 'src/components/editor/Bindings/Selector';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import { createEditorStore } from 'src/components/editor/Store/create';
import AdvancedOptions from 'src/components/materialization/AdvancedOptions';
import SourceCapture from 'src/components/materialization/source/Capture';
import Backfill from 'src/components/shared/Entity/Backfill';
import { useEntityType } from 'src/context/EntityContext';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import { alternativeReflexContainerBackground } from 'src/context/Theme';
import { useEntityWorkflow } from 'src/context/Workflow';
import useValidateFieldSelection from 'src/hooks/fieldSelection/useValidateFieldSelection';
import { useServerUpdateRequiredMonitor } from 'src/hooks/useServerUpdateRequiredMonitor';
import {
    useBinding_discoveredCollections,
    useBinding_removeDiscoveredBindings,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_messagePrefix } from 'src/stores/FormState/hooks';
import { EditorStoreNames } from 'src/stores/names';

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
    useValidateFieldSelection();

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
            <Stack spacing={5} sx={{ mb: 5 }}>
                {entityType === 'capture' ? <AutoDiscoverySettings /> : null}

                {entityType === 'capture' ? <CaptureInterval /> : null}

                {entityType === 'materialization' ? <SourceCapture /> : null}

                {/*Materializations show this in the advanced options*/}
                {entityType === 'capture' ? <Backfill /> : null}

                <AdvancedOptions />
            </Stack>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <ListAndDetails
                list={
                    <BindingSelector
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
