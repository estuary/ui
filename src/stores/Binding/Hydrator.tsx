import type { BaseComponentProps, SourceCaptureDef, TargetNamingStrategy } from 'src/types';

import { useEffect, useRef } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import {
    useEntityWorkflow,
    useEntityWorkflow_Editing,
} from 'src/context/Workflow';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import useTrialPrefixes from 'src/hooks/trialStorage/useTrialPrefixes';
import { logRocketConsole } from 'src/services/shared';
import {
    useBinding_hydrated,
    useBinding_hydrateState,
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { hasLength } from 'src/utils/misc-utils';

export const BindingHydrator = ({ children }: BaseComponentProps) => {
    // We want to manually control this in a REF to not fire extra effect calls
    const rehydrating = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const getTrialPrefixes = useTrialPrefixes();

    const connectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const hydrated = useBinding_hydrated();
    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

    const setPrefilledCapture = useSourceCaptureStore(
        (state) => state.setPrefilledCapture
    );

    // These callbacks may change between renders; use a ref so the effect
    // closure always calls the latest version without re-running the effect.
    const confirmationContext = useConfirmationModalContext();
    const { handleConfirm } = useTargetNaming();
    const { updateDraft } = useSourceCapture();

    const callbacksRef = useRef({ confirmationContext, handleConfirm, updateDraft });
    callbacksRef.current = { confirmationContext, handleConfirm, updateDraft };

    useEffect(() => {
        if (
            (workflow && connectorTagId.length > 0) ||
            workflow === 'collection_create'
        ) {
            setActive(true);

            // TODO (Workflow Hydrator) - when moving bindings into the parent hydrator
            //  make sure that we allow resetting everything in the store except for the bindings
            //  themselves. That way `hydrateState` won't have to call `resetState` with a bunch of flags... hopefully
            hydrateState(
                editWorkflow,
                entityType,
                connectorTagId,
                getTrialPrefixes,
                rehydrating.current
            )
                .then(
                    async (response) => {
                        if (!response || response.length === 0) return;

                        // Build the collection list and find the source capture
                        const allCollections: string[] = [];
                        let captureName: string | null = null;

                        for (const entry of response) {
                            if (entry.spec_type === 'capture') {
                                if (!captureName)
                                    captureName = entry.catalog_name;
                                for (const col of entry.writes_to ?? []) {
                                    if (!allCollections.includes(col))
                                        allCollections.push(col);
                                }
                            } else {
                                if (
                                    !allCollections.includes(entry.catalog_name)
                                )
                                    allCollections.push(entry.catalog_name);
                            }
                        }

                        const { resourceConfigPointers } =
                            useBindingStore.getState();
                        const targetSchemaSupported = hasLength(
                            resourceConfigPointers?.x_schema_name
                        );

                        if (
                            !editWorkflow &&
                            targetSchemaSupported &&
                            allCollections.length > 0
                        ) {
                            const { confirmationContext: ctx, handleConfirm: confirm, updateDraft: writeDraft } =
                                callbacksRef.current;

                            let pendingStrategy: TargetNamingStrategy = {
                                strategy: 'matchSourceStructure',
                            };

                            const confirmed = await ctx?.showConfirmation(
                                {
                                    title: 'destinationLayout.dialog.title',
                                    confirmText:
                                        'destinationLayout.dialog.cta.addBindings',
                                    dialogProps: { maxWidth: 'md' },
                                    message: (
                                        <TargetNamingFormContent
                                            initialStrategy={null}
                                            exampleCollections={allCollections}
                                            onChange={(strategy, isValid) => {
                                                pendingStrategy = strategy;
                                                ctx.setContinueAllowed(isValid);
                                            }}
                                        />
                                    ),
                                },
                                true
                            );

                            if (confirmed) {
                                const sourceCaptureDef: SourceCaptureDef | undefined =
                                    captureName
                                        ? { capture: captureName }
                                        : undefined;

                                await confirm(pendingStrategy, () => {
                                    useBindingStore
                                        .getState()
                                        .prefillResourceConfigs(
                                            allCollections,
                                            true,
                                            sourceCaptureDef,
                                            pendingStrategy
                                        );
                                    if (captureName) {
                                        void writeDraft(captureName);
                                        setPrefilledCapture(captureName);
                                    }
                                });
                            }
                        } else {
                            // Fallback: preserve old behavior for edit workflows or
                            // connectors without root target naming support.
                            useBindingStore
                                .getState()
                                .addEmptyBindings(response, rehydrating.current);
                            if (captureName && !editWorkflow) {
                                setPrefilledCapture(captureName);
                            }
                        }
                    },
                    (error) => {
                        logRocketConsole(
                            'Failed to hydrate binding-dependent views',
                            error
                        );

                        setHydrationErrorsExist(true);
                    }
                )
                .finally(() => {
                    rehydrating.current = true;
                    setHydrated(true);

                    setActive(false);
                });
        }
    }, [
        connectorTagId,
        editWorkflow,
        entityType,
        getTrialPrefixes,
        hydrateState,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setPrefilledCapture,
        workflow,
    ]);

    if (!hydrated) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BindingHydrator;
