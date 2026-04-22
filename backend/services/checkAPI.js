//the function to actually make the request and check the response
const axios = require('axios');

const checkAPI = async (url, method, headers, body, queryParams, timeoutMS, expectedResponse) => {
    const start = Date.now();

    const headersObj = headers instanceof Map ? Object.fromEntries(headers) : headers; //axios was not able to use map 
    const paramsObj = queryParams instanceof Map ? Object.fromEntries(queryParams) : queryParams;

    try {
        const response = await axios({
            url,
            method,
            headers: headersObj,
            data: body,
            params: paramsObj,
            timeout: timeoutMS,
            validateStatus: () => true,
        });

        const responseTime = Date.now() - start;

        const result = {
            success: true,
            statusCode: response.status,
            responseTime,
            responseHeaders: response.headers,
            responseBody: response.data,
            error: null,
            failureReason: null,
        };

        if (expectedResponse?.statusCode) {
            if (response.status !== expectedResponse.statusCode) {
                result.success = false;
                result.failureReason = 'status_mismatch';
            }
        } else if (response.status < 200 || response.status >= 300) {
            result.success = false;
            result.failureReason = 'status_mismatch';
        }

        if (result.success && expectedResponse?.bodyContains) {
            const bodyStr = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);
            if (!bodyStr.includes(expectedResponse.bodyContains)) {
                result.success = false;
                result.failureReason = 'body_mismatch';
            }
        }

        return result;

    } catch (error) {
        const responseTime = Date.now() - start;
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        return {
            success: false,
            statusCode: null,
            responseTime,
            responseHeaders: null,
            responseBody: null,
            error: {
                message: error.message,
                code: error.code || null,
            },
            failureReason: isTimeout ? 'timeout' : 'network_error',
        };
    }
};

module.exports = checkAPI;
