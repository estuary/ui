import { IconButton, Tooltip } from '@mui/material';
import { NavArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

interface Props {
    expanded: boolean;
}

function ExpandRowButton({ expanded }: Props) {
    const intl = useIntl();
    return (
        <Tooltip
            title={intl.formatMessage({
                id: expanded ? 'aria.closeExpand' : 'aria.openExpand',
            })}
            placement="top"
            enterDelay={500}
        >
            <IconButton
                aria-expanded={expanded}
                sx={{
                    padding: 0.5,
                    marginRight: 0,
                    transform: `rotate(${expanded ? '90' : '0'}deg)`,
                    transition: 'all 250ms ease-in-out',
                }}
            >
                <NavArrowRight />
            </IconButton>
        </Tooltip>
    );
}

export default ExpandRowButton;
