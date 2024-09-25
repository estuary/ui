import { Dialog } from '@mui/material';
import { useFormStateStore_showSavePrompt } from 'stores/FormState/hooks';
import PromptsHydrator from '../store/Hydrator';
import { usePreSavePromptStore_onFirstStep } from '../store/usePreSavePromptStore';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSavePrompt() {
    const showSavePrompt = useFormStateStore_showSavePrompt();
    const onFirstStep = usePreSavePromptStore_onFirstStep();

    return (
        <Dialog
            maxWidth={onFirstStep ? 'lg' : 'md'}
            fullWidth
            open={showSavePrompt}
        >
            <PromptsHydrator>
                <Title />
                <Content />
                <Actions />
            </PromptsHydrator>
        </Dialog>
    );
}

export default PreSavePrompt;
