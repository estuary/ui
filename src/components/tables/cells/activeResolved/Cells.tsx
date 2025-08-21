import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import ActiveCell from 'src/components/tables/cells/activeResolved/ActiveCell';
import ResolvedCell from 'src/components/tables/cells/activeResolved/ResolvedCell';

function ActiveOrResolvedCells(props: ActiveOrResolvedCellsProps) {
    const { hideResolvedAt } = props;

    if (hideResolvedAt) {
        return <ActiveCell {...props} />;
    }

    return (
        <>
            <ActiveCell {...props} />
            <ResolvedCell {...props} />
        </>
    );
}

export default ActiveOrResolvedCells;
