import LoginNotifications from 'components/login/Notifications';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';

export default function LoginError() {
    const homePageError = useGlobalSearchParams(
        GlobalSearchParams.HOME_PAGE_ERROR
    );

    // home page error related
    const notificationMessage = useMemo(() => {
        if (homePageError) {
            return 'directives.grant.skipped.message';
        }
        return null;
    }, [homePageError]);

    return notificationMessage ? (
        <LoginNotifications
            notificationMessage={notificationMessage}
            notificationTitle="directives.grant.skipped.title"
        />
    ) : null;
}
