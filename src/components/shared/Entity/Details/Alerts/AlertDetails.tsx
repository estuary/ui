import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetails({ datum }: AlertDetailsProps) {
    const getAlertTypeContent = useAlertTypeContent();
    const { details, DetailSection } = getAlertTypeContent(datum);

    if (DetailSection) {
        return <DetailSection datum={datum} details={details} />;
    }

    return <>-</>;
}

export default AlertDetails;
