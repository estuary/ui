import { Button } from '@mui/material';

import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import { useSubmitMaterializationForm } from 'src/components/materialization/useSubmitMaterializationForm';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function MaterializeGenerateButton() {
    const submitForm = useSubmitMaterializationForm();
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();

    return (
        <Button
            onClick={() => {
                void submitForm();
            }}
            disabled={isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            Next
        </Button>
    );
}

export default MaterializeGenerateButton;
