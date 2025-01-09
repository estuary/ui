import { Divider, Typography } from '@mui/material';
import ControllerStatusHistoryTable from 'components/tables/ControllerStatusHistory';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import Overview from './Overview';
import StatusResponseViewer from './StatusResponseViewer';

export default function SectionViews() {
    const intl = useIntl();

    const format = useEntityStatusStore((state) => state.format);

    if (format === 'dashboard') {
        return (
            <>
                <Overview />

                <Divider style={{ marginBottom: 16, marginTop: 24 }} />

                <Typography
                    style={{ fontSize: 18, fontWeight: 400, marginBottom: 8 }}
                >
                    {intl.formatMessage({
                        id: 'details.ops.status.table.header',
                    })}
                </Typography>

                <ControllerStatusHistoryTable serverErrorExists={false} />
            </>
        );
    } else {
        return <StatusResponseViewer />;
    }
}
