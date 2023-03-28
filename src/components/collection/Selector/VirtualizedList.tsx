/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, ListSubheader, Typography } from '@mui/material';
import { truncateTextSx } from 'context/Theme';
import { Check } from 'iconoir-react';
import React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

const LISTBOX_PADDING = 8;

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const isGroup = dataSet.hasOwnProperty('group');

    const inlineStyle = {
        ...style,
        paddingLeft: isGroup ? 24 : undefined,
        top: (style.top as number) + LISTBOX_PADDING,
    };

    if (isGroup) {
        return (
            <ListSubheader
                key={dataSet.key}
                component="div"
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
                sx={{
                    ...truncateTextSx,
                }}
            >
                {dataSet[1]}
            </Typography>
        </li>
    );
}

const OuterElementContext = React.createContext({});
// eslint-disable-next-line react/display-name
const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

const itemSize = 40;
const groupSize = 55;

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

    const getChildSize = (child: React.ReactChild) => {
        if (child.hasOwnProperty('group')) {
            return groupSize;
        }

        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={10}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

export default ListboxComponent;
