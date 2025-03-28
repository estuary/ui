import { SelectTableStoreNames } from 'src/stores/names';
import { TableColumns } from 'src/types';

export const selectableTableStoreName = SelectTableStoreNames.DATA_PLANE;

export const columns: TableColumns[] = [
    {
        field: 'data_plane_name',
        headerIntlKey: 'data.name',
    },
    {
        field: 'aws_iam_user_arn',
        headerIntlKey: 'data.awsIamUserArn',
    },
    {
        field: 'gcp_service_account_email',
        headerIntlKey: 'data.gcpServiceAccount',
    },
    {
        field: 'cidr_blocks',
        headerIntlKey: 'data.cidr',
    },
];
