import fakeRows, { FakeDataDef } from './FakeTableData';
import SortableTable from './SortableTable';

interface HeadCell {
    disablePadding: boolean;
    id: keyof FakeDataDef;
    label: string;
    numeric: boolean;
}

const headCells: HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Collections',
    },
    {
        id: 'lastChange',
        numeric: true,
        disablePadding: false,
        label: 'Last Updated',
    },
    {
        id: 'size',
        numeric: true,
        disablePadding: false,
        label: 'Data Volume',
    },
    {
        id: 'owner',
        numeric: false,
        disablePadding: false,
        label: 'User',
    },
    {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'Description',
    },
    {
        id: 'org',
        numeric: false,
        disablePadding: false,
        label: 'Organization',
    },
];

function ExploreTable() {
    return <SortableTable rows={fakeRows} headers={headCells} />;
}

export default ExploreTable;
