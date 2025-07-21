import type { GenerateButtonProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlgorithmOutcomeDialog from 'src/components/fieldSelection/AlgorithmOutcome/Dialog';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

const GenerateButton = ({
    bindingUUID,
    closeMenu,
    loading,
    selections,
    selectedAlgorithm,
}: GenerateButtonProps) => {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                disabled={
                    loading ||
                    formActive ||
                    !hasLength(selections) ||
                    !selectedAlgorithm
                }
                onClick={() => setOpen(true)}
                size="small"
                variant="outlined"
            >
                {intl.formatMessage({ id: 'cta.review' })}
            </Button>

            <AlgorithmOutcomeDialog
                bindingUUID={bindingUUID}
                closeMenu={closeMenu}
                loading={loading}
                open={open}
                selections={selections}
                selectedAlgorithm={selectedAlgorithm}
                setOpen={setOpen}
            />
        </>
    );
};

export default GenerateButton;
