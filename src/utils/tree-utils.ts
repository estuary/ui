export interface TreeNode {
    //If null it means the item is NOT selectable
    children: TreeNode[];
    fullPath: string | null;
    id: string;
    name: string;
}

const createNode = (path: string[], tree: TreeNode[], catalogName: string) => {
    const name = path.shift();
    const idx = tree.findIndex((e: TreeNode) => {
        return e.name == name;
    });

    if (idx < 0) {
        tree.push({
            name: name ?? 'ERROR',
            fullPath: catalogName,
            id: `PATH__${name}__${idx}`,
            children: [],
        });
        if (path.length !== 0) {
            createNode(path, tree[tree.length - 1].children, catalogName);
        }
    } else {
        createNode(path, tree[idx].children, catalogName);
    }
};

export const pathToTree = (data: string[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    for (let i = 0; i < data.length; i++) {
        const path: string = data[i];
        const split: string[] = path.split('/');
        createNode(split, tree, path);
    }
    return tree;
};
