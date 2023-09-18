import { Chip } from '@mui/material';
import invariableStores from 'context/Zustand/invariableStores';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useStore } from 'zustand';

function SourceCaptureChip() {
    const formActive = useFormStateStore_isActive();

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

    console.log('sourceCapture', sourceCapture);

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
            onDelete={() => {
                setSourceCapture(null);
            }}
        />
    );
}

export default SourceCaptureChip;
