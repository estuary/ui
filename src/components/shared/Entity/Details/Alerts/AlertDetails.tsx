import type { AlertDetailsWrapperProps } from 'src/components/shared/Entity/Details/Alerts/types';

import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetailsWrapper({ datum }: AlertDetailsWrapperProps) {
    const getAlertTypeContent = useAlertTypeContent();
    const { details, DetailSection } = getAlertTypeContent(datum);

    if (DetailSection) {
        return <DetailSection datum={datum} details={details} />;
    }

    return <>-</>;
}

export default AlertDetailsWrapper;
