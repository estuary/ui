import { autoCompleteListPadding } from 'context/Theme';
import { forwardRef, HTMLAttributes, ReactChild } from 'react';
import { VariableSizeList } from 'react-window';
import { useResetCache } from './hooks';
import { OuterElement, OuterElementContext } from './OuterElement';
import Row from './Row';

export const itemSize = 40;
const groupSize = 55;

const getChildSize = (child: ReactChild) => {
    if (child.hasOwnProperty('group')) {
        return groupSize;
    }

    // Might be the raw string or node that'll be rendered
    const itemToRender = child[1];
    const itemHeight =
        itemToRender?.props?.['x-react-window-item-height'] ?? itemSize;

    return itemHeight;
};

const getHeight = (itemData: ReactChild[], itemCount: number) => {
    let height: number;

    if (itemCount > 8) {
        height = 8 * itemSize;
    } else {
        height = itemData
            .map(getChildSize)
            .reduce((a: number, b: number) => a + b, 0);
    }

    return height + 2 * autoCompleteListPadding;
};

const ListboxComponent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: ReactChild[] = [];
    (children as ReactChild[]).forEach(
        (item: ReactChild & { children?: ReactChild[] }) => {
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
