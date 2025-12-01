import * as broker from "./gen/broker/protocol/broker.js";
export declare class Selector {
    protected labels: Array<broker.ProtocolLabel>;
    constructor();
    toLabelSet(): broker.ProtocolLabelSet;
}
export declare class JournalSelector extends Selector {
    collection(v: string): this;
    name(v: string): this;
    static prefix(v: string): JournalSelector;
}
export declare class ShardSelector extends Selector {
    task(v: string): this;
    id(v: string): this;
}
