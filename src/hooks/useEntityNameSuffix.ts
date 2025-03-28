import { useMemo } from 'react';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { hasLength, stripPathing } from 'utils/misc-utils';

// Used to add the image name to the end of an entity name
//  We pass in the boolean as different entities need to control
//  when this happens at different times.
function useEntityNameSuffix(when: boolean | undefined) {
    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const imageName = useDetailsFormStore(
        (state) => state.details.data.connectorImage.imageName
    );
    const draftedEntityName = useDetailsFormStore(
        (state) => state.draftedEntityName
    );
    const strippedImageName = stripPathing(imageName);
    const nameEndsInImage = entityName.endsWith(strippedImageName);

    return useMemo(
        () =>
            when
                ? !nameEndsInImage
                    ? `${entityName}/${strippedImageName}`
                    : entityName
                : hasLength(draftedEntityName)
                  ? draftedEntityName
                  : entityName,
        [
            draftedEntityName,
            entityName,
            nameEndsInImage,
            strippedImageName,
            when,
        ]
    );
}

export default useEntityNameSuffix;
