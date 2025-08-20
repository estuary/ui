import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetails({ datum }: AlertDetailsProps) {
    const { details } = useAlertTypeContent(datum);

    if (details.length > 0) {
        return (
            <KeyValueList
                data={details.map((detail: any, index: number) => {
                    const val = detail.dataVal;

                    // TODO (alert history) - handle formatting data

                    return {
                        title: detail.label,
                        val,
                    };
                })}
            />
        );
    }

    return <>-</>;
}

export default AlertDetails;
