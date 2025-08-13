import type { DetailsPaneProps } from 'src/components/tables/AlertHistory/types';

import { stringifyJSON } from 'src/services/stringify';

function DetailsPane({ foo }: DetailsPaneProps) {
    return (
        <textarea value={stringifyJSON(foo)} rows={20} cols={100} readOnly />
    );
}

export default DetailsPane;
