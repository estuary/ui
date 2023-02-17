import { Button, TableCell, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    editTask: () => void;
}

// This was once a menu and might become one again. After we converted the details panel
//  to a page this became a single link. In case this is needed again and so we have the history
//  I am leaving this with the name OptionsMenu even though it is just an edit CTA now.
function OptionsMenu({ editTask }: Props) {
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

export default OptionsMenu;
