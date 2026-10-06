export interface ViewDetailsProps {
    name: string;
    path: string;
    newWindow?: boolean;
    // Drops the link's own styling and tooltip, for when a larger element such
    // as a clickable row carries the affordance. Still a real anchor, so
    // keyboard focus and "open in new tab" keep working.
    plain?: boolean;
}
