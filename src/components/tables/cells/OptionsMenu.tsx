import { MenuItem, TableCell, Typography } from '@mui/material';
import IconMenu from 'components/menus/IconMenu';
import { MoreVert } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    editTask: () => void;
}

function OptionsMenu({ editTask }: Props) {
    const intl = useIntl();

    return (
        <TableCell
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <IconMenu
                ariaLabel={intl.formatMessage({ id: 'optionMenu.ariaLabel' })}
                icon={<MoreVert />}
                identifier="table-options-menu"
                tooltip={intl.formatMessage({ id: 'optionMenu.tooltip' })}
                hideArrow
                customMenuPosition={{
                    transformOrigin: {
                        horizontal: 'right',
                        vertical: 'center',
                    },
                    anchorOrigin: { horizontal: 'left', vertical: 'top' },
                }}
            >
                <MenuItem onClick={editTask}>
                    <Typography>
                        <FormattedMessage id="optionMenu.option.edit" />
                    </Typography>
                </MenuItem>
            </IconMenu>
        </TableCell>
    );
}

export default OptionsMenu;
