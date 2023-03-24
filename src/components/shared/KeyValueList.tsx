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
                    <AutoSizer disableHeight style={{ width: '100%' }}>
                        {(props) => {
                            console.log('sup', props);

                            return (
                                <FixedSizeList
                                    height={300}
                                    width={props.width}
                                    itemSize={45}
                                    itemCount={data.length}
                                    overscanCount={10}
                                >
                                    {renderRow}
                                </FixedSizeList>
                            );
                        }}
                    </AutoSizer>
                </Box>

                {/*                <List dense sx={{ ml: 2, pt: 0 }}>
                    {data.map(({ title, val }, index) => (
                        <ListItemText
                            key={`${title}-keyValueList-${index}`}
                            primary={title}
                            secondary={val}
                        />
                    ))}
                </List>*/}
            </>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
