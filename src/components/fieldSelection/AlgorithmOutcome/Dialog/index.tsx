import type { PostgrestError } from '@supabase/postgrest-js';
import type { AlgorithmOutcomeDialogProps } from 'src/components/fieldSelection/types';
import type { AlgorithmConfig } from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import type { FieldSelectionDictionary } from 'src/stores/Binding/slices/FieldSelection';

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

import AlgorithmOutcomeContent from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/Content';
import SaveButton from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/SaveButton';
import Error from 'src/components/shared/Error';
import useFieldSelectionAlgorithm from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import { BASE_ERROR } from 'src/services/supabase';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';

const AlgorithmOutcomeDialog = ({
    bindingUUID,
    closeMenu,
    loading,
    open,
    selections: projections,
    selectedAlgorithm,
    setOpen,
}: AlgorithmOutcomeDialogProps) => {
    const intl = useIntl();

    const { validateFieldSelection } = useFieldSelectionAlgorithm();

    const existingFieldSelection = useBindingStore(
        (state) => state.selections?.[bindingUUID] ?? {}
    );

    const [fieldSelection, setFieldSelection] =
        useState<FieldSelectionDictionary>({});

    const [serverError, setServerError] = useState<PostgrestError[] | null>(
        null
    );

    useEffect(() => {
        if (open && isEmpty(fieldSelection) && selectedAlgorithm) {
            const config: AlgorithmConfig | undefined =
                selectedAlgorithm === 'depthZero'
                    ? { depth: 0 }
                    : selectedAlgorithm === 'depthTwo'
                      ? { depth: 2 }
                      : {
                            depth:
                                typeof DEFAULT_RECOMMENDED_FLAG === 'number'
                                    ? DEFAULT_RECOMMENDED_FLAG
                                    : 1,
                        };

            validateFieldSelection(config).then(
                ({ builtBinding, fieldStanza, response }) => {
                    if (!response) {
                        return;
                    }

                    const updatedSelections = getFieldSelection(
                        response.outcomes,
                        fieldStanza,
                        builtBinding.collection.projections
                    );

                    setFieldSelection(updatedSelections);
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
        existingFieldSelection,
        fieldSelection,
        open,
        selectedAlgorithm,
        validateFieldSelection,
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

                <AlgorithmOutcomeContent fieldSelection={fieldSelection} />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
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
                    selections={projections}
                    selectedAlgorithm={selectedAlgorithm}
                />
            </DialogActions>
        </Dialog>
    );
};

export default AlgorithmOutcomeDialog;
