import type { PostgrestError } from '@supabase/postgrest-js';
import type { AlgorithmOutcomeDialogProps } from 'src/components/fieldSelection/AlgorithmOutcome/types';
import type { AlgorithmConfig } from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import type { FieldSelectionDictionary } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldOutcome } from 'src/types/wasm';

import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';

import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import SaveButton from 'src/components/editor/Bindings/FieldSelection/FieldActions/SaveButton';
import AlgorithmOutcomeContent from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/Content';
import Error from 'src/components/shared/Error';
import useFieldSelectionAlgorithm from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import { BASE_ERROR } from 'src/services/supabase';
import { useBindingStore } from 'src/stores/Binding/Store';
import { getAlgorithmicFieldSelection } from 'src/utils/workflow-utils';

const AlgorithmOutcomeDialog = ({
    bindingUUID,
    closeMenu,
    loading,
    open,
    projections,
    selectedAlgorithm,
    setOpen,
}: AlgorithmOutcomeDialogProps) => {
    const intl = useIntl();

    const { applyFieldSelectionAlgorithm } = useFieldSelectionAlgorithm();

    const existingFieldSelection = useBindingStore(
        (state) => state.selections?.[bindingUUID] ?? {}
    );

    const [fieldOutcomes, setFieldOutcomes] = useState<FieldOutcome[]>([]);
    const [fieldSelection, setFieldSelection] =
        useState<FieldSelectionDictionary>({});

    const [serverError, setServerError] = useState<PostgrestError[] | null>(
        null
    );

    useEffect(() => {
        if (
            open &&
            isEmpty(fieldSelection) &&
            projections &&
            selectedAlgorithm
        ) {
            const config: AlgorithmConfig | undefined =
                selectedAlgorithm === 'depthOne' ? { depth: 1 } : undefined;

            applyFieldSelectionAlgorithm(
                selectedAlgorithm,
                projections,
                config
            ).then(
                ({ fieldStanza, response }) => {
                    if (!response) {
                        return;
                    }
                    const selectedFields = [
                        response.selection.document,
                        ...response.selection.keys,
                        ...(response.selection?.values ?? []),
                    ];

                    const updatedSelections = getAlgorithmicFieldSelection(
                        existingFieldSelection,
                        projections,
                        selectedFields,
                        fieldStanza?.recommended
                    );

                    setFieldSelection(updatedSelections);
                    setFieldOutcomes(response.outcomes);
                },
                (errors: string | string[]) => {
                    if (typeof errors === 'string') {
                        setServerError([{ ...BASE_ERROR, message: errors }]);

                        return;
                    }

                    const formattedErrors: PostgrestError[] = errors.map(
                        (error) => ({ ...BASE_ERROR, message: error })
                    );

                    setServerError(formattedErrors);
                }
            );
        }
    }, [
        applyFieldSelectionAlgorithm,
        existingFieldSelection,
        fieldSelection,
        open,
        projections,
        selectedAlgorithm,
    ]);

    return (
        <Dialog
            aria-labelledby="test"
            maxWidth="lg"
            open={open}
            style={{ minWidth: 500 }}
        >
            <DialogTitle>
                {intl.formatMessage({
                    id: 'fieldSelection.reviewDialog.header',
                })}
            </DialogTitle>

            <DialogContent>
                {serverError ? (
                    <Box style={{ marginBottom: 16 }}>
                        <Error condensed error={serverError} severity="error" />
                    </Box>
                ) : null}

                <Typography sx={{ mb: 3 }}>
                    {intl.formatMessage({
                        id: 'fieldSelection.reviewDialog.description',
                    })}
                </Typography>

                <AlgorithmOutcomeContent
                    fieldSelection={fieldSelection}
                    outcomes={fieldOutcomes}
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        setFieldOutcomes([]);
                        setFieldSelection({});
                        setServerError(null);
                        setOpen(false);
                    }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <SaveButton
                    bindingUUID={bindingUUID}
                    close={closeMenu}
                    fieldSelection={fieldSelection}
                    loading={loading}
                    projections={projections}
                    selectedAlgorithm={selectedAlgorithm}
                />
            </DialogActions>
        </Dialog>
    );
};

export default AlgorithmOutcomeDialog;
