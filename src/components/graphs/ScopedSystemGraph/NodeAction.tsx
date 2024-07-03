import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { primaryColoredOutline } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    onClick: IconButtonProps['onClick'];
    tooltipId: string;
}

function NodeAction({ children, onClick, tooltipId }: Props) {
    return (
        <Tooltip arrow title={<FormattedMessage id={tooltipId} />}>
            <IconButton
                color="primary"
                onClick={onClick}
                sx={{
                    'backgroundColor': 'white',
                    'border': (theme) =>
                        primaryColoredOutline[theme.palette.mode],
                    'borderRadius': 1,
                    'height': '15px',
                    'pb': '2px',
                    'pl': '2px',
                    'pr': '1.4px',
                    'pt': '1.4px',
                    'width': '15px',
                    '&:hover': {
                        backgroundColor: 'white',
                        borderColor: (theme) => theme.palette.primary.main,
                    },
                }}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}

export default NodeAction;
