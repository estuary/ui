import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import KeyValueListRow from './Row';

export type KeyValue = {
    title: string;
    val?: string;
};

interface Props {
    data: KeyValue[];
}

const lineHeight = 45;

// TODO (virtualization) Need to make this work better
//  The ENTIRE list (including headers) should be virtualized
//  otherwise we get several virtualized lists and the UX is awful
function VirtualizedKeyValueList({ data }: Props) {
    const renderRow = (props: ListChildComponentProps) => {
        const { index, style } = props;
        return (
            <KeyValueListRow data={data[index]} index={index} style={style} />
        );
    };

    if (data.length > 0) {
        return (
            <AutoSizer style={{ width: '100%', maxHeight: '400px' }}>
                {({ width, height }: AutoSizer['state']) => {
                    // TODO (typing) pretty sure this is the right type but need
                    //  to figure that out before launching this
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
        );
    } else {
        return null;
    }
}

export default VirtualizedKeyValueList;
