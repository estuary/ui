import type { Details } from 'src/stores/DetailsForm/types';

export const initialDetails: Details = {
    data: {
        connectorImage: {
            iconPath: '',
            imageName: '',
            imagePath: '',
            imageTag: '',
        },
        entityName: '',
    },
    errors: [],
};
