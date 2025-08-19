import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetails({ datum }: AlertDetailsProps) {
    const { details } = useAlertTypeContent(datum);

    if (details.length > 0) {
        return (
            <KeyValueList
                data={details.map((detail: any, index: number) => {
                    return {
                        title: detail.label,
                        val: detail.dataVal,
                    };
                })}
            />
        );
    }

    return null;
}

export default AlertDetails;
