import { Dialog } from '@mui/material';
import { useFormStateStore_showSavePrompt } from 'stores/FormState/hooks';
import PromptsHydrator from '../store/Hydrator';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSavePrompt() {
    const showSavePrompt = useFormStateStore_showSavePrompt();

    return (
        <Dialog maxWidth="lg" fullWidth open={showSavePrompt}>
            <PromptsHydrator>
                <Title />
                <Content />
                <Actions />
            </PromptsHydrator>
        </Dialog>
    );
}

export default PreSavePrompt;
