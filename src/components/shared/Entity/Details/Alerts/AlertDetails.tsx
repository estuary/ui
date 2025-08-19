import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetails({ datum }: AlertDetailsProps) {
    const { details } = useAlertTypeContent(datum);

    if (details.length > 0) {
        return (
            <ul>
                {details.map((detail: any, index: number) => {
                    console.log('detail', detail);

                    return (
                        <li key={`alert_details_${index}`}>
                            {detail.label} | {detail.dataVal}
                        </li>
                    );
                })}
            </ul>
        );
    }

    return null;
}

export default AlertDetails;
