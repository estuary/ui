import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { TargetNamingStrategy } from 'src/types';

import { useCallback, useRef, useState } from 'react';

import { Button } from '@mui/material';

import { useStore } from 'zustand';

import { FormattedMessage } from 'react-intl';

import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import invariableStores from 'src/context/Zustand/invariableStores';
import useApplyCollectionSelections from 'src/hooks/materialization/useApplyCollectionSelections';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';

function UpdateResourceConfigButton({ toggle }: AddCollectionDialogCTAProps) {
    const [updating, setUpdating] = useState(false);

    const confirmationContext = useConfirmationModalContext();

    const defaultStrategyRef = useRef<TargetNamingStrategy>({
        strategy: 'matchSourceStructure',
    });
    const handleNamingChange = useCallback(
        (strategy: TargetNamingStrategy, isValid: boolean) => {
            defaultStrategyRef.current = strategy;
            confirmationContext?.setContinueAllowed(isValid);
        },
        [confirmationContext]
    );

    const selected = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => state.selected
    );

    const {
        targetNamingStrategy,
        needsNamingDialog,
        handleConfirm,
    } = useTargetNaming();

    const applyCollectionSelections = useApplyCollectionSelections();

    // Pass appliedStrategy explicitly so the caller can provide the just-confirmed
    // value without relying on a stale store closure.
    const close = (
        appliedStrategy: TargetNamingStrategy | null | undefined
    ) => {
        setUpdating(true);
        const selectedItems = Array.from(selected).map(([_id, row]) => row);
        applyCollectionSelections(appliedStrategy, selectedItems);
        setUpdating(false);
        toggle(false);
    };

    const handleContinue = async () => {
        if (needsNamingDialog) {
            defaultStrategyRef.current = {
                strategy: 'matchSourceStructure',
            };

            const exampleCollections = Array.from(selected).map(
                ([_id, row]) => row.catalog_name
            );

            const confirmed = await confirmationContext?.showConfirmation(
                {
                    title: 'destinationLayout.dialog.title',
                    confirmText: 'destinationLayout.dialog.cta.addBindings',
                    dialogProps: {
                        maxWidth: 'md',
                    },
                    message: (
                        <TargetNamingFormContent
                            initialStrategy={targetNamingStrategy}
                            exampleCollections={exampleCollections}
                            onChange={handleNamingChange}
                        />
                    ),
                },
                true
            );

            if (!confirmed) return;
            await handleConfirm(defaultStrategyRef.current, () =>
                close(defaultStrategyRef.current)
            );
            return;
        }
        close(targetNamingStrategy);
    };

    return (
        <Button
            variant="contained"
            disabled={selected.size < 1 || updating}
            onClick={handleContinue}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default UpdateResourceConfigButton;
