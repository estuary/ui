import { Box, IconButton, Tooltip } from '@mui/material';
import { EXPAND_ROW_TRANSITION } from 'components/tables/Logs/shared';
import { NavArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

interface Props {
    expanded: boolean;
    disable?: boolean;
}

function ExpandRowButton({ disable, expanded }: Props) {
    const intl = useIntl();
    return (
        <Tooltip
            title={intl.formatMessage({
                id: disable
                    ? 'ops.logsTable.expand.disabled'
                    : expanded
                    ? 'aria.closeExpand'
                    : 'aria.openExpand',
            })}
            placement="top"
            enterDelay={500}
        >
            <Box>
                <IconButton
                    aria-expanded={disable ? undefined : expanded}
                    disabled={disable}
                    sx={{
                        padding: 0.5,
                        marginRight: 0,
                        transform: `rotate(${expanded ? '90' : '0'}deg)`,
                        transition: `all ${EXPAND_ROW_TRANSITION}ms ease-in-out`,
                    }}
                >
                    <NavArrowRight />
                </IconButton>
            </Box>
        </Tooltip>
    );
}

export default ExpandRowButton;
