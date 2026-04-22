import type { TargetNamingStrategy } from 'src/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useWriteRootTargetNaming } from 'src/hooks/materialization/useWriteRootTargetNaming';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

function useTargetNaming() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [model, setStrategy, setSaving, strategy, saving] =
        useTargetNamingStore(
            useShallow((state) => [
                state.model,
                state.setStrategy,
                state.setSaving,
                state.strategy,
                state.saving,
            ])
        );

    const writeRootTargetNaming = useWriteRootTargetNaming();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Derive strategy from the live spec so advanced-editor changes propagate to
    // the store. The store stays authoritative for rendering; this effect keeps
    // it in sync when the spec is modified outside the normal dialog flow.
    const specStrategy = useMemo<TargetNamingStrategy | null>(() => {
        const spec = draftSpecs[0]?.spec;
        if (spec?.targetNaming && typeof spec.targetNaming === 'object') {
            return spec.targetNaming as TargetNamingStrategy;
        }
        return null;
    }, [draftSpecs]);

    useEffect(() => {
        if (specStrategy !== null) {
            setStrategy(specStrategy);
        }
    }, [specStrategy, setStrategy]);

    // needsNamingDialog is fully controlled by the hydrator:
    //   create → model is always 'rootTargetNaming'
    //   edit   → model is 'rootTargetNaming' only for new-model specs
    const needsNamingDialog = model === 'rootTargetNaming' && strategy === null;

    const [namingDialogOpen, setNamingDialogOpen] = useState(false);
    const openNamingDialog = useCallback(() => setNamingDialogOpen(true), []);
    const closeNamingDialog = useCallback(() => setNamingDialogOpen(false), []);

    const updateStrategy = useCallback(
        (newStrategy: TargetNamingStrategy): Promise<void> => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            return writeRootTargetNaming(newStrategy)
                .then(() => {
                    setStrategy(newStrategy);
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );
                    setFormState({ status: FormStatus.FAILED });
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

    const clearStrategy = useCallback((): Promise<void> => {
        setFormState({ status: FormStatus.UPDATING, error: null });
        setSaving(true);

        return writeRootTargetNaming(undefined)
            .then(() => {
                setStrategy(null);
                setFormState({ status: FormStatus.UPDATED });
            })
            .catch(() => {
                enqueueSnackbar(
                    intl.formatMessage({ id: 'specPropEditor.update.error' }),
                    { ...snackbarSettings, variant: 'error' }
                );
                setFormState({ status: FormStatus.FAILED });
            })
            .finally(() => setSaving(false));
    }, [enqueueSnackbar, intl, setFormState, setSaving, setStrategy, writeRootTargetNaming]);

    return {
        strategy,
        model,
        saving,
        needsNamingDialog,
        updateStrategy,
        clearStrategy,
        namingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    };
}

export default useTargetNaming;
