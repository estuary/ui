import { FormattedMessage } from 'react-intl';

import { Button, TableCell, Typography } from '@mui/material';

interface Props {
    editTask: () => void;
}

// TODO (details page)
function EntityEdit({ editTask }: Props) {
    return (
        <TableCell
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <Button variant="text" onClick={editTask}>
                <Typography>
                    <FormattedMessage id="cta.edit" />
                </Typography>
            </Button>
        </TableCell>
    );
}

export default EntityEdit;
