import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function NoOptionsAvailable() {
    return (
        <AlertBox short severity="warning">
            <FormattedMessage id="keyAutoComplete.noOptions.message" />
        </AlertBox>
    );
}

export default NoOptionsAvailable;
