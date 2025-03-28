import { Collapse } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';

interface Props {
    show?: boolean;
}

function RefreshStatus({ show }: Props) {
    const draftId = useEditorStore_id();

    return (
        <Collapse in={Boolean(!draftId || show)} unmountOnExit>
            <AlertBox short severity="info">
                <FormattedMessage id="fieldSelection.refresh.alert" />
            </AlertBox>
        </Collapse>
    );
}

export default RefreshStatus;
