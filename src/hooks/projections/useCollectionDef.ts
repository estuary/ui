import { useWorkflowStore } from 'src/stores/Workflow/Store';

// TODO (schema edit) ... kinda
// This is kind of a weird one and might not stay around.
//  There is a chance we'll need to do some common processing here.
//  Like figuring out if this is a liveSpec of a draftSpec. However, this
//  won't be apparent until we wire up Schema Editing
function useCollectionDef(entityName: string | undefined) {
    const collectionDef = useWorkflowStore((state) =>
        entityName ? state.collections[entityName] : undefined
    );

    return {
        collectionDef,
    };
}

export default useCollectionDef;
