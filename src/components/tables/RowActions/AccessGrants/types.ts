export interface RowConfirmation<T = any> {
    id: string;
    message: string;
    details?: T;
}
