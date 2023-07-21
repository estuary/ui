import { SyntheticEvent, useMemo, useState } from 'react';

import { NavArrowDown, NavArrowRight } from 'iconoir-react';

import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface Props {
    items: any;
    onChange: Function;
    selected: string[];
}

// TODO (tree picker) This is not fully working yet. Going to take a break on it
//    to focus on other stuff. Right now it seems kinda slow. Not sure if that is
//      due to something MUI did. It is in their "lab" so not really made for prod.
//  What's needed:
//      maintain selected list, display items different if they're select, support selecting
//      entire "folder", enable removal of item, add ctas (probably should have an add/remove button)

// This chunk was how we were calculating the "tree" in src/components/collection/Picker.tsx
// const [catalogNameList, collectionTree] = useMemo(() => {
//     const nameList = collectionData.map(
//         (collectionDatum) => collectionDatum.catalog_name
//     );
//     const tree = pathToTree(nameList);
//     return [nameList, tree];
// }, [collectionData]);

export default function TreeViewPicker({ items, onChange, selected }: Props) {
    const theme = useTheme();

    const [expanded, setExpanded] = useState<string[]>([]);

    const handleToggle = (event: SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
    };

    const handleSelect = (event: SyntheticEvent, nodeIds: string[]) => {
        console.log('select', nodeIds);
        const filteredNodeIds = nodeIds.filter(
            (nodeId) => !nodeId.startsWith('PATH')
        );
        onChange(filteredNodeIds);
    };

    const handleExpandClick = () => {
        setExpanded((oldExpanded) =>
            oldExpanded.length === 0 ? ['1', '5', '6', '7'] : []
        );
    };

    const Trees = useMemo(() => {
        const renderTree = (nodes: any) => {
            console.log('render', nodes.children);

            return (
                <TreeItem
                    key={nodes.id}
                    nodeId={
                        nodes.children.length === 0 ? nodes.fullPath : nodes.id
                    }
                    label={nodes.name}
                >
                    {nodes.children.length > 0
                        ? nodes.children.map((node: any) => renderTree(node))
                        : null}
                </TreeItem>
            );
        };

        return items.map((nodes: any) => {
            console.log('render', nodes.children);

            return (
                <TreeItem
                    key={nodes.name}
                    nodeId={nodes.name}
                    label={nodes.name}
                >
                    {nodes.children.length > 0
                        ? nodes.children.map((node: any) => renderTree(node))
                        : null}
                </TreeItem>
            );
        });
    }, [items]);

    return (
        <Box
            sx={{ height: 270, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            <Box sx={{ mb: 1 }}>
                <Button onClick={handleExpandClick}>
                    {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
                </Button>
            </Box>
            <TreeView
                aria-label="controlled"
                defaultCollapseIcon={
                    <NavArrowDown
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    />
                }
                defaultExpandIcon={
                    <NavArrowRight
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    />
                }
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
                multiSelect
            >
                {Trees}
            </TreeView>
        </Box>
    );
}
