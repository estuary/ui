import CaptureRoot from 'components/capture/Root';
import PageContainer from 'components/shared/PageContainer';
import { Outlet } from 'react-router-dom';

const Capture = () => {
    return (
        <PageContainer>
            <CaptureRoot />
            <Outlet />
        </PageContainer>
    );
};

export default Capture;
