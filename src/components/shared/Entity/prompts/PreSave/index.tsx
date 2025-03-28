import { Dialog } from '@mui/material';

import PromptsHydrator from '../store/Hydrator';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

import { useFormStateStore_showSavePrompt } from 'src/stores/FormState/hooks';

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
