import useShardHydration from 'hooks/shards/useShardHydration';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    catalogName: string;
}

function ShardHydrator({ catalogName, children }: Props) {
    useShardHydration([catalogName]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ShardHydrator;
