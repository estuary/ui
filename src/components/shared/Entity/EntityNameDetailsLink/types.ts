export interface ViewDetailsProps {
    name: string;
    path: string;
    newWindow?: boolean;
    // Drops the link's own affordances (color, underline, "View details"
    // tooltip). For contexts where a larger element already carries the click
    // affordance — a whole clickable table row, say — so the name doesn't
    // compete with it by advertising itself as a narrower target than the
    // row actually is. Still a real anchor underneath, so keyboard focus,
    // middle-click, and "open in new tab" keep working.
    plain?: boolean;
}
