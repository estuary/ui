import { MoreVert } from '@mui/icons-material';
import { MenuItem, TableCell, Typography } from '@mui/material';
import IconMenu from 'components/menus/IconMenu';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    detailsExpanded: boolean;
    toggleDetailsPanel: () => void;
    editTask: () => void;
}

function OptionsMenu({ detailsExpanded, toggleDetailsPanel, editTask }: Props) {
    const intl = useIntl();

    const stopEventPropogation = (
        event: React.MouseEvent<any, any>,
        callback: Function
    ) => {
        event.stopPropagation();
        callback(event);
    };

    return (
        <TableCell>
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
                <MenuItem
                    onClick={(event) =>
                        stopEventPropogation(event, toggleDetailsPanel)
                    }
                >
                    <Typography>
                        <FormattedMessage
                            id={
                                detailsExpanded
                                    ? 'optionMenu.option.detailsPanel.hide'
                                    : 'optionMenu.option.detailsPanel.display'
                            }
                        />
                    </Typography>
                </MenuItem>

                <MenuItem
                    onClick={(event) => stopEventPropogation(event, editTask)}
                >
                    <Typography>
                        <FormattedMessage id="optionMenu.option.edit" />
                    </Typography>
                </MenuItem>
            </IconMenu>
        </TableCell>
    );
}

export default OptionsMenu;
