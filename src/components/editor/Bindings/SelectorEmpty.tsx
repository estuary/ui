import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function SelectorEmpty() {
    return (
        <AlertBox
            severity="info"
            short
            title={
                <FormattedMessage id="entityCreate.bindingsConfig.noRowsTitle" />
            }
        >
            <FormattedMessage id="entityCreate.bindingsConfig.noRows" />
        </AlertBox>
    );
}

export default SelectorEmpty;
