import { DraftSpecsExtQuery_ByCatalogName } from 'api/draftSpecs';
import { FullSourceDictionary } from 'components/editor/Bindings/Store/types';
import { ResourceConfig, ResourceConfigDictionary } from 'stores/Binding/types';
import {
    generateMockConnectorConfig,
    generateMockResourceConfig,
} from 'test/test-utils';
import { generateTaskSpec, getBindingIndex } from 'utils/workflow-utils';
import { ConnectorConfig } from '../../../flow_deps/flow';

describe('getBindingIndex', () => {
    let defaultResponse: number, foundName: string;

    beforeEach(() => {
        defaultResponse = -1;
        foundName = 'acme/found';
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
            expect(getBindingIndex(['a', 'b', 'c'], foundName)).toBe(-1);
        });
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(getBindingIndex([foundName, 'b', 'c'], foundName)).toBe(0);
            expect(getBindingIndex(['a', foundName, 'c'], foundName)).toBe(1);
            expect(getBindingIndex(['a', 'b', foundName], foundName)).toBe(2);
        });

        test('collection name is in a property of `target` or `source`', () => {
            expect(
                getBindingIndex(
                    [{ source: 'a' }, { source: foundName }, { source: 'c' }],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [{ target: 'a' }, { target: foundName }, { target: 'c' }],
                    foundName
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: foundName }, { name: 'c' }],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: foundName } },
                        { source: { name: 'c' } },
                    ],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: foundName } },
                        { target: { name: 'c' } },
                    ],
                    foundName
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

            test('will update all copies in the bindings', () => {
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
