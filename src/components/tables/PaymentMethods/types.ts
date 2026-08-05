import type { PaymentMethod } from 'src/gql-types/graphql';

export interface RowProps extends PaymentMethod {
    isPrimaryMethod: boolean;
    onDelete(): void;
    onPrimary(): void;
}

export interface RowsProps {
    data: PaymentMethod[];
    primaryMethodId: string | undefined;
}
