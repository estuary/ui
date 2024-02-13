import { DraftSpecsExtQuery_ByCatalogName } from 'api/draftSpecs';
import { FullSourceDictionary } from 'components/editor/Bindings/Store/types';
import {
    ResourceConfig,
    ResourceConfigDictionary,
} from 'stores/ResourceConfig/types';
import { generateMockConnectorConfig } from 'test/test-utils';
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
    let mockedResourceConfig: ResourceConfig,
        connectorConfig: ConnectorConfig,
        resourceConfigs: ResourceConfigDictionary | null,
        existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
        sourceCapture: string | null,
        fullSource: FullSourceDictionary | null;

    beforeEach(() => {
        mockedResourceConfig = {
            errors: [],
            data: {
                fiz: 'resource',
            },
            disable: false,
            previouslyDisabled: false,
        };

        connectorConfig = generateMockConnectorConfig();
        resourceConfigs = null;
        existingTaskData = null;
        sourceCapture = null;
        fullSource = null;
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
                fullSource
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
                fullSource
            );
            expect(response.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data and new data', () => {
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

        test('existing bindings will have their config overwritten and new ones added', () => {
            const response = generateTaskSpec(
                'capture',
                connectorConfig,
                {
                    'mock/binding/one': mockedResourceConfig,
                    'mock/binding/two': mockedResourceConfig,
                    'mock/binding/three': mockedResourceConfig,
                },
                existingTaskData,
                sourceCapture,
                fullSource
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
                if (!existingTaskData) {
                    return console.log('missing data');
                }

                existingTaskData.spec.bindings.push(
                    existingTaskData.spec.bindings[0]
                );
                existingTaskData.spec.bindings.push(
                    existingTaskData.spec.bindings[0]
                );
            });

            test('will update all copies in the bindings', () => {
                const response = generateTaskSpec(
                    'capture',
                    connectorConfig,
                    {
                        'mock/binding/one': {
                            ...mockedResourceConfig,
                            data: {
                                bar: 'updated',
                            },
                        },
                        'mock/binding/two': mockedResourceConfig,
                    },
                    existingTaskData,
                    sourceCapture,
                    fullSource
                );

                expect(response.bindings).toMatchSnapshot();
            });
        });
    });

    describe('entity type can alter what is returned', () => {
        beforeEach(() => {
            resourceConfigs = {
                first: mockedResourceConfig,
                second: mockedResourceConfig,
            };
        });

        test('captures use `target` and materializations use `source` as the binding name', () => {
            expect(
                generateTaskSpec(
                    'capture',
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                ).bindings.map(({ target }: any) => target)
            ).toStrictEqual(['first', 'second']);

            expect(
                generateTaskSpec(
                    'materialization',
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                ).bindings.map(({ source }: any) => source)
            ).toStrictEqual(['first', 'second']);
        });

        test('only materializations can return the `sourceCapture` property', () => {
            sourceCapture = 'mock/source/capture';

            expect(
                generateTaskSpec(
                    'capture',
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                ).sourceCapture
            ).toBeUndefined();

            expect(
                generateTaskSpec(
                    'materialization',
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                ).sourceCapture
            ).toStrictEqual(sourceCapture);
        });
    });
});
