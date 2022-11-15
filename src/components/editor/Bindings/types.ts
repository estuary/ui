export type TabOptions = 'config' | 'schema';

interface MuiTabProps {
    label: string;
    value: TabOptions;
}
export const tabProps: MuiTabProps[] = [
    {
        label: 'workflows.collectionSelector.tab.resourceConfig',
        value: 'config',
    },
    {
        label: 'workflows.collectionSelector.tab.collectionSchema',
        value: 'schema',
    },
];
