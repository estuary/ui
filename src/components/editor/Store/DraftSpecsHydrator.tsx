import { useHydrateEditorState } from 'components/editor/Store/hooks';
import { BaseComponentProps, Entity } from 'types';

interface Props extends BaseComponentProps {
    entityType: Entity;
    entityName?: string;
    localScope?: boolean;
}

function DraftSpecEditorHydrator({
    children,
    entityType,
    entityName,
    localScope,
}: Props) {
    useHydrateEditorState(entityType, entityName, localScope);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default DraftSpecEditorHydrator;
