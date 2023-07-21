import { JsonPointer } from 'json-ptr';

import { DataGrid } from '@mui/x-data-grid';

import { dataGridListStyling } from 'context/Theme';

import { JournalRecord } from 'hooks/useJournalData';

const sampleSpec = {
    catalog_name: 'estuary/kjt/milk_types',
    spec_type: 'collection',
    id: '08:e9:e2:d9:50:22:0c:00',
    updated_at: undefined,
    spec: {
        schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
                flavor_profile: {
                    type: 'string',
                },
                row_id: {
                    type: 'integer',
                },
                type: {
                    type: 'string',
                },
            },
            required: ['row_id'],
            type: 'object',
        },
        key: ['/row_id'],
    },
};

const sampleJournalData = {
    data: {
        documents: [
            {
                _meta: {
                    uuid: 'f6f148e9-ae2e-11ed-8401-75f5912b4b26',
                },
                flavor_profile: 'sweet',
                row_id: 203,
                type: 'oat',
            },
            {
                _meta: {
                    uuid: 'f6f148e9-ae2e-11ed-8801-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 204,
                type: 'almond',
            },
            {
                _meta: {
                    uuid: 'f6f148e9-ae2e-11ed-8c01-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 205,
                type: 'soy',
            },
            {
                _meta: {
                    uuid: 'f6f148e9-ae2e-11ed-9001-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 206,
                type: 'cow',
            },
            {
                _meta: {
                    uuid: 'f6f148e9-ae2e-11ed-9401-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 207,
                type: 'goat',
            },
            {
                _meta: {
                    uuid: 'a9eb086d-ae2f-11ed-8401-75f5912b4b26',
                },
                flavor_profile: 'sweet',
                row_id: 203,
                type: 'oat',
            },
            {
                _meta: {
                    uuid: 'a9eb086d-ae2f-11ed-8801-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 204,
                type: 'almond',
            },
            {
                _meta: {
                    uuid: 'a9eb086d-ae2f-11ed-8c01-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 205,
                type: 'soy',
            },
            {
                _meta: {
                    uuid: 'a9eb086d-ae2f-11ed-9001-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 206,
                type: 'cow',
            },
            {
                _meta: {
                    uuid: 'a9eb086d-ae2f-11ed-9401-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 207,
                type: 'goat',
            },
            {
                _meta: {
                    uuid: '5ca797a9-ae30-11ed-8401-75f5912b4b26',
                },
                flavor_profile: 'sweet',
                row_id: 203,
                type: 'oat',
            },
            {
                _meta: {
                    uuid: '5ca797a9-ae30-11ed-8801-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 204,
                type: 'almond',
            },
            {
                _meta: {
                    uuid: '5ca797a9-ae30-11ed-8c01-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 205,
                type: 'soy',
            },
            {
                _meta: {
                    uuid: '5ca797a9-ae30-11ed-9001-75f5912b4b26',
                },
                flavor_profile: 'neutral',
                row_id: 206,
                type: 'cow',
            },
            {
                _meta: {
                    uuid: '5ca797a9-ae30-11ed-9401-75f5912b4b26',
                },
                flavor_profile: 'bitter',
                row_id: 207,
                type: 'goat',
            },
            {
                _meta: {
                    uuid: '22d86ce8-c753-11ed-8401-3dc2af2abc77',
                },
                flavor_profile: 'sweet',
                row_id: 203,
                type: 'oat',
            },
            {
                _meta: {
                    uuid: '22d86ce8-c753-11ed-8801-3dc2af2abc77',
                },
                flavor_profile: 'neutral',
                row_id: 204,
                type: 'almond',
            },
            {
                _meta: {
                    uuid: '22d86ce8-c753-11ed-8c01-3dc2af2abc77',
                },
                flavor_profile: 'bitter',
                row_id: 205,
                type: 'soy',
            },
            {
                _meta: {
                    uuid: '22d86ce8-c753-11ed-9001-3dc2af2abc77',
                },
                flavor_profile: 'neutral',
                row_id: 206,
                type: 'cow',
            },
            {
                _meta: {
                    uuid: '22d86ce8-c753-11ed-9401-3dc2af2abc77',
                },
                flavor_profile: 'bitter',
                row_id: 207,
                type: 'goat',
            },
        ],
        tooFewDocuments: true,
        tooManyBytes: false,
    },
    error: null,
};

const buildRecordKey = (record: Record<string, any>) => {
    return sampleSpec.spec.key
        .map((k: string) => JsonPointer.get(record, k))
        .join('_');
};

const rowsByKey = Object.assign(
    {},
    ...sampleJournalData.data.documents.map((record) => ({
        [buildRecordKey(record)]: record,
    }))
) as Record<string, JournalRecord<Record<string, any>>>;

function DataPreview() {
    return (
        <DataGrid
            columns={[
                { field: 'id', headerName: 'ID', flex: 1 },
                {
                    field: 'flavor_profile',
                    headerName: 'Flavor Profile',
                    flex: 1,
                },
                { field: 'type', headerName: 'Type', flex: 1 },
            ]}
            rows={Object.entries(rowsByKey).map(([key, value]) => ({
                id: key,
                flavor_profile: value.flavor_profile,
                type: value.type,
            }))}
            hideFooter
            disableColumnSelector
            density="compact"
            headerHeight={40}
            rowCount={sampleJournalData.data.documents.length}
            sx={dataGridListStyling}
        />
    );
}

export default DataPreview;
