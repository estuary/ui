import { Chip as MuiChip, styled, Tooltip } from '@mui/material';
import { outlineSx } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { stripPathing } from 'utils/misc-utils';

interface Props {
    onClick?: () => void;
    disabled?: boolean;
    stripPath?: boolean;
    title?: string;
    val: string;
}

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
const chipListHoverStyling = {
    cursor: 'pointer',
};

function ChipWrapper({ disabled, onClick, stripPath, title, val }: Props) {
    return (
        <ListItem>
            <Tooltip title={title ?? val}>
                <MuiChip
                    label={
                        stripPath ? (
                            <FormattedMessage
                                id="commin.pathShort.prefix"
                                values={{
                                    path: stripPathing(val),
                                }}
                            />
                        ) : (
                            val
                        )
                    }
                    size="small"
                    variant="outlined"
                    disabled={disabled}
                    onClick={onClick}
                    sx={{
                        ...outlineSx,
                        // TODO (typing) Figure out how to use truncateTextSx here
                        'whiteSpace': 'nowrap',
                        'overflow': 'hidden',
                        'textOverflow': 'ellipsis',
                        'maxWidth': 200,
                        '&:hover': {
                            ...chipListHoverStyling,
                            background: (hoverTheme) =>
                                hoverTheme.palette.background.default,
                        },
                    }}
                />
            </Tooltip>
        </ListItem>
    );
}

export default ChipWrapper;
