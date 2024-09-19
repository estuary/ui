import { Dialog } from '@mui/material';
import PromptsHydrator from '../store/Hydrator';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_onFirstStep,
} from '../store/usePreSavePromptStore';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSavePrompt() {
    const [show] = usePreSavePromptStore((state) => [state.show]);
    const onFirstStep = usePreSavePromptStore_onFirstStep();

    return (
        <Dialog maxWidth={onFirstStep ? 'lg' : 'md'} fullWidth open={show}>
            <PromptsHydrator>
                <Title />
                <Content />
                <Actions />
            </PromptsHydrator>
        </Dialog>
    );
}

export default PreSavePrompt;
