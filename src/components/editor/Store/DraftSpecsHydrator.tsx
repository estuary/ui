import { useHydrateEditorState } from 'components/editor/Store/hooks';
import { BaseComponentProps, Entity } from 'types';

interface Props extends BaseComponentProps {
    draftId: string | null | undefined;
    entityType: Entity;
    entityName?: string;
    localScope?: boolean;
}

function DraftSpecEditorHydrator({
    children,
    draftId,
    entityType,
    entityName,
    localScope,
}: Props) {
    useHydrateEditorState(entityType, draftId, entityName, localScope);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default DraftSpecEditorHydrator;
