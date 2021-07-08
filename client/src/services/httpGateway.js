import * as rax from 'retry-axios';
import axios from "axios";

const _httpGateway = axios.create();

_httpGateway.defaults.raxConfig = {
    instance: _httpGateway,
    // Retry 3 times on requests that return a response (500, etc) before giving up.  Defaults to 3.
    retry: 3,

    // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
    noResponseRetries: 2,

    // Milliseconds to delay at first.  Defaults to 100. Only considered when backoffType is 'static'
    retryDelay: 100,

    // HTTP methods to automatically retry.  Defaults to:
    // ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
    httpMethodsToRetry: [ 'GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT' ],

    // The response status codes to retry.  Supports a double
    // array with a list of ranges.  Defaults to:
    // [[100, 199], [429, 429], [500, 599]]
    statusCodesToRetry: [ [ 100, 199 ], [ 400, 429 ], [ 500, 599 ] ],

    // You can set the backoff type.
    // options are 'exponential' (default), 'static' or 'linear'
    backoffType: 'exponential',

    // You can detect when a retry is happening, and figure out how many
    // retry attempts have been made
    onRetryAttempt: err => {
        const cfg = rax.getConfig( err );
        console.log( `Retry attempt #${ cfg.currentRetryAttempt }` );
    }
};
rax.attach( _httpGateway );

export const httpGateway = _httpGateway;
