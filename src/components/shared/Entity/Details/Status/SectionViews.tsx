import { Divider, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import Overview from 'src/components/shared/Entity/Details/Status/Overview';
import StatusResponseViewer from 'src/components/shared/Entity/Details/Status/StatusResponseViewer';
import ControllerStatusHistoryTable from 'src/components/tables/ControllerStatusHistory';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

export default function SectionViews() {
    const intl = useIntl();

    const format = useEntityStatusStore((state) => state.format);

    if (format === 'dashboard') {
        return (
            <>
                <Overview />

                <Divider style={{ marginBottom: 8, marginTop: 24 }} />

                <Typography
                    style={{ fontSize: 18, fontWeight: 400, marginBottom: 16 }}
                >
                    {intl.formatMessage({
                        id: 'details.ops.status.table.header',
                    })}
                </Typography>

                <ControllerStatusHistoryTable />
            </>
        );
    } else {
        return <StatusResponseViewer />;
    }
}
