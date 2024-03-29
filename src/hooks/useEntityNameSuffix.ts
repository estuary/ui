import { useMemo } from 'react';
import {
    useDetailsForm_connectorImage_imageName,
    useDetailsForm_details_entityName,
    useDetailsForm_draftedEntityName,
} from 'stores/DetailsForm/hooks';
import { hasLength, stripPathing } from 'utils/misc-utils';

// Used to add the image name to the end of an entity name
//  We pass in the boolean as different entities need to control
//  when this happens at different times.
function useEntityNameSuffix(when: boolean | undefined) {
    const entityName = useDetailsForm_details_entityName();
    const imageName = useDetailsForm_connectorImage_imageName();
    const draftedEntityName = useDetailsForm_draftedEntityName();
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
