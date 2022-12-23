import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

function useFormSchema() {
    const intl = useIntl();

    const schema = useConstant(() => {
        return {
            type: 'object',
            required: ['bucket', 'lastUpdate', 'prefix'],
            properties: {
                bucket: {
                    description: intl.formatMessage({
                        id: 'storageMappings.bucket.description',
                    }),
                    type: 'string',
                },
                lastUpdated: {
                    type: 'string',
                },
                prefix: {
                    description: intl.formatMessage({
                        id: 'storageMappings.prefix.description',
                    }),
                    type: 'string',
                },
            },
        };
    });

    const uiSchema = useConstant(() => {
        return {
            elements: [
                {
                    elements: [
                        {
                            label: intl.formatMessage({
                                id: 'common.tenant',
                            }),
                            scope: `#/properties/prefix`,
                            type: 'Control',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'storageMappings.bucket.label',
                            }),
                            scope: `#/properties/bucket`,
                            type: 'Control',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'storageMappings.lastUpdated.label',
                            }),
                            scope: '#/properties/lastUpdated',
                            type: 'Control',
                        },
                    ],
                    type: 'VerticalLayout',
                },
            ],
            type: 'VerticalLayout',
        };
    });

    return {
        schema,
        uiSchema,
    };
}

export default useFormSchema;
