import { Dialog } from '@mui/material';
import { useFormStateStore_showPreSavePrompt } from 'stores/FormState/hooks';
import usePreSavePromptSteps from '../steps/preSave/usePreSavePromptSteps';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSave() {
    const { activeStep } = usePreSavePromptSteps();

    const showPreSavePrompt = useFormStateStore_showPreSavePrompt();

    return (
        <Dialog
            maxWidth={activeStep === 0 ? 'lg' : 'md'}
            fullWidth
            open={showPreSavePrompt}
        >
            <Title />
            <Content />
            <Actions />
        </Dialog>
    );
}

export default PreSave;
