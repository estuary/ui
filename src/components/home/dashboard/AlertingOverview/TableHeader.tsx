import { TableCell, TableHead, TableRow } from '@mui/material';

import { getTableComponents } from 'src/utils/table-utils';

export default function TableHeader() {
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
                    Name
                </TableCell>
                <TableCell component={tdComponent}>Recent Alerts</TableCell>
            </TableRow>
        </TableHead>
    );
}
