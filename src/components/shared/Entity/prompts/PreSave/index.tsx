import { Dialog } from '@mui/material';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSavePrompt() {
    const [activeStep, show] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.show,
    ]);

    return (
        <Dialog maxWidth={activeStep === 0 ? 'lg' : 'md'} fullWidth open={show}>
            <Title />
            <Content />
            <Actions />
        </Dialog>
    );
}

export default PreSavePrompt;
