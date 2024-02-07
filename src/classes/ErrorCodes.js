/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */
export default {
    RPC_CONNECT_FAILED:         100,
    WALLET_NOT_CONNECTED:       101,
    WALLET_DECRYPTION_ERROR:    102,
    PASSWORD_REQUIRED:          103,
    DEFAULT_WALLET_NOT_FOUND:   104,
    WALLET_IMPORT_BY_PK_FAILED: 105,
    UNKNOWN_TOKEN_STANDARD:     106,
    
    PROCESSING_ERROR:           107,

    invalidInput: -32000,
    resourceNotFound: -32001,
    resourceUnavailable: -32002,
    transactionRejected: -32003,
    methodNotSupported: -32004,
    limitExceeded: -32005,
    parse: -32700,
    invalidRequest: -32600,
    methodNotFound: -32601,
    invalidParams: -32602,
    internal: -32603,

    userRejectedRequest: 4001,
    unauthorized: 4100,
    unsupportedMethod: 4200,
    disconnected: 4900,
    chainDisconnected: 4901,
}