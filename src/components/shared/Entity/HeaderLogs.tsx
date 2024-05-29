import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHelpers from './hooks/useEntityWorkflowHelpers';
import LogDialog from './LogDialog';
import LogDialogActions from './LogDialogActions';

// TODO (break logs from buttons) - this is starting to display the dialog as a stand alone
//  component broken out of the Test/Save buttons. One last thing that is requied is called
//  out below where we needed to pass in an array of taskName
function HeaderLogs() {
    const { closeLogs } = useEntityWorkflowHelpers();

    const messagePrefix = useFormStateStore_messagePrefix();
    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();
    const formStatus = useFormStateStore_status();

    return (
        <LogDialog
            open={
                formStatus === FormStatus.SAVED ||
                formStatus === FormStatus.SAVING
                    ? showLogs
                    : false
            }
            token={logToken}
            title={
                <FormattedMessage id={`${messagePrefix}.save.waitMessage`} />
            }
            actionComponent={
                // TODO - need to pass real task names here!
                <LogDialogActions close={closeLogs} taskNames={[]} />
            }
        />
    );
}

export default HeaderLogs;
