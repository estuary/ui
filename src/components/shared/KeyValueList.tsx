import { Box, ListItemText, Typography } from '@mui/material';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

export type KeyValue = {
    title: string;
    val?: string;
};

interface Props {
    data: KeyValue[];
    sectionTitle?: string;
}

const lineHeight = 45;

function KeyValueList({ data, sectionTitle }: Props) {
    const renderRow = (props: ListChildComponentProps) => {
        const { index, style } = props;
        const { title, val } = data[index];

        console.log('sup', props);

        return (
            <ListItemText
                style={style}
                key={`${title}-keyValueList-${index}`}
                primary={title}
                secondary={val}
            />
        );
    };

    if (data.length > 0) {
        return (
            <>
                {sectionTitle ? (
                    <Typography variant="subtitle1">{sectionTitle}</Typography>
                ) : null}

                <Box
                    sx={{
                        width: '100%',
                    }}
                >
                    <AutoSizer style={{ width: '100%', maxHeight: '400px' }}>
                        {({ width, height }) => {
                            return (
                                <FixedSizeList
                                    height={height}
                                    width={width}
                                    itemSize={lineHeight}
                                    itemCount={data.length}
                                    overscanCount={10}
                                >
                                    {renderRow}
                                </FixedSizeList>
                            );
                        }}
                    </AutoSizer>
                </Box>
            </>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
