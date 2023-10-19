import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';

// This is the main "controller" for handling the response from providers that entity
//  creation with OAuth
const OAuth = () => {
    useBrowserTitle('routeTitle.loginLoading');

    return <FullPageSpinner delay={0} />;
};

export default OAuth;
