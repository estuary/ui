import type { Details } from 'src/stores/DetailsForm/types';

export const initialDetails: Details = {
    data: {
        connectorImage: {
            connectorId: '',
            id: '',
            iconPath: '',
            imageName: '',
            imagePath: '',
            imageTag: '',
        },
        entityName: '',
    },
    errors: [],
};
