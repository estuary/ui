import { Collapse } from '@mui/material';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';

interface RefreshStatusProps {
    show?: boolean;
}

function RefreshStatus({ show }: RefreshStatusProps) {
    const draftId = useEditorStore_id();

    return (
        <Collapse in={Boolean(!draftId || show)} unmountOnExit>
            <AlertBox short severity="info">
                Refreshing the fields is recommended as editing the config or
                collection can sometimes change the options below.
            </AlertBox>
        </Collapse>
    );
}

export default RefreshStatus;
