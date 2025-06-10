import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByCatalogName } from 'src/api/draftSpecs';
import type { FullSourceDictionary } from 'src/stores/Binding/slices/TimeTravel';
import type {
    ResourceConfig,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type { SourceCaptureDef } from 'src/types';

import {
    generateMockBinding,
    generateMockConnectorConfig,
    generateMockResourceConfig,
} from 'src/test/test-utils';
import { generateTaskSpec, getBindingIndex } from 'src/utils/workflow-utils';

describe('getBindingIndex', () => {
    let defaultResponse: number, matchedCollection: string;

    beforeEach(() => {
        defaultResponse = -1;
        matchedCollection = 'acme/found';
    });

    describe('returns -1 when', () => {
        test('bindings are empty', () => {
            expect(getBindingIndex([], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([null], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([undefined], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([{}], '', -1)).toBe(defaultResponse);
        });

        test('bindings do not contain collection', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('b', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(-1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(-1);
        });

        test('multiple bindings map to the collection and the number of matched bindings is less than the target binding index', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    3
                )
            ).toBe(-1);
        });

        test('multiple bindings map to the collection and the number of matched bindings is equal to the target binding index', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    2
                )
            ).toBe(-1);
        });
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(
                getBindingIndex(
                    [matchedCollection, 'b', 'c'],
                    matchedCollection,
                    0
                )
            ).toBe(0);
            expect(
                getBindingIndex(
                    ['a', matchedCollection, 'c'],
                    matchedCollection,
                    0
                )
            ).toBe(1);
            expect(
                getBindingIndex(
                    ['a', 'b', matchedCollection],
                    matchedCollection,
                    0
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
                    matchedCollection,
                    0
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
                    matchedCollection,
                    0
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: matchedCollection }, { name: 'c' }],
                    matchedCollection,
                    0
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: matchedCollection } },
                        { source: { name: 'c' } },
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: matchedCollection } },
                        { target: { name: 'c' } },
                    ],
                    matchedCollection,
                    0
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
        resourceConfigs: ResourceConfigDictionary,
        existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
        sourceCaptureDefinition: SourceCaptureDef | null,
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
        resourceConfigs = {};
        existingTaskData = null;
        sourceCaptureDefinition = null;
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
                resourceConfigServerUpdateRequired,
                {},
                existingTaskData,
                { fullSource, sourceCaptureDefinition }
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
                resourceConfigServerUpdateRequired,
                {},
                existingTaskData,
                { fullSource, sourceCaptureDefinition }
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
                resourceConfigServerUpdateRequired,
                {
                    [resourceConfig_one.meta.collectionName]: [uuidOne],
                    [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    [resourceConfig_three.meta.collectionName]: [uuidThree],
                },
                existingTaskData,
                { fullSource, sourceCaptureDefinition }
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

            test('when the resource config contains a single instance of a duplicated binding, update one binding instance', () => {
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
                    resourceConfigServerUpdateRequired,
                    {
                        [resourceConfig_one.meta.collectionName]: [uuidOne],
                        [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    },
                    existingTaskData,
                    {
                        fullSource,
                        sourceCaptureDefinition,
                    }
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
                        resourceConfigServerUpdateRequired,
                        {
                            [resourceConfig_one.meta.collectionName]: [uuidOne],
                            [resourceConfig_two.meta.collectionName]: [uuidTwo],
                        },
                        existingTaskData,
                        {
                            fullSource,
                            sourceCaptureDefinition,
                        }
                    ).bindings.map(({ target }: any) => target)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });

            test('cannot return the `sourceCapture` property', () => {
                sourceCaptureDefinition = {
                    capture: 'mock/source/capture',
                    deltaUpdates: false,
                    targetSchema: 'leaveEmpty',
                };

                expect(
                    generateTaskSpec(
                        'capture',
                        connectorConfig,
                        resourceConfigs,
                        resourceConfigServerUpdateRequired,
                        {
                            [resourceConfig_one.meta.collectionName]: [uuidOne],
                            [resourceConfig_two.meta.collectionName]: [uuidTwo],
                        },
                        existingTaskData,
                        {
                            fullSource,
                            sourceCaptureDefinition,
                        }
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
                        resourceConfigServerUpdateRequired,
                        {
                            [resourceConfig_one.meta.collectionName]: [uuidOne],
                            [resourceConfig_two.meta.collectionName]: [uuidTwo],
                        },
                        existingTaskData,
                        {
                            fullSource,
                            sourceCaptureDefinition,
                        }
                    ).bindings.map(({ source }: any) => source)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });

            describe('if a sourceCaptureDefinition is provided', () => {
                beforeEach(() => {
                    sourceCaptureDefinition = {
                        capture: 'mock/source/capture',
                        deltaUpdates: false,
                        targetSchema: 'leaveEmpty',
                    };
                });

                test('will return the `source` property by default', () => {
                    expect(
                        generateTaskSpec(
                            'materialization',
                            connectorConfig,
                            resourceConfigs,
                            resourceConfigServerUpdateRequired,
                            {
                                [resourceConfig_one.meta.collectionName]: [
                                    uuidOne,
                                ],
                                [resourceConfig_two.meta.collectionName]: [
                                    uuidTwo,
                                ],
                            },
                            existingTaskData,
                            {
                                fullSource,
                                sourceCaptureDefinition,
                            }
                        ).source
                    ).toStrictEqual(sourceCaptureDefinition);
                });

                test('will use `sourceCapture` property if already defined', () => {
                    if (existingTaskData) {
                        existingTaskData = {
                            ...existingTaskData,
                            spec: {
                                ...existingTaskData.spec,
                                sourceCapture: {},
                            },
                        };
                    }

                    expect(
                        generateTaskSpec(
                            'materialization',
                            connectorConfig,
                            resourceConfigs,
                            resourceConfigServerUpdateRequired,
                            {
                                [resourceConfig_one.meta.collectionName]: [
                                    uuidOne,
                                ],
                                [resourceConfig_two.meta.collectionName]: [
                                    uuidTwo,
                                ],
                            },
                            existingTaskData,
                            {
                                fullSource,
                                sourceCaptureDefinition,
                            }
                        ).sourceCapture
                    ).toStrictEqual(sourceCaptureDefinition);
                });
            });

            describe('if a sourceCaptureDefinition is not provided', () => {
                beforeEach(() => {
                    sourceCaptureDefinition = null;
                });

                test('will remove `source` and `sourceCapture` property if no definition is provided', () => {
                    if (existingTaskData) {
                        existingTaskData = {
                            ...existingTaskData,
                            spec: {
                                ...existingTaskData.spec,
                                source: 'foo',
                                sourceCapture: 'foo',
                            },
                        };
                    }

                    const response = generateTaskSpec(
                        'materialization',
                        connectorConfig,
                        resourceConfigs,
                        resourceConfigServerUpdateRequired,
                        {
                            [resourceConfig_one.meta.collectionName]: [uuidOne],
                            [resourceConfig_two.meta.collectionName]: [uuidTwo],
                        },
                        existingTaskData,
                        {
                            fullSource,
                            sourceCaptureDefinition,
                        }
                    );

                    expect(response.source).toStrictEqual(undefined);
                    expect(response.sourceCapture).toStrictEqual(undefined);
                });
            });
        });
    });
});
