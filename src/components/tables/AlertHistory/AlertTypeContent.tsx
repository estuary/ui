import { useIntl } from 'react-intl';

function AlertTypeContent({ alertType }: any) {
    const intl = useIntl();

    if (alertType) {
        return (
            <>
                {intl.formatMessage({
                    id: `admin.notifications.alertType.${alertType}`,
                })}
            </>
        );
    }

    return <>''</>;
}

export default AlertTypeContent;
