import type { ActiveOrResolvedCellsProps } from 'src/components/tables/cells/activeResolved/types';

import ActiveCell from 'src/components/tables/cells/activeResolved/ActiveCell';
import DurationCell from 'src/components/tables/cells/activeResolved/DurationCell';
import ResolvedCell from 'src/components/tables/cells/activeResolved/ResolvedCell';

function ActiveOrResolvedCells(props: ActiveOrResolvedCellsProps) {
    return (
        <>
            <ActiveCell {...props} />
            <ResolvedCell {...props} />
            <DurationCell {...props} />
        </>
    );
}

export default ActiveOrResolvedCells;
