import { Collapse } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

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
