import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { DateTime } from 'luxon';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const { explanation } = useAlertTypeContent(datum);

    return (
        <CardWrapper message={<AlertCardHeader datum={datum} />}>
            <KeyValueList
                data={[
                    {
                        title: `What's Happening?`,
                        val: explanation,
                    },
                    {
                        title: 'Started At',
                        val: DateTime.fromISO(datum.firedAt)
                            .toUTC()
                            .toLocaleString(DateTime.DATETIME_FULL),
                    },
                ]}
            />
            <AlertDetails datum={datum} />
        </CardWrapper>
    );
}

export default AlertCard;
