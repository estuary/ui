import { createStateContext } from 'react-use';
import { ENTITY } from 'types';

export const [useEntityType, EntityTypeProvider] = createStateContext<
    ENTITY.CAPTURE | ENTITY.MATERIALIZATION
>(ENTITY.CAPTURE);
