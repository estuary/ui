import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function ManualSelectionButton() {
    const setBackfillTarget = usePreSavePromptStore((state) => {
        return state.context.setBackfillTarget;
    });

    const close = () => {
        setBackfillTarget();
    };

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default ManualSelectionButton;
