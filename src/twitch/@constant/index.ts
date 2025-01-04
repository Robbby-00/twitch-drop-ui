import { OperationGQL, OperationNameGQL, Sha256GQL, LinkGQL } from "./OperationGQL";

import { ClientType } from "./ClientType";

const MAX_CONNECTION_RETRY = 3      // Max retry after connection failed
const CACHE_TIME = 5 * 60 * 1000    // Cache duration 5min (in milliseconds)

export {
    OperationGQL,
    OperationNameGQL,
    Sha256GQL,
    LinkGQL,
    ClientType,
    MAX_CONNECTION_RETRY,
    CACHE_TIME
}