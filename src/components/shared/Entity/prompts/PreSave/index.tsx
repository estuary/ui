import { Dialog } from '@mui/material';
import { useLocalStorage } from 'react-use';
import { useFormStateStore_showSavePrompt } from 'stores/FormState/hooks';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import PromptsHydrator from '../store/Hydrator';
import Actions from './Actions';
import Content from './Content';
import Title from './Title';

function PreSavePrompt() {
    const showSavePrompt = useFormStateStore_showSavePrompt();

    const [dataFlowResetEnabled] = useLocalStorage(
        LocalStorageKeys.ENABLE_DATA_FLOW_RESET
    );

    if (!dataFlowResetEnabled) {
        return null;
    }

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
