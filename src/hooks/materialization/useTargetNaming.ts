import type { TargetNamingStrategy } from 'src/types';

import { useCallback, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useWriteRootTargetNaming } from 'src/hooks/materialization/useWriteRootTargetNaming';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

function useTargetNaming() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [model, setStrategy, setSaving, targetNamingStrategy, saving] =
        useTargetNamingStore(
            useShallow((state) => [
                state.model,
                state.setTargetNamingStrategy,
                state.setSaving,
                state.targetNamingStrategy,
                state.saving,
            ])
        );

    const writeRootTargetNaming = useWriteRootTargetNaming();

    const { sourceCaptureTargetSchemaSupported } =
        useBinding_sourceCaptureFlags();

    // This could keep targetNaming in sync with the draft - does removing as we are
    //  moving away from always available advanced spec editor
    // const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    // Derive strategy from the live spec so advanced-editor changes propagate to
    // the store. The store stays authoritative for rendering; this effect keeps
    // it in sync when the spec is modified outside the normal dialog flow.
    // const specStrategy = useMemo<TargetNamingStrategy | null>(() => {
    //     const spec = draftSpecs[0]?.spec;
    //     if (spec?.targetNaming && typeof spec.targetNaming === 'object') {
    //         return spec.targetNaming as TargetNamingStrategy;
    //     }
    //     return null;
    // }, [draftSpecs]);
    // useEffect(() => {
    //     // TODO (target naming:post migration:remove)
    //     // We do not need to worry about this unless we are using the new method
    //     if (model !== 'rootTargetNaming') {
    //         return;
    //     }

    //     setStrategy(specStrategy);
    // }, [specStrategy, setStrategy, model]);

    // needsNamingDialog is fully controlled by the hydrator:
    //   create → model is always 'rootTargetNaming'
    //   edit   → model is 'rootTargetNaming' only for new-model specs
    const needsNamingDialog =
        sourceCaptureTargetSchemaSupported &&
        model === 'rootTargetNaming' &&
        targetNamingStrategy === null;

    const [targetNamingDialogOpen, setTargetNamingDialogOpen] = useState(false);
    const openNamingDialog = useCallback(
        () => setTargetNamingDialogOpen(true),
        []
    );
    const closeNamingDialog = useCallback(
        () => setTargetNamingDialogOpen(false),
        []
    );

    const updateStrategy = useCallback(
        (newStrategy: TargetNamingStrategy | null): Promise<void> => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            return writeRootTargetNaming(newStrategy)
                .then(() => {
                    setStrategy(newStrategy);
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch((error) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );
                    setFormState({ status: FormStatus.FAILED });
                    return Promise.reject(error);
                })
                .finally(() => setSaving(false));
        },
        [
            enqueueSnackbar,
            intl,
            setFormState,
            setSaving,
            setStrategy,
            writeRootTargetNaming,
        ]
    );

    const handleConfirm = useCallback(
        (
            newStrategy: TargetNamingStrategy,
            onSuccess?: () => void
        ): Promise<void> => {
            return updateStrategy(newStrategy).then(() => {
                closeNamingDialog();
                onSuccess?.();
            });
        },
        [closeNamingDialog, updateStrategy]
    );

    return {
        targetNamingStrategy,
        model,
        saving,
        needsNamingDialog,
        updateStrategy,
        handleConfirm,
        targetNamingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    };
}

export default useTargetNaming;
