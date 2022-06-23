import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { SyntheticEvent, useMemo, useState } from 'react';

interface Props {
    items: any;
    onChange: Function;
}

export default function TreeViewSelector({ items }: Props) {
    const [expanded, setExpanded] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

    const handleToggle = (event: SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
    };

    const handleSelect = (event: SyntheticEvent, nodeIds: string[]) => {
        setSelected(nodeIds);
    };

    const handleExpandClick = () => {
        setExpanded((oldExpanded) =>
            oldExpanded.length === 0 ? ['1', '5', '6', '7'] : []
        );
    };

    const handleSelectClick = () => {
        setSelected((oldSelected) =>
            oldSelected.length === 0
                ? ['1', '2', '3', '4', '5', '6', '7', '8', '9']
                : []
        );
    };

    const Trees = useMemo(() => {
        const renderTree = (nodes: any) => {
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
                <Button onClick={handleSelectClick}>
                    {selected.length === 0 ? 'Select all' : 'Unselect all'}
                </Button>
            </Box>
            <TreeView
                aria-label="controlled"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
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
