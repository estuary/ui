import { Collapse } from '@mui/material';

import { useIntl } from 'react-intl';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';

interface RefreshStatusProps {
    show?: boolean;
}

function RefreshStatus({ show }: RefreshStatusProps) {
    const intl = useIntl();
    const draftId = useEditorStore_id();

    return (
        <Collapse in={Boolean(!draftId || show)} unmountOnExit>
            <AlertBox short severity="info">
                {intl.formatMessage({ id: 'fieldSelection.refresh.alert' })}
            </AlertBox>
        </Collapse>
    );
}

export default RefreshStatus;
