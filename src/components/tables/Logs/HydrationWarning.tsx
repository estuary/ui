import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import OffsetNotYetAvailable from 'src/components/tables/Logs/HydrationWarnings/OffsetNotYetAvailable';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

function HydrationWarning() {
    const intl = useIntl();

    const [hydrationWarning] = useJournalDataLogsStore((state) => [
        state.hydrationWarning,
    ]);

    if (hydrationWarning === 'OFFSET_NOT_YET_AVAILABLE') {
        return (
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: `ops.hydrationWarning.${hydrationWarning}.title`,
                })}
            >
                <OffsetNotYetAvailable />
            </AlertBox>
        );
    }

    return null;
}

export default HydrationWarning;
