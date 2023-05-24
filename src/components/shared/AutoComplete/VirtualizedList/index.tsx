/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { autoCompleteListPadding } from 'context/Theme';
import React from 'react';
import { VariableSizeList } from 'react-window';
import { useResetCache } from './hooks';
import { OuterElement, OuterElementContext } from './OuterElement';
import Row from './Row';

const itemSize = 40;
const groupSize = 55;

const getChildSize = (child: React.ReactChild) => {
    if (child.hasOwnProperty('group')) {
        return groupSize;
    }

    return itemSize;
};

const getHeight = (itemData: React.ReactChild[], itemCount: number) => {
    let height;

    if (itemCount > 8) {
        height = 8 * itemSize;
    } else {
        height = itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    }

    return height + 2 * autoCompleteListPadding;
};

const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactChild[] = [];
    (children as React.ReactChild[]).forEach(
        (item: React.ReactChild & { children?: React.ReactChild[] }) => {
            itemData.push(item);
            itemData.push(...(item.children ?? []));
        }
    );

    const itemCount = itemData.length;
    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight(itemData, itemCount)}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElement}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={10}
                    itemCount={itemCount}
                >
                    {Row}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

export default ListboxComponent;
