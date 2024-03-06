import { DraftSpecsExtQuery_ByCatalogName } from 'api/draftSpecs';
import { FullSourceDictionary } from 'components/editor/Bindings/Store/types';
import { ResourceConfig, ResourceConfigDictionary } from 'stores/Binding/types';
import {
    generateMockBinding,
    generateMockConnectorConfig,
    generateMockResourceConfig,
} from 'test/test-utils';
import { generateTaskSpec, getBindingIndex } from 'utils/workflow-utils';
import { ConnectorConfig } from '../../../flow_deps/flow';

describe('getBindingIndex', () => {
    let defaultResponse: number,
        matchedCollection: string,
        matchedConfig: ResourceConfig;

    beforeEach(() => {
        defaultResponse = -1;
        matchedCollection = 'acme/found';
        matchedConfig = generateMockResourceConfig(matchedCollection, 0);
    });

    describe('returns -1 when', () => {
        test('bindings are missing', () => {
            expect(getBindingIndex(undefined, '')).toBe(defaultResponse);
            expect(getBindingIndex(null, '')).toBe(defaultResponse);
        });

        test('bindings are empty', () => {
            expect(getBindingIndex([], '')).toBe(defaultResponse);
            expect(getBindingIndex([null], '')).toBe(defaultResponse);
            expect(getBindingIndex([undefined], '')).toBe(defaultResponse);
            expect(getBindingIndex([{}], '')).toBe(defaultResponse);
        });

        test('bindings do not contain collection', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('b', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection
                )
            ).toBe(-1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection
                )
            ).toBe(-1);
        });

        test('multiple bindings map to the collection and a target resource config is not provided', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection
                )
            ).toBe(-1);
        });
    });

    describe('returns -500 when', () => {
        test('multiple bindings map to the collection and two or more resource configs are identical', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    matchedConfig
                )
            ).toBe(-500);
        });
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(
                getBindingIndex(
                    [matchedCollection, 'b', 'c'],
                    matchedCollection
                )
            ).toBe(0);
            expect(
                getBindingIndex(
                    ['a', matchedCollection, 'c'],
                    matchedCollection
                )
            ).toBe(1);
            expect(
                getBindingIndex(
                    ['a', 'b', matchedCollection],
                    matchedCollection
                )
            ).toBe(2);
        });

        test('collection name is in a property of `target` or `source`', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture', {
                            resourceConfig: { fiz: 'unmatched_resource' },
                        }),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    matchedConfig
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'materialization'),
                        generateMockBinding(
                            matchedCollection,
                            'materialization'
                        ),
                        generateMockBinding('c', 'materialization'),
                    ],
                    matchedCollection
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'materialization'),
                        generateMockBinding(
                            matchedCollection,
                            'materialization'
                        ),
                        generateMockBinding(
                            matchedCollection,
                            'materialization',
                            {
                                resourceConfig: { fiz: 'unmatched_resource' },
                            }
                        ),
                        generateMockBinding('c', 'materialization'),
                    ],
                    matchedCollection,
                    matchedConfig
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: matchedCollection }, { name: 'c' }],
                    matchedCollection
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: matchedCollection } },
                        { source: { name: 'c' } },
                    ],
                    matchedCollection
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: matchedCollection } },
                        { target: { name: 'c' } },
                    ],
                    matchedCollection
                )
            ).toBe(1);
        });
    });
});

describe('generateTaskSpec', () => {
    let uuidOne: string,
        uuidTwo: string,
        uuidThree: string,
        resourceConfig_one: ResourceConfig,
        resourceConfig_two: ResourceConfig,
        resourceConfig_three: ResourceConfig,
        connectorConfig: ConnectorConfig,
        resourceConfigs: ResourceConfigDictionary | null,
        existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
        sourceCapture: string | null,
        fullSource: FullSourceDictionary | null,
        resourceConfigServerUpdateRequired: boolean;

    beforeEach(() => {
        uuidOne = crypto.randomUUID();
        uuidTwo = crypto.randomUUID();
        uuidThree = crypto.randomUUID();

        resourceConfig_one = generateMockResourceConfig('mock/binding/one', 0);
        resourceConfig_two = generateMockResourceConfig('mock/binding/two', 1);
        resourceConfig_three = generateMockResourceConfig(
            'mock/binding/three',
            2
        );

        connectorConfig = generateMockConnectorConfig();
        resourceConfigs = null;
        existingTaskData = null;
        sourceCapture = null;
        fullSource = null;
        resourceConfigServerUpdateRequired = false;
    });

    describe('when no existing data or binding data', () => {
        beforeEach(() => {
            existingTaskData = null;
            resourceConfigs = {};
        });

        test('bindings will be empty', () => {
            const response = generateTaskSpec(
                'capture',
                connectorConfig,
                {},
                existingTaskData,
                sourceCapture,
                fullSource,
                resourceConfigServerUpdateRequired
            );
            expect(response.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data but no binding data', () => {
        beforeEach(() => {
            connectorConfig = generateMockConnectorConfig();
            existingTaskData = {
                catalog_name: 'mock/test/capture-postgres',
                draft_id: '00:00:00:00:00:00:00:00',
                expect_pub_id: '00:00:00:00:00:00:00:00',
                spec_type: 'capture',
                spec: {
                    bindings: [
                        {
                            target: 'mock/binding/one',
                            resource: {
                                table: 'table_name',
                                delta_updates: false,
                            },
                        },
                        {
                            target: 'mock/binding/two',
                            resource: {
                                table: 'table_name_two',
                                delta_updates: false,
                            },
                            backfill: 2,
                        },
                    ],
                    endpoint: {
                        connector: connectorConfig,
                    },
                },
            };
        });

        test('existing bindings will be cleaned out as they assume they were deleted', () => {
            const response = generateTaskSpec(
                'capture',
                connectorConfig,
                {},
                existingTaskData,
                sourceCapture,
                fullSource,
                resourceConfigServerUpdateRequired
            );
            expect(response.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data and new data', () => {
        beforeEach(() => {
            connectorConfig = generateMockConnectorConfig();
            resourceConfigServerUpdateRequired = true;

            existingTaskData = {
                catalog_name: 'mock/test/capture-postgres',
                draft_id: '00:00:00:00:00:00:00:00',
                expect_pub_id: '00:00:00:00:00:00:00:00',
                spec_type: 'capture',
                spec: {
                    bindings: [
                        {
                            target: 'mock/binding/one',
                            resource: {
                                table: 'table_name',
                                delta_updates: false,
                            },
                        },
                        {
                            target: 'mock/binding/two',
                            resource: {
                                table: 'table_name_two',
                                delta_updates: false,
                            },
                            backfill: 2,
                        },
                    ],
                    endpoint: {
                        connector: connectorConfig,
                    },
                },
            };
        });

        test('existing bindings will have their config overwritten and new ones added', () => {
            const response = generateTaskSpec(
                'capture',
                connectorConfig,
                {
                    [uuidOne]: resourceConfig_one,
                    [uuidTwo]: resourceConfig_two,
                    [uuidThree]: resourceConfig_three,
                },
                existingTaskData,
                sourceCapture,
                fullSource,
                resourceConfigServerUpdateRequired
            );
            expect(response.bindings).toStrictEqual([
                {
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/one',
                },
                {
                    backfill: 2,
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/two',
                },
                {
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/three',
                },
            ]);
        });

        describe('duplicates in existing bindings', () => {
            beforeEach(() => {
                existingTaskData?.spec.bindings.push(
                    existingTaskData.spec.bindings[0]
                );
                existingTaskData?.spec.bindings.push(
                    existingTaskData.spec.bindings[0]
                );
            });

            test('when the resource config contains a single instance of a duplicated binding, update one binding instance and remove others', () => {
                const response = generateTaskSpec(
                    'capture',
                    connectorConfig,
                    {
                        [uuidOne]: {
                            ...resourceConfig_one,
                            data: {
                                bar: 'updated',
                            },
                        },
                        [uuidTwo]: resourceConfig_two,
                    },
                    existingTaskData,
                    sourceCapture,
                    fullSource,
                    resourceConfigServerUpdateRequired
                );

                expect(response.bindings).toMatchSnapshot();
            });
        });
    });

    describe('entity type can alter what is returned', () => {
        beforeEach(() => {
            resourceConfigs = {
                [uuidOne]: resourceConfig_one,
                [uuidTwo]: resourceConfig_two,
            };
        });

        describe('when entity type is capture', () => {
            beforeEach(() => {
                existingTaskData = {
                    catalog_name: 'mock/test/source-postgres',
                    draft_id: '00:00:00:00:00:00:00:00',
                    expect_pub_id: '00:00:00:00:00:00:00:00',
                    spec_type: 'capture',
                    spec: {
                        bindings: [
                            {
                                target: 'mock/binding/one',
                                resource: {
                                    table: 'table_name',
                                    delta_updates: false,
                                },
                            },
                            {
                                target: 'mock/binding/two',
                                resource: {
                                    table: 'table_name_two',
                                    delta_updates: false,
                                },
                                backfill: 2,
                            },
                        ],
                        endpoint: {
                            connector: connectorConfig,
                        },
                    },
                };
            });

            test('`target` property is used to identify the associated collection', () => {
                expect(
                    generateTaskSpec(
                        'capture',
                        connectorConfig,
                        resourceConfigs,
                        existingTaskData,
                        sourceCapture,
                        fullSource,
                        resourceConfigServerUpdateRequired
                    ).bindings.map(({ target }: any) => target)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });

            test('cannot return the `sourceCapture` property', () => {
                sourceCapture = 'mock/source/capture';

                expect(
                    generateTaskSpec(
                        'capture',
                        connectorConfig,
                        resourceConfigs,
                        existingTaskData,
                        sourceCapture,
                        fullSource,
                        resourceConfigServerUpdateRequired
                    ).sourceCapture
                ).toBeUndefined();
            });
        });

        describe('when entity type is materialization', () => {
            beforeEach(() => {
                existingTaskData = {
                    catalog_name: 'mock/test/materialize-postgres',
                    draft_id: '00:00:00:00:00:00:00:00',
                    expect_pub_id: '00:00:00:00:00:00:00:00',
                    spec_type: 'materialization',
                    spec: {
                        bindings: [
                            {
                                source: 'mock/binding/one',
                                resource: {
                                    table: 'table_name',
                                    delta_updates: false,
                                },
                            },
                            {
                                source: 'mock/binding/two',
                                resource: {
                                    table: 'table_name_two',
                                    delta_updates: false,
                                },
                                backfill: 2,
                            },
                        ],
                        endpoint: {
                            connector: connectorConfig,
                        },
                    },
                };
            });

            test('`source` property is used to identify the associated collection', () => {
                expect(
                    generateTaskSpec(
                        'materialization',
                        connectorConfig,
                        resourceConfigs,
                        existingTaskData,
                        sourceCapture,
                        fullSource,
                        resourceConfigServerUpdateRequired
                    ).bindings.map(({ source }: any) => source)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });

            test('can return the `sourceCapture` property', () => {
                sourceCapture = 'mock/source/capture';

                expect(
                    generateTaskSpec(
                        'materialization',
                        connectorConfig,
                        resourceConfigs,
                        existingTaskData,
                        sourceCapture,
                        fullSource,
                        resourceConfigServerUpdateRequired
                    ).sourceCapture
                ).toStrictEqual(sourceCapture);
            });
        });
    });
});
