import { withJsonFormsControlProps } from '@jsonforms/react';
import { TenantName } from './TenantName';

interface TenantNameControlProps {
    data: any;
    handleChange(path: string, value: any): void;
    path: string;
}

const TenantNameControl = ({
    data,
    handleChange,
    path,
}: TenantNameControlProps) => (
    <TenantName
        value={data}
        updateValue={(newValue: string) => handleChange(path, newValue)}
    />
);

export default withJsonFormsControlProps(TenantNameControl);
