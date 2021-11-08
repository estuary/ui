export const CaptureUISchema = {
    type: 'Categorization',
    elements: [
        {
            type: 'Category',
            label: 'Basic Information',
            elements: [
                {
                    type: 'HorizontalLayout',
                    elements: [
                        {
                            type: 'Control',
                            label: 'Name',
                            scope: '#/properties/name',
                        },
                        {
                            type: 'Control',
                            label: 'Source Type',
                            scope: '#/properties/type',
                        },
                    ],
                },
            ],
        },
        {
            type: 'Category',
            label: 'Connection Details',
            elements: [
                {
                    type: 'VerticalLayout',
                    elements: [
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    label: 'Host',
                                    scope: '#/properties/db/properties/host',
                                },
                                {
                                    type: 'Control',
                                    label: 'DB Name',
                                    scope: '#/properties/db/properties/name',
                                },
                                {
                                    type: 'Control',
                                    label: 'Port',
                                    scope: '#/properties/db/properties/port',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'Category',
            label: 'Authentication',
            elements: [
                {
                    type: 'HorizontalLayout',
                    elements: [
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    label: 'Username',
                                    scope: '#/properties/authentication/properties/name',
                                },
                                {
                                    type: 'Control',
                                    label: 'Password',
                                    scope: '#/properties/authentication/properties/pass',
                                },
                                {
                                    type: 'Control',
                                    label: 'Use SSL?',
                                    scope: '#/properties/authentication/properties/ssl',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
