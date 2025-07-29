import type { CompositeProjection } from 'src/components/editor/Bindings/FieldSelection/types';
import type { SortDirection, TableColumns } from 'src/types';

import { compareInitialCharacterType } from 'src/utils/misc-utils';

export const optionalColumnIntlKeys = {
    pointer: 'data.location',
    details: 'data.details',
};

export const optionalColumns = Object.values(optionalColumnIntlKeys);

export const tableColumns: TableColumns[] = [
    {
        field: 'field',
        headerIntlKey: 'data.field',
        columnWraps: true,
    },
    {
        field: 'ptr',
        headerIntlKey: optionalColumnIntlKeys.pointer,
        columnWraps: true,
    },
    {
        field: null,
        headerIntlKey: 'data.type',
        collapseHeader: true,
    },
    {
        field: 'constraint.type',
        headerIntlKey: optionalColumnIntlKeys.details,
    },
    {
        field: null,
        headerIntlKey: 'data.actions',
        width: 148,
    },
];

const compareConstraintTypes = (
    a: CompositeProjection,
    b: CompositeProjection,
    ascendingSort: boolean
): number => {
    // If a and b have constraint types but they are not equal, compare their severity.
    // The projection with the greater severity should appear first.
    if (
        a.constraint &&
        b.constraint &&
        a.constraint.type !== b.constraint.type
    ) {
        return ascendingSort
            ? a.constraint.type - b.constraint.type
            : b.constraint.type - a.constraint.type;
    }

    // If a and b do not have defined constraint types or their constraint types are equal,
    // perform an ascending, alphabetic sort on their fields.
    return ascendingSort
        ? a.field.localeCompare(b.field)
        : b.field.localeCompare(a.field);
};

export const constraintTypeSort = (
    a: CompositeProjection,
    b: CompositeProjection,
    sortDirection: SortDirection
) => {
    const sortResult = compareInitialCharacterType(a.field, b.field);

    if (typeof sortResult === 'number') {
        return sortResult;
    }

    // If a does not have a constraint type and b does then return >0 to put b first
    if (!a.constraint && b.constraint) {
        return 1;
    }

    // If a has a constraint type and b does not then return <0 to put a first
    if (a.constraint && !b.constraint) {
        return -1;
    }

    const ascendingSort = sortDirection === 'asc';

    return compareConstraintTypes(a, b, ascendingSort);
};
