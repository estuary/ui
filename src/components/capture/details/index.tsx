import LiveSpecEditor from 'components/editor/LiveSpec';
import { ZustandProvider } from 'components/editor/Store';
import PageContainer from 'components/shared/PageContainer';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

function CaptureDetails() {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.captureDetails',
        })
    );

    return (
        <PageContainer>
            <ZustandProvider stateKey="liveSpecEditor">
                <LiveSpecEditor />
            </ZustandProvider>
        </PageContainer>
    );
}

export default CaptureDetails;
