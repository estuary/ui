import { TableCell, TableHead, TableRow } from '@mui/material';

import { useIntl } from 'react-intl';

import { getTableComponents } from 'src/utils/table-utils';

export default function TableHeader() {
    const intl = useIntl();

    const { tdComponent, trComponent, theaderComponent } =
        getTableComponents(true);

    return (
        <TableHead component={theaderComponent}>
            <TableRow component={trComponent}>
                <TableCell
                    component={tdComponent}
                    sx={{
                        minWidth: 250,
                        maxWidth: 'min-content',
                    }}
                >
                    {intl.formatMessage({
                        id: 'entityName.label',
                    })}
                </TableCell>
                <TableCell component={tdComponent}>
                    {intl.formatMessage({
                        id: 'alerts.overview.recentAlerts',
                    })}
                </TableCell>
            </TableRow>
        </TableHead>
    );
}
