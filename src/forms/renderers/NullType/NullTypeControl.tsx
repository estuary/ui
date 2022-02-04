import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import NullType from './NullType';

const NullTypeControl = ({
    data,
    handleChange,
    path,
    errors,
}: ControlProps) => <NullType />;

export default withJsonFormsControlProps(NullTypeControl);
