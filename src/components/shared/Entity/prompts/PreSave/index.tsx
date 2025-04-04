import { Dialog } from '@mui/material';

import Actions from 'src/components/shared/Entity/prompts/PreSave/Actions';
import Content from 'src/components/shared/Entity/prompts/PreSave/Content';
import Title from 'src/components/shared/Entity/prompts/PreSave/Title';
import PromptsHydrator from 'src/components/shared/Entity/prompts/store/Hydrator';
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
