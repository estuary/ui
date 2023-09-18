import { Chip } from '@mui/material';
import invariableStores from 'context/Zustand/invariableStores';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useStore } from 'zustand';
import useSourceCapture from '../useSourceCapture';

function SourceCaptureChip() {
    const formActive = useFormStateStore_isActive();

    const updateDraft = useSourceCapture();

    const [sourceCapture, setSourceCapture] = useStore(
        invariableStores['source-capture'],
        (state) => {
            return [state.sourceCapture, state.setSourceCapture];
        }
    );

    const saving = useStore(invariableStores['source-capture'], (state) => {
        return state.saving;
    });

    const disabled = saving || formActive;

    if (!sourceCapture) {
        return (
            <Chip
                color="warning"
                disabled={disabled}
                label={
                    <FormattedMessage id="workflows.sourceCapture.selected.none" />
                }
            />
        );
    }

    return (
        <Chip
            color="success"
            disabled={disabled}
            label={sourceCapture}
            onDelete={async () => {
                setSourceCapture(null);
                await updateDraft();
            }}
        />
    );
}

export default SourceCaptureChip;
