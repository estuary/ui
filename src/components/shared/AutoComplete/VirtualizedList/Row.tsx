import { Box, ListSubheader, Typography } from '@mui/material';
import { truncateTextSx } from 'context/Theme';
import { Check } from 'iconoir-react';
import { ListChildComponentProps } from 'react-window';

const LISTBOX_PADDING = 8;

function Row(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const isGroup = dataSet.hasOwnProperty('group');
    const customHeight = dataSet.hasOwnProperty('customHeight');

    const inlineStyle = {
        ...style,
        height: customHeight ? dataSet[0].customHeight : undefined,
        paddingLeft: isGroup ? 24 : undefined,
        top: (style.top as number) + LISTBOX_PADDING,
    };

    if (isGroup) {
        return (
            <ListSubheader
                key={dataSet.key}
                component="div"
                sx={{
                    ...truncateTextSx,
                }}
                style={inlineStyle}
            >
                {dataSet.group}
            </ListSubheader>
        );
    }

    const selected = dataSet[2];
    return (
        <li {...dataSet[0]} style={inlineStyle} key={dataSet.key}>
            <Box
                sx={{
                    alignSelf: 'flex-start',
                    ml: -2,
                    mr: 0.5,
                }}
            >
                <Check
                    aria-checked={selected}
                    style={{
                        visibility: selected ? 'visible' : 'hidden',
                    }}
                />
            </Box>
            <Typography
                component="span"
                sx={{
                    ...truncateTextSx,
                }}
            >
                {dataSet[1]}
            </Typography>
        </li>
    );
}

export default Row;
