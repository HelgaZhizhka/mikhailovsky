(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/js/app"],{

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/*! exports provided: name, version, description, main, scripts, repository, keywords, author, license, bugs, homepage, devDependencies, browser, jsdelivr, unpkg, typings, dependencies, bundlesize, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"axios\",\"version\":\"0.21.2\",\"description\":\"Promise based HTTP client for the browser and node.js\",\"main\":\"index.js\",\"scripts\":{\"test\":\"grunt test\",\"start\":\"node ./sandbox/server.js\",\"build\":\"NODE_ENV=production grunt build\",\"preversion\":\"npm test\",\"version\":\"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json\",\"postversion\":\"git push && git push --tags\",\"examples\":\"node ./examples/server.js\",\"coveralls\":\"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js\",\"fix\":\"eslint --fix lib/**/*.js\"},\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/axios/axios.git\"},\"keywords\":[\"xhr\",\"http\",\"ajax\",\"promise\",\"node\"],\"author\":\"Matt Zabriskie\",\"license\":\"MIT\",\"bugs\":{\"url\":\"https://github.com/axios/axios/issues\"},\"homepage\":\"https://axios-http.com\",\"devDependencies\":{\"coveralls\":\"^3.0.0\",\"es6-promise\":\"^4.2.4\",\"grunt\":\"^1.3.0\",\"grunt-banner\":\"^0.6.0\",\"grunt-cli\":\"^1.2.0\",\"grunt-contrib-clean\":\"^1.1.0\",\"grunt-contrib-watch\":\"^1.0.0\",\"grunt-eslint\":\"^23.0.0\",\"grunt-karma\":\"^4.0.0\",\"grunt-mocha-test\":\"^0.13.3\",\"grunt-ts\":\"^6.0.0-beta.19\",\"grunt-webpack\":\"^4.0.2\",\"istanbul-instrumenter-loader\":\"^1.0.0\",\"jasmine-core\":\"^2.4.1\",\"karma\":\"^6.3.2\",\"karma-chrome-launcher\":\"^3.1.0\",\"karma-firefox-launcher\":\"^2.1.0\",\"karma-jasmine\":\"^1.1.1\",\"karma-jasmine-ajax\":\"^0.1.13\",\"karma-safari-launcher\":\"^1.0.0\",\"karma-sauce-launcher\":\"^4.3.6\",\"karma-sinon\":\"^1.0.5\",\"karma-sourcemap-loader\":\"^0.3.8\",\"karma-webpack\":\"^4.0.2\",\"load-grunt-tasks\":\"^3.5.2\",\"minimist\":\"^1.2.0\",\"mocha\":\"^8.2.1\",\"sinon\":\"^4.5.0\",\"terser-webpack-plugin\":\"^4.2.3\",\"typescript\":\"^4.0.5\",\"url-search-params\":\"^0.10.0\",\"webpack\":\"^4.44.2\",\"webpack-dev-server\":\"^3.11.0\"},\"browser\":{\"./lib/adapters/http.js\":\"./lib/adapters/xhr.js\"},\"jsdelivr\":\"dist/axios.min.js\",\"unpkg\":\"dist/axios.min.js\",\"typings\":\"./index.d.ts\",\"dependencies\":{\"follow-redirects\":\"^1.14.0\"},\"bundlesize\":[{\"path\":\"./dist/axios.min.js\",\"threshold\":\"5kB\"}]}");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/admin/Dashboard.vue?vue&type=script&lang=js&":
/*!***************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/admin/Dashboard.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "Dashboard"
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/About.vue?vue&type=script&lang=js&":
/*!****************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/About.vue?vue&type=script&lang=js& ***!
  \****************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "About"
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/Landing.vue?vue&type=script&lang=js&":
/*!******************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/Landing.vue?vue&type=script&lang=js& ***!
  \******************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "Landing"
});

/***/ }),

/***/ "./node_modules/json2mq/index.js":
/*!***************************************!*\
  !*** ./node_modules/json2mq/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var camel2hyphen = __webpack_require__(/*! string-convert/camel2hyphen */ "./node_modules/string-convert/camel2hyphen.js");

var isDimension = function (feature) {
  var re = /[height|width]$/;
  return re.test(feature);
};

var obj2mq = function (obj) {
  var mq = '';
  var features = Object.keys(obj);
  features.forEach(function (feature, index) {
    var value = obj[feature];
    feature = camel2hyphen(feature);
    // Add px to dimension features
    if (isDimension(feature) && typeof value === 'number') {
      value = value + 'px';
    }
    if (value === true) {
      mq += feature;
    } else if (value === false) {
      mq += 'not ' + feature;
    } else {
      mq += '(' + feature + ': ' + value + ')';
    }
    if (index < features.length-1) {
      mq += ' and '
    }
  });
  return mq;
};

var json2mq = function (query) {
  var mq = '';
  if (typeof query === 'string') {
    return query;
  }
  // Handling array of media queries
  if (query instanceof Array) {
    query.forEach(function (q, index) {
      mq += obj2mq(q);
      if (index < query.length-1) {
        mq += ', '
      }
    });
    return mq;
  }
  // Handling single media query
  return obj2mq(query);
};

module.exports = json2mq;

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/setimmediate/setImmediate.js":
/*!***************************************************!*\
  !*** ./node_modules/setimmediate/setImmediate.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/string-convert/camel2hyphen.js":
/*!*****************************************************!*\
  !*** ./node_modules/string-convert/camel2hyphen.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var camel2hyphen = function (str) {
  return str
          .replace(/[A-Z]/g, function (match) {
            return '-' + match.toLowerCase();
          })
          .toLowerCase();
};

module.exports = camel2hyphen;

/***/ }),

/***/ "./node_modules/timers-browserify/main.js":
/*!************************************************!*\
  !*** ./node_modules/timers-browserify/main.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
            (typeof self !== "undefined" && self) ||
            window;
var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(scope, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(/*! setimmediate */ "./node_modules/setimmediate/setImmediate.js");
// On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "container" }, [
      _c("h1", [_vm._v("Admin panel")]),
    ])
  },
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true&":
/*!********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("h1", [_vm._v("About")])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/Landing.vue?vue&type=template&id=15bf0008&":
/*!**********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/Landing.vue?vue&type=template&id=15bf0008& ***!
  \**********************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("h1", [_vm._v("Landing")])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponent; });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "./node_modules/vue-mq/dist/vue-mq.es.js":
/*!***********************************************!*\
  !*** ./node_modules/vue-mq/dist/vue-mq.es.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var json2mq__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! json2mq */ "./node_modules/json2mq/index.js");
/* harmony import */ var json2mq__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(json2mq__WEBPACK_IMPORTED_MODULE_0__);


function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
}

function convertBreakpointsToMediaQueries(breakpoints) {
  var keys = Object.keys(breakpoints);
  var values = keys.map(function (key) {
    return breakpoints[key];
  });
  var breakpointValues = [0].concat(_toConsumableArray(values.slice(0, -1)));
  var mediaQueries = breakpointValues.reduce(function (sum, value, index) {
    var options = Object.assign({
      minWidth: value
    }, index < keys.length - 1 ? {
      maxWidth: breakpointValues[index + 1] - 1
    } : {});
    var mediaQuery = json2mq__WEBPACK_IMPORTED_MODULE_0___default()(options);
    return Object.assign(sum, _defineProperty({}, keys[index], mediaQuery));
  }, {});
  return mediaQueries;
}
function transformValuesFromBreakpoints(breakpoints, values, currentBreakpoint) {
  var findClosestValue = function findClosestValue(currentBreakpoint) {
    if (values[currentBreakpoint] !== undefined) return values[currentBreakpoint];
    var index = breakpoints.findIndex(function (b) {
      return b === currentBreakpoint;
    });
    var newBreakpoint = index !== -1 || index !== 0 ? breakpoints[index - 1] : null;
    if (!newBreakpoint) return values[index];
    return values[newBreakpoint] !== undefined ? values[newBreakpoint] : findClosestValue(newBreakpoint);
  };

  return findClosestValue(currentBreakpoint);
}
function selectBreakpoints(breakpoints, currentBreakpoint) {
  var index = breakpoints.findIndex(function (b) {
    return b === currentBreakpoint;
  });
  return breakpoints.slice(index);
}
function subscribeToMediaQuery(mediaQuery, enter) {
  var mql = window.matchMedia(mediaQuery);

  var cb = function cb(_ref) {
    var matches = _ref.matches;
    if (matches) enter();
  };

  mql.addListener(cb); //subscribing

  cb(mql); //initial trigger
}

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

// USAGE
// mq-layout(mq="lg")
//   p I’m lg
var component = {
  props: {
    mq: {
      required: true,
      type: [String, Array]
    }
  },
  computed: {
    plusModifier: function plusModifier() {
      return !isArray(this.mq) && this.mq.slice(-1) === '+';
    },
    activeBreakpoints: function activeBreakpoints() {
      var breakpoints = Object.keys(this.$mqAvailableBreakpoints);
      var mq = this.plusModifier ? this.mq.slice(0, -1) : isArray(this.mq) ? this.mq : [this.mq];
      return this.plusModifier ? selectBreakpoints(breakpoints, mq) : mq;
    }
  },
  render: function render(h, props) {
    var shouldRenderChildren = this.activeBreakpoints.includes(this.$mq);
    return shouldRenderChildren ? h('div', this.$slots.default) : h();
  }
};

var DEFAULT_BREAKPOINT = {
  sm: 450,
  md: 1250,
  lg: Infinity
};

var install = function install(Vue) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$breakpoints = _ref.breakpoints,
      breakpoints = _ref$breakpoints === void 0 ? DEFAULT_BREAKPOINT : _ref$breakpoints,
      _ref$defaultBreakpoin = _ref.defaultBreakpoint,
      defaultBreakpoint = _ref$defaultBreakpoin === void 0 ? 'sm' : _ref$defaultBreakpoin;

  var hasSetupListeners = false; // Init reactive component

  var reactorComponent = new Vue({
    data: function data() {
      return {
        currentBreakpoint: defaultBreakpoint
      };
    }
  });
  Vue.filter('mq', function (currentBreakpoint, values) {
    return transformValuesFromBreakpoints(Object.keys(breakpoints), values, currentBreakpoint);
  });
  Vue.mixin({
    computed: {
      $mq: function $mq() {
        return reactorComponent.currentBreakpoint;
      }
    },
    created: function created() {
      if (this.$isServer) reactorComponent.currentBreakpoint = defaultBreakpoint;
    },
    mounted: function mounted() {
      if (!hasSetupListeners) {
        var mediaQueries = convertBreakpointsToMediaQueries(breakpoints); // setup listeners

        var _loop = function _loop(key) {
          var mediaQuery = mediaQueries[key];

          var enter = function enter() {
            reactorComponent.currentBreakpoint = key;
          };

          subscribeToMediaQuery(mediaQuery, enter);
        };

        for (var key in mediaQueries) {
          _loop(key);
        }

        hasSetupListeners = true;
      }
    }
  });
  Vue.prototype.$mqAvailableBreakpoints = breakpoints;
  Vue.component('MqLayout', component);
};

var index = {
  install: install
};

/* harmony default export */ __webpack_exports__["default"] = (index);


/***/ }),

/***/ "./node_modules/vue-router/dist/vue-router.esm.js":
/*!********************************************************!*\
  !*** ./node_modules/vue-router/dist/vue-router.esm.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/*!
  * vue-router v3.5.1
  * (c) 2021 Evan You
  * @license MIT
  */
/*  */

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

function warn (condition, message) {
  if ( true && !condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
  }
}

function extend (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a
}

/*  */

var encodeReserveRE = /[!'()*]/g;
var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
var commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
var encode = function (str) { return encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ','); };

function decode (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    if (true) {
      warn(false, ("Error decoding \"" + str + "\". Leaving it intact."));
    }
  }
  return str
}

function resolveQuery (
  query,
  extraQuery,
  _parseQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  var parse = _parseQuery || parseQuery;
  var parsedQuery;
  try {
    parsedQuery = parse(query || '');
  } catch (e) {
     true && warn(false, e.message);
    parsedQuery = {};
  }
  for (var key in extraQuery) {
    var value = extraQuery[key];
    parsedQuery[key] = Array.isArray(value)
      ? value.map(castQueryParamValue)
      : castQueryParamValue(value);
  }
  return parsedQuery
}

var castQueryParamValue = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };

function parseQuery (query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0 ? decode(parts.join('=')) : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res
}

function stringifyQuery (obj) {
  var res = obj
    ? Object.keys(obj)
      .map(function (key) {
        var val = obj[key];

        if (val === undefined) {
          return ''
        }

        if (val === null) {
          return encode(key)
        }

        if (Array.isArray(val)) {
          var result = [];
          val.forEach(function (val2) {
            if (val2 === undefined) {
              return
            }
            if (val2 === null) {
              result.push(encode(key));
            } else {
              result.push(encode(key) + '=' + encode(val2));
            }
          });
          return result.join('&')
        }

        return encode(key) + '=' + encode(val)
      })
      .filter(function (x) { return x.length > 0; })
      .join('&')
    : null;
  return res ? ("?" + res) : ''
}

/*  */

var trailingSlashRE = /\/?$/;

function createRoute (
  record,
  location,
  redirectedFrom,
  router
) {
  var stringifyQuery = router && router.options.stringifyQuery;

  var query = location.query || {};
  try {
    query = clone(query);
  } catch (e) {}

  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    matched: record ? formatMatch(record) : []
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
  }
  return Object.freeze(route)
}

function clone (value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    var res = {};
    for (var key in value) {
      res[key] = clone(value[key]);
    }
    return res
  } else {
    return value
  }
}

// the starting route that represents the initial state
var START = createRoute(null, {
  path: '/'
});

function formatMatch (record) {
  var res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res
}

function getFullPath (
  ref,
  _stringifyQuery
) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  var stringify = _stringifyQuery || stringifyQuery;
  return (path || '/') + stringify(query) + hash
}

function isSameRoute (a, b, onlyPath) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') && (onlyPath ||
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query))
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      (onlyPath || (
        a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params))
      )
    )
  } else {
    return false
  }
}

function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  // handle null value #1566
  if (!a || !b) { return a === b }
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key, i) {
    var aVal = a[key];
    var bKey = bKeys[i];
    if (bKey !== key) { return false }
    var bVal = b[key];
    // query values can be null and undefined
    if (aVal == null || bVal == null) { return aVal === bVal }
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}

function isIncludedRoute (current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/')
    ) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

function handleRouteEntered (route) {
  for (var i = 0; i < route.matched.length; i++) {
    var record = route.matched[i];
    for (var name in record.instances) {
      var instance = record.instances[name];
      var cbs = record.enteredCbs[name];
      if (!instance || !cbs) { continue }
      delete record.enteredCbs[name];
      for (var i$1 = 0; i$1 < cbs.length; i$1++) {
        if (!instance._isBeingDestroyed) { cbs[i$1](instance); }
      }
    }
  }
}

var View = {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render: function render (_, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    // used by devtools to display a router-view badge
    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    var h = parent.$createElement;
    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent && parent._routerRoot !== parent) {
      var vnodeData = parent.$vnode ? parent.$vnode.data : {};
      if (vnodeData.routerView) {
        depth++;
      }
      if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      var cachedData = cache[name];
      var cachedComponent = cachedData && cachedData.component;
      if (cachedComponent) {
        // #2301
        // pass props
        if (cachedData.configProps) {
          fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps);
        }
        return h(cachedComponent, data, children)
      } else {
        // render previous empty view
        return h()
      }
    }

    var matched = route.matched[depth];
    var component = matched && matched.components[name];

    // render empty node if no matched route or no config component
    if (!matched || !component) {
      cache[name] = null;
      return h()
    }

    // cache component
    cache[name] = { component: component };

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = function (vm, val) {
      // val could be undefined for unregistration
      var current = matched.instances[name];
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val;
      }
    }

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
      matched.instances[name] = vnode.componentInstance;
    };

    // register instance in init hook
    // in case kept-alive component be actived when routes changed
    data.hook.init = function (vnode) {
      if (vnode.data.keepAlive &&
        vnode.componentInstance &&
        vnode.componentInstance !== matched.instances[name]
      ) {
        matched.instances[name] = vnode.componentInstance;
      }

      // if the route transition has already been confirmed then we weren't
      // able to call the cbs during confirmation as the component was not
      // registered yet, so we call it here.
      handleRouteEntered(route);
    };

    var configProps = matched.props && matched.props[name];
    // save route and configProps in cache
    if (configProps) {
      extend(cache[name], {
        route: route,
        configProps: configProps
      });
      fillPropsinData(component, data, route, configProps);
    }

    return h(component, data, children)
  }
};

function fillPropsinData (component, data, route, configProps) {
  // resolve props
  var propsToPass = data.props = resolveProps(route, configProps);
  if (propsToPass) {
    // clone to prevent mutation
    propsToPass = data.props = extend({}, propsToPass);
    // pass non-declared props as attrs
    var attrs = data.attrs = data.attrs || {};
    for (var key in propsToPass) {
      if (!component.props || !(key in component.props)) {
        attrs[key] = propsToPass[key];
        delete propsToPass[key];
      }
    }
  }
}

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (true) {
        warn(
          false,
          "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
          "expecting an object, function or boolean."
        );
      }
  }
}

/*  */

function resolvePath (
  relative,
  base,
  append
) {
  var firstChar = relative.charAt(0);
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  var stack = base.split('/');

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '..') {
      stack.pop();
    } else if (segment !== '.') {
      stack.push(segment);
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }

  return stack.join('/')
}

function parsePath (path) {
  var hash = '';
  var query = '';

  var hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  var queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options), options)
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens, options) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}
pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/*  */

// $flow-disable-line
var regexpCompileCache = Object.create(null);

function fillParams (
  path,
  params,
  routeMsg
) {
  params = params || {};
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = pathToRegexp_1.compile(path));

    // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
    // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
    if (typeof params.pathMatch === 'string') { params[0] = params.pathMatch; }

    return filler(params, { pretty: true })
  } catch (e) {
    if (true) {
      // Fix #3072 no warn if `pathMatch` is string
      warn(typeof params.pathMatch === 'string', ("missing param for " + routeMsg + ": " + (e.message)));
    }
    return ''
  } finally {
    // delete the 0 if it was added
    delete params[0];
  }
}

/*  */

function normalizeLocation (
  raw,
  current,
  append,
  router
) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next._normalized) {
    return next
  } else if (next.name) {
    next = extend({}, raw);
    var params = next.params;
    if (params && typeof params === 'object') {
      next.params = extend({}, params);
    }
    return next
  }

  // relative params
  if (!next.path && next.params && current) {
    next = extend({}, next);
    next._normalized = true;
    var params$1 = extend(extend({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params$1;
    } else if (current.matched.length) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params$1, ("path " + (current.path)));
    } else if (true) {
      warn(false, "relative params navigation requires a current route.");
    }
    return next
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath;

  var query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  );

  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

/*  */

// work around weird flow bug
var toTypes = [String, Object];
var eventTypes = [String, Array];

var noop = function () {};

var warnedCustomSlot;
var warnedTagProp;
var warnedEventProp;

var Link = {
  name: 'RouterLink',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    custom: Boolean,
    exact: Boolean,
    exactPath: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    ariaCurrentValue: {
      type: String,
      default: 'page'
    },
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;

    var router = this.$router;
    var current = this.$route;
    var ref = router.resolve(
      this.to,
      current,
      this.append
    );
    var location = ref.location;
    var route = ref.route;
    var href = ref.href;

    var classes = {};
    var globalActiveClass = router.options.linkActiveClass;
    var globalExactActiveClass = router.options.linkExactActiveClass;
    // Support global empty active class
    var activeClassFallback =
      globalActiveClass == null ? 'router-link-active' : globalActiveClass;
    var exactActiveClassFallback =
      globalExactActiveClass == null
        ? 'router-link-exact-active'
        : globalExactActiveClass;
    var activeClass =
      this.activeClass == null ? activeClassFallback : this.activeClass;
    var exactActiveClass =
      this.exactActiveClass == null
        ? exactActiveClassFallback
        : this.exactActiveClass;

    var compareTarget = route.redirectedFrom
      ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
      : route;

    classes[exactActiveClass] = isSameRoute(current, compareTarget, this.exactPath);
    classes[activeClass] = this.exact || this.exactPath
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget);

    var ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null;

    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(location, noop);
        } else {
          router.push(location, noop);
        }
      }
    };

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) {
        on[e] = handler;
      });
    } else {
      on[this.event] = handler;
    }

    var data = { class: classes };

    var scopedSlot =
      !this.$scopedSlots.$hasNormal &&
      this.$scopedSlots.default &&
      this.$scopedSlots.default({
        href: href,
        route: route,
        navigate: handler,
        isActive: classes[activeClass],
        isExactActive: classes[exactActiveClass]
      });

    if (scopedSlot) {
      if ( true && !this.custom) {
        !warnedCustomSlot && warn(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n');
        warnedCustomSlot = true;
      }
      if (scopedSlot.length === 1) {
        return scopedSlot[0]
      } else if (scopedSlot.length > 1 || !scopedSlot.length) {
        if (true) {
          warn(
            false,
            ("<router-link> with to=\"" + (this.to) + "\" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.")
          );
        }
        return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
      }
    }

    if (true) {
      if ('tag' in this.$options.propsData && !warnedTagProp) {
        warn(
          false,
          "<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
        );
        warnedTagProp = true;
      }
      if ('event' in this.$options.propsData && !warnedEventProp) {
        warn(
          false,
          "<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
        );
        warnedEventProp = true;
      }
    }

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href: href, 'aria-current': ariaCurrentValue };
    } else {
      // find the first <a> child and apply listener and href
      var a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        var aData = (a.data = extend({}, a.data));
        aData.on = aData.on || {};
        // transform existing events in both objects into arrays so we can push later
        for (var event in aData.on) {
          var handler$1 = aData.on[event];
          if (event in on) {
            aData.on[event] = Array.isArray(handler$1) ? handler$1 : [handler$1];
          }
        }
        // append new listeners for router-link
        for (var event$1 in on) {
          if (event$1 in aData.on) {
            // on[event] is always a function
            aData.on[event$1].push(on[event$1]);
          } else {
            aData.on[event$1] = handler;
          }
        }

        var aAttrs = (a.data.attrs = extend({}, a.data.attrs));
        aAttrs.href = href;
        aAttrs['aria-current'] = ariaCurrentValue;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default)
  }
};

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) { return }
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

function findAnchor (children) {
  if (children) {
    var child;
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

var _Vue;

function install (Vue) {
  if (install.installed && _Vue === Vue) { return }
  install.installed = true;

  _Vue = Vue;

  var isDef = function (v) { return v !== undefined; };

  var registerInstance = function (vm, callVal) {
    var i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate: function beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed: function destroyed () {
      registerInstance(this);
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this._routerRoot._router }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get: function get () { return this._routerRoot._route }
  });

  Vue.component('RouterView', View);
  Vue.component('RouterLink', Link);

  var strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

/*  */

var inBrowser = typeof window !== 'undefined';

/*  */

function createRouteMap (
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap,
  parentRoute
) {
  // the path list is used to control path matching priority
  var pathList = oldPathList || [];
  // $flow-disable-line
  var pathMap = oldPathMap || Object.create(null);
  // $flow-disable-line
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathList, pathMap, nameMap, route, parentRoute);
  });

  // ensure wildcard routes are always at the end
  for (var i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l--;
      i--;
    }
  }

  if (true) {
    // warn if routes do not include leading slashes
    var found = pathList
    // check for missing leading slash
      .filter(function (path) { return path && path.charAt(0) !== '*' && path.charAt(0) !== '/'; });

    if (found.length > 0) {
      var pathNames = found.map(function (path) { return ("- " + path); }).join('\n');
      warn(false, ("Non-nested routes must include a leading slash character. Fix the following routes: \n" + pathNames));
    }
  }

  return {
    pathList: pathList,
    pathMap: pathMap,
    nameMap: nameMap
  }
}

function addRouteRecord (
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  var path = route.path;
  var name = route.name;
  if (true) {
    assert(path != null, "\"path\" is required in a route configuration.");
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(
        path || name
      )) + " cannot be a " + "string id. Use an actual component instead."
    );

    warn(
      // eslint-disable-next-line no-control-regex
      !/[^\u0000-\u007F]+/.test(path),
      "Route with path \"" + path + "\" contains unencoded characters, make sure " +
        "your path is correctly encoded before passing it to the router. Use " +
        "encodeURI to encode static segments of your path."
    );
  }

  var pathToRegexpOptions =
    route.pathToRegexpOptions || {};
  var normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict);

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  var record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    alias: route.alias
      ? typeof route.alias === 'string'
        ? [route.alias]
        : route.alias
      : [],
    instances: {},
    enteredCbs: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props:
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
  };

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (true) {
      if (
        route.name &&
        !route.redirect &&
        route.children.some(function (child) { return /^\/?$/.test(child.path); })
      ) {
        warn(
          false,
          "Named Route '" + (route.name) + "' has a default child route. " +
            "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
            "the default child route will not be rendered. Remove the name from " +
            "this route and use the name of the default child route for named " +
            "links instead."
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs
        ? cleanPath((matchAs + "/" + (child.path)))
        : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (route.alias !== undefined) {
    var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
    for (var i = 0; i < aliases.length; ++i) {
      var alias = aliases[i];
      if ( true && alias === path) {
        warn(
          false,
          ("Found an alias with the same value as the path: \"" + path + "\". You have to remove that alias. It will be ignored in development.")
        );
        // skip in dev to make it work
        continue
      }

      var aliasRoute = {
        path: alias,
        children: route.children
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      );
    }
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if ( true && !matchAs) {
      warn(
        false,
        "Duplicate named routes definition: " +
          "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

function compileRouteRegex (
  path,
  pathToRegexpOptions
) {
  var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
  if (true) {
    var keys = Object.create(null);
    regex.keys.forEach(function (key) {
      warn(
        !keys[key.name],
        ("Duplicate param keys in route with path: \"" + path + "\"")
      );
      keys[key.name] = true;
    });
  }
  return regex
}

function normalizePath (
  path,
  parent,
  strict
) {
  if (!strict) { path = path.replace(/\/$/, ''); }
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  return cleanPath(((parent.path) + "/" + path))
}

/*  */



function createMatcher (
  routes,
  router
) {
  var ref = createRouteMap(routes);
  var pathList = ref.pathList;
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap);
  }

  function addRoute (parentOrRoute, route) {
    var parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined;
    // $flow-disable-line
    createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent);

    // add aliases of parent
    if (parent) {
      createRouteMap(
        // $flow-disable-line route is defined if parent is
        parent.alias.map(function (alias) { return ({ path: alias, children: [route] }); }),
        pathList,
        pathMap,
        nameMap,
        parent
      );
    }
  }

  function getRoutes () {
    return pathList.map(function (path) { return pathMap[path]; })
  }

  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    var location = normalizeLocation(raw, currentRoute, false, router);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      if (true) {
        warn(record, ("Route with name '" + name + "' does not exist"));
      }
      if (!record) { return _createRoute(null, location) }
      var paramNames = record.regex.keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      location.params = {};
      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        var record$1 = pathMap[path];
        if (matchRoute(record$1.regex, location.path, location.params)) {
          return _createRoute(record$1, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      if (true) {
        warn(
          false, ("invalid redirect option: " + (JSON.stringify(redirect)))
        );
      }
      return _createRoute(null, location)
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      if (true) {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      if (true) {
        warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
      }
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match: match,
    addRoute: addRoute,
    getRoutes: getRoutes,
    addRoutes: addRoutes
  }
}

function matchRoute (
  regex,
  path,
  params
) {
  var m = path.match(regex);

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = regex.keys[i - 1];
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i];
    }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */

// use User Timing api (if present) for more accurate key precision
var Time =
  inBrowser && window.performance && window.performance.now
    ? window.performance
    : Date;

function genStateKey () {
  return Time.now().toFixed(3)
}

var _key = genStateKey();

function getStateKey () {
  return _key
}

function setStateKey (key) {
  return (_key = key)
}

/*  */

var positionStore = Object.create(null);

function setupScroll () {
  // Prevent browser scroll behavior on History popstate
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  // Fix for #1585 for Firefox
  // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
  // Fix for #2774 Support for apps loaded from Windows file shares not mapped to network drives: replaced location.origin with
  // window.location.protocol + '//' + window.location.host
  // location.host contains the port and location.hostname doesn't
  var protocolAndPath = window.location.protocol + '//' + window.location.host;
  var absolutePath = window.location.href.replace(protocolAndPath, '');
  // preserve existing history state as it could be overriden by the user
  var stateCopy = extend({}, window.history.state);
  stateCopy.key = getStateKey();
  window.history.replaceState(stateCopy, '', absolutePath);
  window.addEventListener('popstate', handlePopState);
  return function () {
    window.removeEventListener('popstate', handlePopState);
  }
}

function handleScroll (
  router,
  to,
  from,
  isPop
) {
  if (!router.app) {
    return
  }

  var behavior = router.options.scrollBehavior;
  if (!behavior) {
    return
  }

  if (true) {
    assert(typeof behavior === 'function', "scrollBehavior must be a function");
  }

  // wait until re-render finishes before scrolling
  router.app.$nextTick(function () {
    var position = getScrollPosition();
    var shouldScroll = behavior.call(
      router,
      to,
      from,
      isPop ? position : null
    );

    if (!shouldScroll) {
      return
    }

    if (typeof shouldScroll.then === 'function') {
      shouldScroll
        .then(function (shouldScroll) {
          scrollToPosition((shouldScroll), position);
        })
        .catch(function (err) {
          if (true) {
            assert(false, err.toString());
          }
        });
    } else {
      scrollToPosition(shouldScroll, position);
    }
  });
}

function saveScrollPosition () {
  var key = getStateKey();
  if (key) {
    positionStore[key] = {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
}

function handlePopState (e) {
  saveScrollPosition();
  if (e.state && e.state.key) {
    setStateKey(e.state.key);
  }
}

function getScrollPosition () {
  var key = getStateKey();
  if (key) {
    return positionStore[key]
  }
}

function getElementPosition (el, offset) {
  var docEl = document.documentElement;
  var docRect = docEl.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  return {
    x: elRect.left - docRect.left - offset.x,
    y: elRect.top - docRect.top - offset.y
  }
}

function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

function normalizeOffset (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : 0,
    y: isNumber(obj.y) ? obj.y : 0
  }
}

function isNumber (v) {
  return typeof v === 'number'
}

var hashStartsWithNumberRE = /^#\d/;

function scrollToPosition (shouldScroll, position) {
  var isObject = typeof shouldScroll === 'object';
  if (isObject && typeof shouldScroll.selector === 'string') {
    // getElementById would still fail if the selector contains a more complicated query like #main[data-attr]
    // but at the same time, it doesn't make much sense to select an element with an id and an extra selector
    var el = hashStartsWithNumberRE.test(shouldScroll.selector) // $flow-disable-line
      ? document.getElementById(shouldScroll.selector.slice(1)) // $flow-disable-line
      : document.querySelector(shouldScroll.selector);

    if (el) {
      var offset =
        shouldScroll.offset && typeof shouldScroll.offset === 'object'
          ? shouldScroll.offset
          : {};
      offset = normalizeOffset(offset);
      position = getElementPosition(el, offset);
    } else if (isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }
  } else if (isObject && isValidPosition(shouldScroll)) {
    position = normalizePosition(shouldScroll);
  }

  if (position) {
    // $flow-disable-line
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        left: position.x,
        top: position.y,
        // $flow-disable-line
        behavior: shouldScroll.behavior
      });
    } else {
      window.scrollTo(position.x, position.y);
    }
  }
}

/*  */

var supportsPushState =
  inBrowser &&
  (function () {
    var ua = window.navigator.userAgent;

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false
    }

    return window.history && typeof window.history.pushState === 'function'
  })();

function pushState (url, replace) {
  saveScrollPosition();
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  var history = window.history;
  try {
    if (replace) {
      // preserve existing history state as it could be overriden by the user
      var stateCopy = extend({}, history.state);
      stateCopy.key = getStateKey();
      history.replaceState(stateCopy, '', url);
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url);
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

function replaceState (url) {
  pushState(url, true);
}

/*  */

function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}

// When changing thing, also edit router.d.ts
var NavigationFailureType = {
  redirected: 2,
  aborted: 4,
  cancelled: 8,
  duplicated: 16
};

function createNavigationRedirectedError (from, to) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.redirected,
    ("Redirected when going from \"" + (from.fullPath) + "\" to \"" + (stringifyRoute(
      to
    )) + "\" via a navigation guard.")
  )
}

function createNavigationDuplicatedError (from, to) {
  var error = createRouterError(
    from,
    to,
    NavigationFailureType.duplicated,
    ("Avoided redundant navigation to current location: \"" + (from.fullPath) + "\".")
  );
  // backwards compatible with the first introduction of Errors
  error.name = 'NavigationDuplicated';
  return error
}

function createNavigationCancelledError (from, to) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.cancelled,
    ("Navigation cancelled from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" with a new navigation.")
  )
}

function createNavigationAbortedError (from, to) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.aborted,
    ("Navigation aborted from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" via a navigation guard.")
  )
}

function createRouterError (from, to, type, message) {
  var error = new Error(message);
  error._isRouter = true;
  error.from = from;
  error.to = to;
  error.type = type;

  return error
}

var propertiesToLog = ['params', 'query', 'hash'];

function stringifyRoute (to) {
  if (typeof to === 'string') { return to }
  if ('path' in to) { return to.path }
  var location = {};
  propertiesToLog.forEach(function (key) {
    if (key in to) { location[key] = to[key]; }
  });
  return JSON.stringify(location, null, 2)
}

function isError (err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

function isNavigationFailure (err, errorType) {
  return (
    isError(err) &&
    err._isRouter &&
    (errorType == null || err.type === errorType)
  )
}

/*  */

function resolveAsyncComponents (matched) {
  return function (to, from, next) {
    var hasAsync = false;
    var pending = 0;
    var error = null;

    flatMapComponents(matched, function (def, _, match, key) {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending++;

        var resolve = once(function (resolvedDef) {
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending--;
          if (pending <= 0) {
            next();
          }
        });

        var reject = once(function (reason) {
          var msg = "Failed to resolve async component " + key + ": " + reason;
           true && warn(false, msg);
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg);
            next(error);
          }
        });

        var res;
        try {
          res = def(resolve, reject);
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            var comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });

    if (!hasAsync) { next(); }
  }
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

var hasSymbol =
  typeof Symbol === 'function' &&
  typeof Symbol.toStringTag === 'symbol';

function isESModule (obj) {
  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  var called = false;
  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (called) { return }
    called = true;
    return fn.apply(this, args)
  }
}

/*  */

var History = function History (router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START;
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
  this.readyErrorCbs = [];
  this.errorCbs = [];
  this.listeners = [];
};

History.prototype.listen = function listen (cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady (cb, errorCb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
    if (errorCb) {
      this.readyErrorCbs.push(errorCb);
    }
  }
};

History.prototype.onError = function onError (errorCb) {
  this.errorCbs.push(errorCb);
};

History.prototype.transitionTo = function transitionTo (
  location,
  onComplete,
  onAbort
) {
    var this$1 = this;

  var route;
  // catch redirect option https://github.com/vuejs/vue-router/issues/3201
  try {
    route = this.router.match(location, this.current);
  } catch (e) {
    this.errorCbs.forEach(function (cb) {
      cb(e);
    });
    // Exception should still be thrown
    throw e
  }
  var prev = this.current;
  this.confirmTransition(
    route,
    function () {
      this$1.updateRoute(route);
      onComplete && onComplete(route);
      this$1.ensureURL();
      this$1.router.afterHooks.forEach(function (hook) {
        hook && hook(route, prev);
      });

      // fire ready cbs once
      if (!this$1.ready) {
        this$1.ready = true;
        this$1.readyCbs.forEach(function (cb) {
          cb(route);
        });
      }
    },
    function (err) {
      if (onAbort) {
        onAbort(err);
      }
      if (err && !this$1.ready) {
        // Initial redirection should not mark the history as ready yet
        // because it's triggered by the redirection instead
        // https://github.com/vuejs/vue-router/issues/3225
        // https://github.com/vuejs/vue-router/issues/3331
        if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
          this$1.ready = true;
          this$1.readyErrorCbs.forEach(function (cb) {
            cb(err);
          });
        }
      }
    }
  );
};

History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
    var this$1 = this;

  var current = this.current;
  this.pending = route;
  var abort = function (err) {
    // changed after adding errors with
    // https://github.com/vuejs/vue-router/pull/3047 before that change,
    // redirect and aborted navigation would produce an err == null
    if (!isNavigationFailure(err) && isError(err)) {
      if (this$1.errorCbs.length) {
        this$1.errorCbs.forEach(function (cb) {
          cb(err);
        });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  var lastRouteIndex = route.matched.length - 1;
  var lastCurrentIndex = current.matched.length - 1;
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    lastRouteIndex === lastCurrentIndex &&
    route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
  ) {
    this.ensureURL();
    return abort(createNavigationDuplicatedError(current, route))
  }

  var ref = resolveQueue(
    this.current.matched,
    route.matched
  );
    var updated = ref.updated;
    var deactivated = ref.deactivated;
    var activated = ref.activated;

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated),
    // global before hooks
    this.router.beforeHooks,
    // in-component update hooks
    extractUpdateHooks(updated),
    // in-config enter guards
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    resolveAsyncComponents(activated)
  );

  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort(createNavigationCancelledError(current, route))
    }
    try {
      hook(route, current, function (to) {
        if (to === false) {
          // next(false) -> abort navigation, ensure current URL
          this$1.ensureURL(true);
          abort(createNavigationAbortedError(current, route));
        } else if (isError(to)) {
          this$1.ensureURL(true);
          abort(to);
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' &&
            (typeof to.path === 'string' || typeof to.name === 'string'))
        ) {
          // next('/') or next({ path: '/' }) -> redirect
          abort(createNavigationRedirectedError(current, route));
          if (typeof to === 'object' && to.replace) {
            this$1.replace(to);
          } else {
            this$1.push(to);
          }
        } else {
          // confirm transition and pass on the value
          next(to);
        }
      });
    } catch (e) {
      abort(e);
    }
  };

  runQueue(queue, iterator, function () {
    // wait until async components are resolved before
    // extracting in-component enter guards
    var enterGuards = extractEnterGuards(activated);
    var queue = enterGuards.concat(this$1.router.resolveHooks);
    runQueue(queue, iterator, function () {
      if (this$1.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          handleRouteEntered(route);
        });
      }
    });
  });
};

History.prototype.updateRoute = function updateRoute (route) {
  this.current = route;
  this.cb && this.cb(route);
};

History.prototype.setupListeners = function setupListeners () {
  // Default implementation is empty
};

History.prototype.teardown = function teardown () {
  // clean up event listeners
  // https://github.com/vuejs/vue-router/issues/2341
  this.listeners.forEach(function (cleanupListener) {
    cleanupListener();
  });
  this.listeners = [];

  // reset current history route
  // https://github.com/vuejs/vue-router/issues/3294
  this.current = START;
  this.pending = null;
};

function normalizeBase (base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      // strip full URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '')
}

function resolveQueue (
  current,
  next
) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

function extractGuards (
  records,
  name,
  bind,
  reverse
) {
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
        : bind(guard, instance, match, key)
    }
  });
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  return def.options[key]
}

function extractLeaveGuards (deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks (updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard (guard, instance) {
  if (instance) {
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}

function extractEnterGuards (
  activated
) {
  return extractGuards(
    activated,
    'beforeRouteEnter',
    function (guard, _, match, key) {
      return bindEnterGuard(guard, match, key)
    }
  )
}

function bindEnterGuard (
  guard,
  match,
  key
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      if (typeof cb === 'function') {
        if (!match.enteredCbs[key]) {
          match.enteredCbs[key] = [];
        }
        match.enteredCbs[key].push(cb);
      }
      next(cb);
    })
  }
}

/*  */

var HTML5History = /*@__PURE__*/(function (History) {
  function HTML5History (router, base) {
    History.call(this, router, base);

    this._startLocation = getLocation(this.base);
  }

  if ( History ) HTML5History.__proto__ = History;
  HTML5History.prototype = Object.create( History && History.prototype );
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    if (this.listeners.length > 0) {
      return
    }

    var router = this.router;
    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      this.listeners.push(setupScroll());
    }

    var handleRoutingEvent = function () {
      var current = this$1.current;

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      var location = getLocation(this$1.base);
      if (this$1.current === START && location === this$1._startLocation) {
        return
      }

      this$1.transitionTo(location, function (route) {
        if (supportsScroll) {
          handleScroll(router, route, current, true);
        }
      });
    };
    window.addEventListener('popstate', handleRoutingEvent);
    this.listeners.push(function () {
      window.removeEventListener('popstate', handleRoutingEvent);
    });
  };

  HTML5History.prototype.go = function go (n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.ensureURL = function ensureURL (push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
    return getLocation(this.base)
  };

  return HTML5History;
}(History));

function getLocation (base) {
  var path = window.location.pathname;
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length);
  }
  return (path || '/') + window.location.search + window.location.hash
}

/*  */

var HashHistory = /*@__PURE__*/(function (History) {
  function HashHistory (router, base, fallback) {
    History.call(this, router, base);
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash();
  }

  if ( History ) HashHistory.__proto__ = History;
  HashHistory.prototype = Object.create( History && History.prototype );
  HashHistory.prototype.constructor = HashHistory;

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  HashHistory.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    if (this.listeners.length > 0) {
      return
    }

    var router = this.router;
    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      this.listeners.push(setupScroll());
    }

    var handleRoutingEvent = function () {
      var current = this$1.current;
      if (!ensureSlash()) {
        return
      }
      this$1.transitionTo(getHash(), function (route) {
        if (supportsScroll) {
          handleScroll(this$1.router, route, current, true);
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath);
        }
      });
    };
    var eventType = supportsPushState ? 'popstate' : 'hashchange';
    window.addEventListener(
      eventType,
      handleRoutingEvent
    );
    this.listeners.push(function () {
      window.removeEventListener(eventType, handleRoutingEvent);
    });
  };

  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(
      location,
      function (route) {
        pushHash(route.fullPath);
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(
      location,
      function (route) {
        replaceHash(route.fullPath);
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  HashHistory.prototype.go = function go (n) {
    window.history.go(n);
  };

  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath;
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current);
    }
  };

  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    return getHash()
  };

  return HashHistory;
}(History));

function checkFallback (base) {
  var location = getLocation(base);
  if (!/^\/#/.test(location)) {
    window.location.replace(cleanPath(base + '/#' + location));
    return true
  }
}

function ensureSlash () {
  var path = getHash();
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path);
  return false
}

function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var index = href.indexOf('#');
  // empty path
  if (index < 0) { return '' }

  href = href.slice(index + 1);

  return href
}

function getUrl (path) {
  var href = window.location.href;
  var i = href.indexOf('#');
  var base = i >= 0 ? href.slice(0, i) : href;
  return (base + "#" + path)
}

function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path));
  } else {
    window.location.hash = path;
  }
}

function replaceHash (path) {
  if (supportsPushState) {
    replaceState(getUrl(path));
  } else {
    window.location.replace(getUrl(path));
  }
}

/*  */

var AbstractHistory = /*@__PURE__*/(function (History) {
  function AbstractHistory (router, base) {
    History.call(this, router, base);
    this.stack = [];
    this.index = -1;
  }

  if ( History ) AbstractHistory.__proto__ = History;
  AbstractHistory.prototype = Object.create( History && History.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(
      location,
      function (route) {
        this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
        this$1.index++;
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(
      location,
      function (route) {
        this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex];
    this.confirmTransition(
      route,
      function () {
        var prev = this$1.current;
        this$1.index = targetIndex;
        this$1.updateRoute(route);
        this$1.router.afterHooks.forEach(function (hook) {
          hook && hook(route, prev);
        });
      },
      function (err) {
        if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
          this$1.index = targetIndex;
        }
      }
    );
  };

  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    var current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/'
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };

  return AbstractHistory;
}(History));

/*  */

var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || [], this);

  var mode = options.mode || 'hash';
  this.fallback =
    mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (true) {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

var prototypeAccessors = { currentRoute: { configurable: true } };

VueRouter.prototype.match = function match (raw, current, redirectedFrom) {
  return this.matcher.match(raw, current, redirectedFrom)
};

prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

VueRouter.prototype.init = function init (app /* Vue component instance */) {
    var this$1 = this;

   true &&
    assert(
      install.installed,
      "not installed. Make sure to call `Vue.use(VueRouter)` " +
        "before creating root instance."
    );

  this.apps.push(app);

  // set up app destroyed handler
  // https://github.com/vuejs/vue-router/issues/2639
  app.$once('hook:destroyed', function () {
    // clean out app from this.apps array once destroyed
    var index = this$1.apps.indexOf(app);
    if (index > -1) { this$1.apps.splice(index, 1); }
    // ensure we still have a main app or null if no apps
    // we do not release the router so it can be reused
    if (this$1.app === app) { this$1.app = this$1.apps[0] || null; }

    if (!this$1.app) { this$1.history.teardown(); }
  });

  // main app previously initialized
  // return as we don't need to set up new history listener
  if (this.app) {
    return
  }

  this.app = app;

  var history = this.history;

  if (history instanceof HTML5History || history instanceof HashHistory) {
    var handleInitialScroll = function (routeOrError) {
      var from = history.current;
      var expectScroll = this$1.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll && 'fullPath' in routeOrError) {
        handleScroll(this$1, routeOrError, from, false);
      }
    };
    var setupListeners = function (routeOrError) {
      history.setupListeners();
      handleInitialScroll(routeOrError);
    };
    history.transitionTo(
      history.getCurrentLocation(),
      setupListeners,
      setupListeners
    );
  }

  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};

VueRouter.prototype.beforeEach = function beforeEach (fn) {
  return registerHook(this.beforeHooks, fn)
};

VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
  return registerHook(this.resolveHooks, fn)
};

VueRouter.prototype.afterEach = function afterEach (fn) {
  return registerHook(this.afterHooks, fn)
};

VueRouter.prototype.onReady = function onReady (cb, errorCb) {
  this.history.onReady(cb, errorCb);
};

VueRouter.prototype.onError = function onError (errorCb) {
  this.history.onError(errorCb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

  // $flow-disable-line
  if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
    return new Promise(function (resolve, reject) {
      this$1.history.push(location, resolve, reject);
    })
  } else {
    this.history.push(location, onComplete, onAbort);
  }
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

  // $flow-disable-line
  if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
    return new Promise(function (resolve, reject) {
      this$1.history.replace(location, resolve, reject);
    })
  } else {
    this.history.replace(location, onComplete, onAbort);
  }
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};

VueRouter.prototype.back = function back () {
  this.go(-1);
};

VueRouter.prototype.forward = function forward () {
  this.go(1);
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? to.matched
      ? to
      : this.resolve(to).route
    : this.currentRoute;
  if (!route) {
    return []
  }
  return [].concat.apply(
    [],
    route.matched.map(function (m) {
      return Object.keys(m.components).map(function (key) {
        return m.components[key]
      })
    })
  )
};

VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  current = current || this.history.current;
  var location = normalizeLocation(to, current, append, this);
  var route = this.match(location, current);
  var fullPath = route.redirectedFrom || route.fullPath;
  var base = this.history.base;
  var href = createHref(base, fullPath, this.mode);
  return {
    location: location,
    route: route,
    href: href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
};

VueRouter.prototype.getRoutes = function getRoutes () {
  return this.matcher.getRoutes()
};

VueRouter.prototype.addRoute = function addRoute (parentOrRoute, route) {
  this.matcher.addRoute(parentOrRoute, route);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

VueRouter.prototype.addRoutes = function addRoutes (routes) {
  if (true) {
    warn(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.');
  }
  this.matcher.addRoutes(routes);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

Object.defineProperties( VueRouter.prototype, prototypeAccessors );

function registerHook (list, fn) {
  list.push(fn);
  return function () {
    var i = list.indexOf(fn);
    if (i > -1) { list.splice(i, 1); }
  }
}

function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath;
  return base ? cleanPath(base + '/' + path) : path
}

VueRouter.install = install;
VueRouter.version = '3.5.1';
VueRouter.isNavigationFailure = isNavigationFailure;
VueRouter.NavigationFailureType = NavigationFailureType;
VueRouter.START_LOCATION = START;

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}

/* harmony default export */ __webpack_exports__["default"] = (VueRouter);


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./resources/css/app.css":
/*!*******************************!*\
  !*** ./resources/css/app.css ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./resources/css/styles.css":
/*!**********************************!*\
  !*** ./resources/css/styles.css ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./resources/js/admin/Dashboard.vue":
/*!******************************************!*\
  !*** ./resources/js/admin/Dashboard.vue ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dashboard.vue?vue&type=template&id=af0944b4&scoped=true& */ "./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true&");
/* harmony import */ var _Dashboard_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Dashboard.vue?vue&type=script&lang=js& */ "./resources/js/admin/Dashboard.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _Dashboard_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "af0944b4",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/admin/Dashboard.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./resources/js/admin/Dashboard.vue?vue&type=script&lang=js&":
/*!*******************************************************************!*\
  !*** ./resources/js/admin/Dashboard.vue?vue&type=script&lang=js& ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Dashboard_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib??ref--4-0!../../../node_modules/vue-loader/lib??vue-loader-options!./Dashboard.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/admin/Dashboard.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Dashboard_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true&":
/*!*************************************************************************************!*\
  !*** ./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true& ***!
  \*************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib??vue-loader-options!./Dashboard.vue?vue&type=template&id=af0944b4&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/admin/Dashboard.vue?vue&type=template&id=af0944b4&scoped=true&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Dashboard_vue_vue_type_template_id_af0944b4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./resources/js/app.js":
/*!*****************************!*\
  !*** ./resources/js/app.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.common.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vue_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-router */ "./node_modules/vue-router/dist/vue-router.esm.js");
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./router */ "./resources/js/router/index.js");
/* harmony import */ var vue_mq__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vue-mq */ "./node_modules/vue-mq/dist/vue-mq.es.js");
__webpack_require__(/*! ./bootstrap */ "./resources/js/bootstrap.js");





vue__WEBPACK_IMPORTED_MODULE_0___default.a.use(vue_router__WEBPACK_IMPORTED_MODULE_1__["default"]).use(vue_mq__WEBPACK_IMPORTED_MODULE_3__["default"], {
  breakpoints: {
    tablet: 992,
    laptop: 1280,
    desktop: Infinity
  }
});
var app = new vue__WEBPACK_IMPORTED_MODULE_0___default.a({
  el: '#app',
  router: _router__WEBPACK_IMPORTED_MODULE_2__["default"],
  created: function created() {
    console.log('created from app.js');
  }
});

/***/ }),

/***/ "./resources/js/bootstrap.js":
/*!***********************************!*\
  !*** ./resources/js/bootstrap.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */
window.axios = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */
// import Echo from 'laravel-echo';
// window.Pusher = require('pusher-js');
// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     forceTLS: true
// });

/***/ }),

/***/ "./resources/js/components/About.vue":
/*!*******************************************!*\
  !*** ./resources/js/components/About.vue ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./About.vue?vue&type=template&id=fb05e49c&scoped=true& */ "./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true&");
/* harmony import */ var _About_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./About.vue?vue&type=script&lang=js& */ "./resources/js/components/About.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _About_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "fb05e49c",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/components/About.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./resources/js/components/About.vue?vue&type=script&lang=js&":
/*!********************************************************************!*\
  !*** ./resources/js/components/About.vue?vue&type=script&lang=js& ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_About_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib??ref--4-0!../../../node_modules/vue-loader/lib??vue-loader-options!./About.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/About.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_About_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true&":
/*!**************************************************************************************!*\
  !*** ./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true& ***!
  \**************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib??vue-loader-options!./About.vue?vue&type=template&id=fb05e49c&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/About.vue?vue&type=template&id=fb05e49c&scoped=true&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_About_vue_vue_type_template_id_fb05e49c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./resources/js/components/Landing.vue":
/*!*********************************************!*\
  !*** ./resources/js/components/Landing.vue ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Landing.vue?vue&type=template&id=15bf0008& */ "./resources/js/components/Landing.vue?vue&type=template&id=15bf0008&");
/* harmony import */ var _Landing_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Landing.vue?vue&type=script&lang=js& */ "./resources/js/components/Landing.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _Landing_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__["render"],
  _Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/components/Landing.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./resources/js/components/Landing.vue?vue&type=script&lang=js&":
/*!**********************************************************************!*\
  !*** ./resources/js/components/Landing.vue?vue&type=script&lang=js& ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Landing_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib??ref--4-0!../../../node_modules/vue-loader/lib??vue-loader-options!./Landing.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/Landing.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Landing_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./resources/js/components/Landing.vue?vue&type=template&id=15bf0008&":
/*!****************************************************************************!*\
  !*** ./resources/js/components/Landing.vue?vue&type=template&id=15bf0008& ***!
  \****************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib??vue-loader-options!./Landing.vue?vue&type=template&id=15bf0008& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/Landing.vue?vue&type=template&id=15bf0008&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Landing_vue_vue_type_template_id_15bf0008___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./resources/js/router/index.js":
/*!**************************************!*\
  !*** ./resources/js/router/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue-router */ "./node_modules/vue-router/dist/vue-router.esm.js");
/* harmony import */ var _components_Landing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Landing */ "./resources/js/components/Landing.vue");
/* harmony import */ var _components_About__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/About */ "./resources/js/components/About.vue");
/* harmony import */ var _admin_Dashboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../admin/Dashboard */ "./resources/js/admin/Dashboard.vue");




var routes = [{
  path: '/',
  component: _components_Landing__WEBPACK_IMPORTED_MODULE_1__["default"],
  name: "landing"
}, {
  path: '/about',
  component: _components_About__WEBPACK_IMPORTED_MODULE_2__["default"],
  name: "about"
}, {
  path: '/admin',
  component: _admin_Dashboard__WEBPACK_IMPORTED_MODULE_3__["default"],
  name: "dashboard"
}];
var router = new vue_router__WEBPACK_IMPORTED_MODULE_0__["default"]({
  routes: routes,
  mode: "history"
});
/* harmony default export */ __webpack_exports__["default"] = (router);

/***/ }),

/***/ 0:
/*!**************************************************************************************!*\
  !*** multi ./resources/js/app.js ./resources/css/app.css ./resources/css/styles.css ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/mac/Projects/mikhailovsky/resources/js/app.js */"./resources/js/app.js");
__webpack_require__(/*! /Users/mac/Projects/mikhailovsky/resources/css/app.css */"./resources/css/app.css");
module.exports = __webpack_require__(/*! /Users/mac/Projects/mikhailovsky/resources/css/styles.css */"./resources/css/styles.css");


/***/ })

},[[0,"/js/manifest","/js/vendor"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9qcy9hZG1pbi9EYXNoYm9hcmQudnVlIiwid2VicGFjazovLy9yZXNvdXJjZXMvanMvY29tcG9uZW50cy9BYm91dC52dWUiLCJ3ZWJwYWNrOi8vL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL0xhbmRpbmcudnVlIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uMm1xL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0cmluZy1jb252ZXJ0L2NhbWVsMmh5cGhlbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvYWRtaW4vRGFzaGJvYXJkLnZ1ZT81YjVjIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL0Fib3V0LnZ1ZT84ZjZkIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL0xhbmRpbmcudnVlPzM1OTAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3J1bnRpbWUvY29tcG9uZW50Tm9ybWFsaXplci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdnVlLW1xL2Rpc3QvdnVlLW1xLmVzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92dWUtcm91dGVyL2Rpc3QvdnVlLXJvdXRlci5lc20uanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvY3NzL2FwcC5jc3M/NzJlNSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvY3NzL3N0eWxlcy5jc3M/MDY0ZiIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvYWRtaW4vRGFzaGJvYXJkLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvYWRtaW4vRGFzaGJvYXJkLnZ1ZT83ZDkyIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9hZG1pbi9EYXNoYm9hcmQudnVlP2Y0YTEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL0Fib3V0LnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29tcG9uZW50cy9BYm91dC52dWU/ZDBkNiIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29tcG9uZW50cy9BYm91dC52dWU/NDQ5MyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29tcG9uZW50cy9MYW5kaW5nLnZ1ZSIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29tcG9uZW50cy9MYW5kaW5nLnZ1ZT8yZTVmIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL0xhbmRpbmcudnVlP2NmZWYiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3JvdXRlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiVnVlIiwidXNlIiwiVnVlUm91dGVyIiwiVnVlTXEiLCJicmVha3BvaW50cyIsInRhYmxldCIsImxhcHRvcCIsImRlc2t0b3AiLCJJbmZpbml0eSIsImFwcCIsImVsIiwicm91dGVyIiwiY3JlYXRlZCIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJheGlvcyIsImRlZmF1bHRzIiwiaGVhZGVycyIsImNvbW1vbiIsInJvdXRlcyIsInBhdGgiLCJjb21wb25lbnQiLCJMYW5kaW5nIiwibmFtZSIsIkFib3V0IiwiRGFzaGJvYXJkIiwibW9kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaUJBQWlCLG1CQUFPLENBQUMsc0RBQWEsRTs7Ozs7Ozs7Ozs7O0FDQXpCOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxhQUFhLG1CQUFPLENBQUMsaUVBQWtCO0FBQ3ZDLGNBQWMsbUJBQU8sQ0FBQyx5RUFBc0I7QUFDNUMsZUFBZSxtQkFBTyxDQUFDLDJFQUF1QjtBQUM5QyxvQkFBb0IsbUJBQU8sQ0FBQyw2RUFBdUI7QUFDbkQs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JWQTtBQUNBO0FBREEsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBO0FBREEsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBREEsRzs7Ozs7Ozs7Ozs7QUNMQSxtQkFBbUIsbUJBQU8sQ0FBQyxrRkFBNkI7O0FBRXhEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEseUI7Ozs7Ozs7Ozs7O0FDbERBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFVBQVU7Ozs7Ozs7Ozs7OztBQ3ZMdEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGlCQUFpQjtBQUN0QztBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMENBQTBDLHNCQUFzQixFQUFFO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7O0FDekxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUEsOEI7Ozs7Ozs7Ozs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLG1CQUFPLENBQUMsaUVBQWM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQzlEQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLDJCQUEyQjtBQUNqRDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDaEJBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDUEE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUNQQTtBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNqR0E7QUFBQTtBQUFBO0FBQThCOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFD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QUNBLEtBQUs7QUFDTDtBQUNBLHFCQUFxQixxQkFBcUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBLFVBQVUsSUFBcUM7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLElBQXFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxVQUFVLElBQXFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQSxpQ0FBaUMsU0FBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTSxJQUFxQztBQUMzQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxjQUFjLElBQXFDO0FBQ25EO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLHNCQUFzQixFQUFFO0FBQ3hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLFlBQVk7QUFDNUM7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQywwQ0FBMEMsRUFBRTtBQUNsRjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCOztBQUVsQjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtB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QUNBek07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBc0Y7QUFDM0I7QUFDTDs7O0FBR3REO0FBQzZGO0FBQzdGLGdCQUFnQiwyR0FBVTtBQUMxQixFQUFFLDZFQUFNO0FBQ1IsRUFBRSxrRkFBTTtBQUNSLEVBQUUsMkZBQWU7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxJQUFJLEtBQVUsRUFBRSxZQWlCZjtBQUNEO0FBQ2UsZ0Y7Ozs7Ozs7Ozs7OztBQ3RDZjtBQUFBO0FBQUEsd0NBQXVMLENBQWdCLG1QQUFHLEVBQUMsQzs7Ozs7Ozs7Ozs7O0FDQTNNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUdBLElBQU1DLE1BQU0sR0FBRyxDQUNYO0FBQ0lDLE1BQUksRUFBRSxHQURWO0FBRUlDLFdBQVMsRUFBRUMsMkRBRmY7QUFHSUMsTUFBSSxFQUFFO0FBSFYsQ0FEVyxFQU1YO0FBQ0lILE1BQUksRUFBRSxRQURWO0FBRUlDLFdBQVMsRUFBRUcseURBRmY7QUFHSUQsTUFBSSxFQUFFO0FBSFYsQ0FOVyxFQVlYO0FBQ0lILE1BQUksRUFBRSxRQURWO0FBRUlDLFdBQVMsRUFBRUksd0RBRmY7QUFHSUYsTUFBSSxFQUFFO0FBSFYsQ0FaVyxDQUFmO0FBbUJBLElBQU1iLE1BQU0sR0FBRyxJQUFJVCxrREFBSixDQUFjO0FBQ3pCa0IsUUFBTSxFQUFOQSxNQUR5QjtBQUV6Qk8sTUFBSSxFQUFFO0FBRm1CLENBQWQsQ0FBZjtBQUtlaEIscUVBQWYsRSIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgY29uZmlnLnRyYW5zaXRpb25hbCAmJiBjb25maWcudHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiPHRlbXBsYXRlPlxuICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgPGgxPkFkbWluIHBhbmVsPC9oMT5cbiAgICA8L2Rpdj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogXCJEYXNoYm9hcmRcIlxufVxuPC9zY3JpcHQ+XG5cbjxzdHlsZSBzY29wZWQ+XG5cbjwvc3R5bGU+XG4iLCI8dGVtcGxhdGU+XG4gICAgPGgxPkFib3V0PC9oMT5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogXCJBYm91dFwiXG59XG48L3NjcmlwdD5cblxuPHN0eWxlIHNjb3BlZD5cblxuPC9zdHlsZT5cbiIsIjx0ZW1wbGF0ZT5cbiAgICA8aDE+TGFuZGluZzwvaDE+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6IFwiTGFuZGluZ1wiXG59XG48L3NjcmlwdD5cblxuIiwidmFyIGNhbWVsMmh5cGhlbiA9IHJlcXVpcmUoJ3N0cmluZy1jb252ZXJ0L2NhbWVsMmh5cGhlbicpO1xuXG52YXIgaXNEaW1lbnNpb24gPSBmdW5jdGlvbiAoZmVhdHVyZSkge1xuICB2YXIgcmUgPSAvW2hlaWdodHx3aWR0aF0kLztcbiAgcmV0dXJuIHJlLnRlc3QoZmVhdHVyZSk7XG59O1xuXG52YXIgb2JqMm1xID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgbXEgPSAnJztcbiAgdmFyIGZlYXR1cmVzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgZmVhdHVyZXMuZm9yRWFjaChmdW5jdGlvbiAoZmVhdHVyZSwgaW5kZXgpIHtcbiAgICB2YXIgdmFsdWUgPSBvYmpbZmVhdHVyZV07XG4gICAgZmVhdHVyZSA9IGNhbWVsMmh5cGhlbihmZWF0dXJlKTtcbiAgICAvLyBBZGQgcHggdG8gZGltZW5zaW9uIGZlYXR1cmVzXG4gICAgaWYgKGlzRGltZW5zaW9uKGZlYXR1cmUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUgKyAncHgnO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgIG1xICs9IGZlYXR1cmU7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIG1xICs9ICdub3QgJyArIGZlYXR1cmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1xICs9ICcoJyArIGZlYXR1cmUgKyAnOiAnICsgdmFsdWUgKyAnKSc7XG4gICAgfVxuICAgIGlmIChpbmRleCA8IGZlYXR1cmVzLmxlbmd0aC0xKSB7XG4gICAgICBtcSArPSAnIGFuZCAnXG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1xO1xufTtcblxudmFyIGpzb24ybXEgPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgdmFyIG1xID0gJyc7XG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9XG4gIC8vIEhhbmRsaW5nIGFycmF5IG9mIG1lZGlhIHF1ZXJpZXNcbiAgaWYgKHF1ZXJ5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBxdWVyeS5mb3JFYWNoKGZ1bmN0aW9uIChxLCBpbmRleCkge1xuICAgICAgbXEgKz0gb2JqMm1xKHEpO1xuICAgICAgaWYgKGluZGV4IDwgcXVlcnkubGVuZ3RoLTEpIHtcbiAgICAgICAgbXEgKz0gJywgJ1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtcTtcbiAgfVxuICAvLyBIYW5kbGluZyBzaW5nbGUgbWVkaWEgcXVlcnlcbiAgcmV0dXJuIG9iajJtcShxdWVyeSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpzb24ybXE7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmIChnbG9iYWwuc2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmV4dEhhbmRsZSA9IDE7IC8vIFNwZWMgc2F5cyBncmVhdGVyIHRoYW4gemVyb1xuICAgIHZhciB0YXNrc0J5SGFuZGxlID0ge307XG4gICAgdmFyIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IGZhbHNlO1xuICAgIHZhciBkb2MgPSBnbG9iYWwuZG9jdW1lbnQ7XG4gICAgdmFyIHJlZ2lzdGVySW1tZWRpYXRlO1xuXG4gICAgZnVuY3Rpb24gc2V0SW1tZWRpYXRlKGNhbGxiYWNrKSB7XG4gICAgICAvLyBDYWxsYmFjayBjYW4gZWl0aGVyIGJlIGEgZnVuY3Rpb24gb3IgYSBzdHJpbmdcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbihcIlwiICsgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgLy8gQ29weSBmdW5jdGlvbiBhcmd1bWVudHNcbiAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDFdO1xuICAgICAgfVxuICAgICAgLy8gU3RvcmUgYW5kIHJlZ2lzdGVyIHRoZSB0YXNrXG4gICAgICB2YXIgdGFzayA9IHsgY2FsbGJhY2s6IGNhbGxiYWNrLCBhcmdzOiBhcmdzIH07XG4gICAgICB0YXNrc0J5SGFuZGxlW25leHRIYW5kbGVdID0gdGFzaztcbiAgICAgIHJlZ2lzdGVySW1tZWRpYXRlKG5leHRIYW5kbGUpO1xuICAgICAgcmV0dXJuIG5leHRIYW5kbGUrKztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShoYW5kbGUpIHtcbiAgICAgICAgZGVsZXRlIHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW4odGFzaykge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSB0YXNrLmNhbGxiYWNrO1xuICAgICAgICB2YXIgYXJncyA9IHRhc2suYXJncztcbiAgICAgICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGNhbGxiYWNrKGFyZ3NbMF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGNhbGxiYWNrKGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhbGxiYWNrKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW5JZlByZXNlbnQoaGFuZGxlKSB7XG4gICAgICAgIC8vIEZyb20gdGhlIHNwZWM6IFwiV2FpdCB1bnRpbCBhbnkgaW52b2NhdGlvbnMgb2YgdGhpcyBhbGdvcml0aG0gc3RhcnRlZCBiZWZvcmUgdGhpcyBvbmUgaGF2ZSBjb21wbGV0ZWQuXCJcbiAgICAgICAgLy8gU28gaWYgd2UncmUgY3VycmVudGx5IHJ1bm5pbmcgYSB0YXNrLCB3ZSdsbCBuZWVkIHRvIGRlbGF5IHRoaXMgaW52b2NhdGlvbi5cbiAgICAgICAgaWYgKGN1cnJlbnRseVJ1bm5pbmdBVGFzaykge1xuICAgICAgICAgICAgLy8gRGVsYXkgYnkgZG9pbmcgYSBzZXRUaW1lb3V0LiBzZXRJbW1lZGlhdGUgd2FzIHRyaWVkIGluc3RlYWQsIGJ1dCBpbiBGaXJlZm94IDcgaXQgZ2VuZXJhdGVkIGFcbiAgICAgICAgICAgIC8vIFwidG9vIG11Y2ggcmVjdXJzaW9uXCIgZXJyb3IuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bklmUHJlc2VudCwgMCwgaGFuZGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bih0YXNrKTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckltbWVkaWF0ZShoYW5kbGUpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkgeyBydW5JZlByZXNlbnQoaGFuZGxlKTsgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuVXNlUG9zdE1lc3NhZ2UoKSB7XG4gICAgICAgIC8vIFRoZSB0ZXN0IGFnYWluc3QgYGltcG9ydFNjcmlwdHNgIHByZXZlbnRzIHRoaXMgaW1wbGVtZW50YXRpb24gZnJvbSBiZWluZyBpbnN0YWxsZWQgaW5zaWRlIGEgd2ViIHdvcmtlcixcbiAgICAgICAgLy8gd2hlcmUgYGdsb2JhbC5wb3N0TWVzc2FnZWAgbWVhbnMgc29tZXRoaW5nIGNvbXBsZXRlbHkgZGlmZmVyZW50IGFuZCBjYW4ndCBiZSB1c2VkIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgICAgIGlmIChnbG9iYWwucG9zdE1lc3NhZ2UgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKSB7XG4gICAgICAgICAgICB2YXIgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IHRydWU7XG4gICAgICAgICAgICB2YXIgb2xkT25NZXNzYWdlID0gZ2xvYmFsLm9ubWVzc2FnZTtcbiAgICAgICAgICAgIGdsb2JhbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKFwiXCIsIFwiKlwiKTtcbiAgICAgICAgICAgIGdsb2JhbC5vbm1lc3NhZ2UgPSBvbGRPbk1lc3NhZ2U7XG4gICAgICAgICAgICByZXR1cm4gcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxQb3N0TWVzc2FnZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICAvLyBJbnN0YWxscyBhbiBldmVudCBoYW5kbGVyIG9uIGBnbG9iYWxgIGZvciB0aGUgYG1lc3NhZ2VgIGV2ZW50OiBzZWVcbiAgICAgICAgLy8gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9ET00vd2luZG93LnBvc3RNZXNzYWdlXG4gICAgICAgIC8vICogaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvY29tbXMuaHRtbCNjcm9zc0RvY3VtZW50TWVzc2FnZXNcblxuICAgICAgICB2YXIgbWVzc2FnZVByZWZpeCA9IFwic2V0SW1tZWRpYXRlJFwiICsgTWF0aC5yYW5kb20oKSArIFwiJFwiO1xuICAgICAgICB2YXIgb25HbG9iYWxNZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGdsb2JhbCAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBldmVudC5kYXRhID09PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICAgICAgZXZlbnQuZGF0YS5pbmRleE9mKG1lc3NhZ2VQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcnVuSWZQcmVzZW50KCtldmVudC5kYXRhLnNsaWNlKG1lc3NhZ2VQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25HbG9iYWxNZXNzYWdlLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbG9iYWwuYXR0YWNoRXZlbnQoXCJvbm1lc3NhZ2VcIiwgb25HbG9iYWxNZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UobWVzc2FnZVByZWZpeCArIGhhbmRsZSwgXCIqXCIpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlID0gZXZlbnQuZGF0YTtcbiAgICAgICAgICAgIHJ1bklmUHJlc2VudChoYW5kbGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKGhhbmRsZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFJlYWR5U3RhdGVDaGFuZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgPHNjcmlwdD4gZWxlbWVudDsgaXRzIHJlYWR5c3RhdGVjaGFuZ2UgZXZlbnQgd2lsbCBiZSBmaXJlZCBhc3luY2hyb25vdXNseSBvbmNlIGl0IGlzIGluc2VydGVkXG4gICAgICAgICAgICAvLyBpbnRvIHRoZSBkb2N1bWVudC4gRG8gc28sIHRodXMgcXVldWluZyB1cCB0aGUgdGFzay4gUmVtZW1iZXIgdG8gY2xlYW4gdXAgb25jZSBpdCdzIGJlZW4gY2FsbGVkLlxuICAgICAgICAgICAgdmFyIHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgc2NyaXB0ID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBodG1sLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQocnVuSWZQcmVzZW50LCAwLCBoYW5kbGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIElmIHN1cHBvcnRlZCwgd2Ugc2hvdWxkIGF0dGFjaCB0byB0aGUgcHJvdG90eXBlIG9mIGdsb2JhbCwgc2luY2UgdGhhdCBpcyB3aGVyZSBzZXRUaW1lb3V0IGV0IGFsLiBsaXZlLlxuICAgIHZhciBhdHRhY2hUbyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2xvYmFsKTtcbiAgICBhdHRhY2hUbyA9IGF0dGFjaFRvICYmIGF0dGFjaFRvLnNldFRpbWVvdXQgPyBhdHRhY2hUbyA6IGdsb2JhbDtcblxuICAgIC8vIERvbid0IGdldCBmb29sZWQgYnkgZS5nLiBicm93c2VyaWZ5IGVudmlyb25tZW50cy5cbiAgICBpZiAoe30udG9TdHJpbmcuY2FsbChnbG9iYWwucHJvY2VzcykgPT09IFwiW29iamVjdCBwcm9jZXNzXVwiKSB7XG4gICAgICAgIC8vIEZvciBOb2RlLmpzIGJlZm9yZSAwLjlcbiAgICAgICAgaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoY2FuVXNlUG9zdE1lc3NhZ2UoKSkge1xuICAgICAgICAvLyBGb3Igbm9uLUlFMTAgbW9kZXJuIGJyb3dzZXJzXG4gICAgICAgIGluc3RhbGxQb3N0TWVzc2FnZUltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGdsb2JhbC5NZXNzYWdlQ2hhbm5lbCkge1xuICAgICAgICAvLyBGb3Igd2ViIHdvcmtlcnMsIHdoZXJlIHN1cHBvcnRlZFxuICAgICAgICBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChkb2MgJiYgXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIiBpbiBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSkge1xuICAgICAgICAvLyBGb3IgSUUgNuKAkzhcbiAgICAgICAgaW5zdGFsbFJlYWR5U3RhdGVDaGFuZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRm9yIG9sZGVyIGJyb3dzZXJzXG4gICAgICAgIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKTtcbiAgICB9XG5cbiAgICBhdHRhY2hUby5zZXRJbW1lZGlhdGUgPSBzZXRJbW1lZGlhdGU7XG4gICAgYXR0YWNoVG8uY2xlYXJJbW1lZGlhdGUgPSBjbGVhckltbWVkaWF0ZTtcbn0odHlwZW9mIHNlbGYgPT09IFwidW5kZWZpbmVkXCIgPyB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gdGhpcyA6IGdsb2JhbCA6IHNlbGYpKTtcbiIsInZhciBjYW1lbDJoeXBoZW4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAgICAgICAucmVwbGFjZSgvW0EtWl0vZywgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gJy0nICsgbWF0Y2gudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50b0xvd2VyQ2FzZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYW1lbDJoeXBoZW47IiwidmFyIHNjb3BlID0gKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgJiYgZ2xvYmFsKSB8fFxuICAgICAgICAgICAgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGYpIHx8XG4gICAgICAgICAgICB3aW5kb3c7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCBzY29wZSwgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCBzY29wZSwgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkge1xuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVvdXQuY2xvc2UoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbChzY29wZSwgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIHNldGltbWVkaWF0ZSBhdHRhY2hlcyBpdHNlbGYgdG8gdGhlIGdsb2JhbCBvYmplY3RcbnJlcXVpcmUoXCJzZXRpbW1lZGlhdGVcIik7XG4vLyBPbiBzb21lIGV4b3RpYyBlbnZpcm9ubWVudHMsIGl0J3Mgbm90IGNsZWFyIHdoaWNoIG9iamVjdCBgc2V0aW1tZWRpYXRlYCB3YXNcbi8vIGFibGUgdG8gaW5zdGFsbCBvbnRvLiAgU2VhcmNoIGVhY2ggcG9zc2liaWxpdHkgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhlXG4vLyBgc2V0aW1tZWRpYXRlYCBsaWJyYXJ5LlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZi5zZXRJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIGdsb2JhbC5zZXRJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICh0aGlzICYmIHRoaXMuc2V0SW1tZWRpYXRlKTtcbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZi5jbGVhckltbWVkaWF0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWwuY2xlYXJJbW1lZGlhdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMgJiYgdGhpcy5jbGVhckltbWVkaWF0ZSk7XG4iLCJ2YXIgcmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfdm0uX20oMClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXG4gIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3ZtID0gdGhpc1xuICAgIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICAgIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICAgIHJldHVybiBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcImNvbnRhaW5lclwiIH0sIFtcbiAgICAgIF9jKFwiaDFcIiwgW192bS5fdihcIkFkbWluIHBhbmVsXCIpXSksXG4gICAgXSlcbiAgfSxcbl1cbnJlbmRlci5fd2l0aFN0cmlwcGVkID0gdHJ1ZVxuXG5leHBvcnQgeyByZW5kZXIsIHN0YXRpY1JlbmRlckZucyB9IiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF92bSA9IHRoaXNcbiAgdmFyIF9oID0gX3ZtLiRjcmVhdGVFbGVtZW50XG4gIHZhciBfYyA9IF92bS5fc2VsZi5fYyB8fCBfaFxuICByZXR1cm4gX2MoXCJoMVwiLCBbX3ZtLl92KFwiQWJvdXRcIildKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtdXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcblxuZXhwb3J0IHsgcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnMgfSIsInZhciByZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdm0gPSB0aGlzXG4gIHZhciBfaCA9IF92bS4kY3JlYXRlRWxlbWVudFxuICB2YXIgX2MgPSBfdm0uX3NlbGYuX2MgfHwgX2hcbiAgcmV0dXJuIF9jKFwiaDFcIiwgW192bS5fdihcIkxhbmRpbmdcIildKVxufVxudmFyIHN0YXRpY1JlbmRlckZucyA9IFtdXG5yZW5kZXIuX3dpdGhTdHJpcHBlZCA9IHRydWVcblxuZXhwb3J0IHsgcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnMgfSIsIi8qIGdsb2JhbHMgX19WVUVfU1NSX0NPTlRFWFRfXyAqL1xuXG4vLyBJTVBPUlRBTlQ6IERvIE5PVCB1c2UgRVMyMDE1IGZlYXR1cmVzIGluIHRoaXMgZmlsZSAoZXhjZXB0IGZvciBtb2R1bGVzKS5cbi8vIFRoaXMgbW9kdWxlIGlzIGEgcnVudGltZSB1dGlsaXR5IGZvciBjbGVhbmVyIGNvbXBvbmVudCBtb2R1bGUgb3V0cHV0IGFuZCB3aWxsXG4vLyBiZSBpbmNsdWRlZCBpbiB0aGUgZmluYWwgd2VicGFjayB1c2VyIGJ1bmRsZS5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9ybWFsaXplQ29tcG9uZW50IChcbiAgc2NyaXB0RXhwb3J0cyxcbiAgcmVuZGVyLFxuICBzdGF0aWNSZW5kZXJGbnMsXG4gIGZ1bmN0aW9uYWxUZW1wbGF0ZSxcbiAgaW5qZWN0U3R5bGVzLFxuICBzY29wZUlkLFxuICBtb2R1bGVJZGVudGlmaWVyLCAvKiBzZXJ2ZXIgb25seSAqL1xuICBzaGFkb3dNb2RlIC8qIHZ1ZS1jbGkgb25seSAqL1xuKSB7XG4gIC8vIFZ1ZS5leHRlbmQgY29uc3RydWN0b3IgZXhwb3J0IGludGVyb3BcbiAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygc2NyaXB0RXhwb3J0cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gc2NyaXB0RXhwb3J0cy5vcHRpb25zXG4gICAgOiBzY3JpcHRFeHBvcnRzXG5cbiAgLy8gcmVuZGVyIGZ1bmN0aW9uc1xuICBpZiAocmVuZGVyKSB7XG4gICAgb3B0aW9ucy5yZW5kZXIgPSByZW5kZXJcbiAgICBvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IHN0YXRpY1JlbmRlckZuc1xuICAgIG9wdGlvbnMuX2NvbXBpbGVkID0gdHJ1ZVxuICB9XG5cbiAgLy8gZnVuY3Rpb25hbCB0ZW1wbGF0ZVxuICBpZiAoZnVuY3Rpb25hbFRlbXBsYXRlKSB7XG4gICAgb3B0aW9ucy5mdW5jdGlvbmFsID0gdHJ1ZVxuICB9XG5cbiAgLy8gc2NvcGVkSWRcbiAgaWYgKHNjb3BlSWQpIHtcbiAgICBvcHRpb25zLl9zY29wZUlkID0gJ2RhdGEtdi0nICsgc2NvcGVJZFxuICB9XG5cbiAgdmFyIGhvb2tcbiAgaWYgKG1vZHVsZUlkZW50aWZpZXIpIHsgLy8gc2VydmVyIGJ1aWxkXG4gICAgaG9vayA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAvLyAyLjMgaW5qZWN0aW9uXG4gICAgICBjb250ZXh0ID1cbiAgICAgICAgY29udGV4dCB8fCAvLyBjYWNoZWQgY2FsbFxuICAgICAgICAodGhpcy4kdm5vZGUgJiYgdGhpcy4kdm5vZGUuc3NyQ29udGV4dCkgfHwgLy8gc3RhdGVmdWxcbiAgICAgICAgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LiR2bm9kZSAmJiB0aGlzLnBhcmVudC4kdm5vZGUuc3NyQ29udGV4dCkgLy8gZnVuY3Rpb25hbFxuICAgICAgLy8gMi4yIHdpdGggcnVuSW5OZXdDb250ZXh0OiB0cnVlXG4gICAgICBpZiAoIWNvbnRleHQgJiYgdHlwZW9mIF9fVlVFX1NTUl9DT05URVhUX18gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnRleHQgPSBfX1ZVRV9TU1JfQ09OVEVYVF9fXG4gICAgICB9XG4gICAgICAvLyBpbmplY3QgY29tcG9uZW50IHN0eWxlc1xuICAgICAgaWYgKGluamVjdFN0eWxlcykge1xuICAgICAgICBpbmplY3RTdHlsZXMuY2FsbCh0aGlzLCBjb250ZXh0KVxuICAgICAgfVxuICAgICAgLy8gcmVnaXN0ZXIgY29tcG9uZW50IG1vZHVsZSBpZGVudGlmaWVyIGZvciBhc3luYyBjaHVuayBpbmZlcnJlbmNlXG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Ll9yZWdpc3RlcmVkQ29tcG9uZW50cykge1xuICAgICAgICBjb250ZXh0Ll9yZWdpc3RlcmVkQ29tcG9uZW50cy5hZGQobW9kdWxlSWRlbnRpZmllcilcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gdXNlZCBieSBzc3IgaW4gY2FzZSBjb21wb25lbnQgaXMgY2FjaGVkIGFuZCBiZWZvcmVDcmVhdGVcbiAgICAvLyBuZXZlciBnZXRzIGNhbGxlZFxuICAgIG9wdGlvbnMuX3NzclJlZ2lzdGVyID0gaG9va1xuICB9IGVsc2UgaWYgKGluamVjdFN0eWxlcykge1xuICAgIGhvb2sgPSBzaGFkb3dNb2RlXG4gICAgICA/IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5qZWN0U3R5bGVzLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICAob3B0aW9ucy5mdW5jdGlvbmFsID8gdGhpcy5wYXJlbnQgOiB0aGlzKS4kcm9vdC4kb3B0aW9ucy5zaGFkb3dSb290XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIDogaW5qZWN0U3R5bGVzXG4gIH1cblxuICBpZiAoaG9vaykge1xuICAgIGlmIChvcHRpb25zLmZ1bmN0aW9uYWwpIHtcbiAgICAgIC8vIGZvciB0ZW1wbGF0ZS1vbmx5IGhvdC1yZWxvYWQgYmVjYXVzZSBpbiB0aGF0IGNhc2UgdGhlIHJlbmRlciBmbiBkb2Vzbid0XG4gICAgICAvLyBnbyB0aHJvdWdoIHRoZSBub3JtYWxpemVyXG4gICAgICBvcHRpb25zLl9pbmplY3RTdHlsZXMgPSBob29rXG4gICAgICAvLyByZWdpc3RlciBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnQgaW4gdnVlIGZpbGVcbiAgICAgIHZhciBvcmlnaW5hbFJlbmRlciA9IG9wdGlvbnMucmVuZGVyXG4gICAgICBvcHRpb25zLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcldpdGhTdHlsZUluamVjdGlvbiAoaCwgY29udGV4dCkge1xuICAgICAgICBob29rLmNhbGwoY29udGV4dClcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVuZGVyKGgsIGNvbnRleHQpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGluamVjdCBjb21wb25lbnQgcmVnaXN0cmF0aW9uIGFzIGJlZm9yZUNyZWF0ZSBob29rXG4gICAgICB2YXIgZXhpc3RpbmcgPSBvcHRpb25zLmJlZm9yZUNyZWF0ZVxuICAgICAgb3B0aW9ucy5iZWZvcmVDcmVhdGUgPSBleGlzdGluZ1xuICAgICAgICA/IFtdLmNvbmNhdChleGlzdGluZywgaG9vaylcbiAgICAgICAgOiBbaG9va11cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGV4cG9ydHM6IHNjcmlwdEV4cG9ydHMsXG4gICAgb3B0aW9uczogb3B0aW9uc1xuICB9XG59XG4iLCJpbXBvcnQganNvbjJtcSBmcm9tICdqc29uMm1xJztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYXJyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0QnJlYWtwb2ludHNUb01lZGlhUXVlcmllcyhicmVha3BvaW50cykge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGJyZWFrcG9pbnRzKTtcbiAgdmFyIHZhbHVlcyA9IGtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gYnJlYWtwb2ludHNba2V5XTtcbiAgfSk7XG4gIHZhciBicmVha3BvaW50VmFsdWVzID0gWzBdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodmFsdWVzLnNsaWNlKDAsIC0xKSkpO1xuICB2YXIgbWVkaWFRdWVyaWVzID0gYnJlYWtwb2ludFZhbHVlcy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgdmFsdWUsIGluZGV4KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIG1pbldpZHRoOiB2YWx1ZVxuICAgIH0sIGluZGV4IDwga2V5cy5sZW5ndGggLSAxID8ge1xuICAgICAgbWF4V2lkdGg6IGJyZWFrcG9pbnRWYWx1ZXNbaW5kZXggKyAxXSAtIDFcbiAgICB9IDoge30pO1xuICAgIHZhciBtZWRpYVF1ZXJ5ID0ganNvbjJtcShvcHRpb25zKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzdW0sIF9kZWZpbmVQcm9wZXJ0eSh7fSwga2V5c1tpbmRleF0sIG1lZGlhUXVlcnkpKTtcbiAgfSwge30pO1xuICByZXR1cm4gbWVkaWFRdWVyaWVzO1xufVxuZnVuY3Rpb24gdHJhbnNmb3JtVmFsdWVzRnJvbUJyZWFrcG9pbnRzKGJyZWFrcG9pbnRzLCB2YWx1ZXMsIGN1cnJlbnRCcmVha3BvaW50KSB7XG4gIHZhciBmaW5kQ2xvc2VzdFZhbHVlID0gZnVuY3Rpb24gZmluZENsb3Nlc3RWYWx1ZShjdXJyZW50QnJlYWtwb2ludCkge1xuICAgIGlmICh2YWx1ZXNbY3VycmVudEJyZWFrcG9pbnRdICE9PSB1bmRlZmluZWQpIHJldHVybiB2YWx1ZXNbY3VycmVudEJyZWFrcG9pbnRdO1xuICAgIHZhciBpbmRleCA9IGJyZWFrcG9pbnRzLmZpbmRJbmRleChmdW5jdGlvbiAoYikge1xuICAgICAgcmV0dXJuIGIgPT09IGN1cnJlbnRCcmVha3BvaW50O1xuICAgIH0pO1xuICAgIHZhciBuZXdCcmVha3BvaW50ID0gaW5kZXggIT09IC0xIHx8IGluZGV4ICE9PSAwID8gYnJlYWtwb2ludHNbaW5kZXggLSAxXSA6IG51bGw7XG4gICAgaWYgKCFuZXdCcmVha3BvaW50KSByZXR1cm4gdmFsdWVzW2luZGV4XTtcbiAgICByZXR1cm4gdmFsdWVzW25ld0JyZWFrcG9pbnRdICE9PSB1bmRlZmluZWQgPyB2YWx1ZXNbbmV3QnJlYWtwb2ludF0gOiBmaW5kQ2xvc2VzdFZhbHVlKG5ld0JyZWFrcG9pbnQpO1xuICB9O1xuXG4gIHJldHVybiBmaW5kQ2xvc2VzdFZhbHVlKGN1cnJlbnRCcmVha3BvaW50KTtcbn1cbmZ1bmN0aW9uIHNlbGVjdEJyZWFrcG9pbnRzKGJyZWFrcG9pbnRzLCBjdXJyZW50QnJlYWtwb2ludCkge1xuICB2YXIgaW5kZXggPSBicmVha3BvaW50cy5maW5kSW5kZXgoZnVuY3Rpb24gKGIpIHtcbiAgICByZXR1cm4gYiA9PT0gY3VycmVudEJyZWFrcG9pbnQ7XG4gIH0pO1xuICByZXR1cm4gYnJlYWtwb2ludHMuc2xpY2UoaW5kZXgpO1xufVxuZnVuY3Rpb24gc3Vic2NyaWJlVG9NZWRpYVF1ZXJ5KG1lZGlhUXVlcnksIGVudGVyKSB7XG4gIHZhciBtcWwgPSB3aW5kb3cubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KTtcblxuICB2YXIgY2IgPSBmdW5jdGlvbiBjYihfcmVmKSB7XG4gICAgdmFyIG1hdGNoZXMgPSBfcmVmLm1hdGNoZXM7XG4gICAgaWYgKG1hdGNoZXMpIGVudGVyKCk7XG4gIH07XG5cbiAgbXFsLmFkZExpc3RlbmVyKGNiKTsgLy9zdWJzY3JpYmluZ1xuXG4gIGNiKG1xbCk7IC8vaW5pdGlhbCB0cmlnZ2VyXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLy8gVVNBR0Vcbi8vIG1xLWxheW91dChtcT1cImxnXCIpXG4vLyAgIHAgSeKAmW0gbGdcbnZhciBjb21wb25lbnQgPSB7XG4gIHByb3BzOiB7XG4gICAgbXE6IHtcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXldXG4gICAgfVxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIHBsdXNNb2RpZmllcjogZnVuY3Rpb24gcGx1c01vZGlmaWVyKCkge1xuICAgICAgcmV0dXJuICFpc0FycmF5KHRoaXMubXEpICYmIHRoaXMubXEuc2xpY2UoLTEpID09PSAnKyc7XG4gICAgfSxcbiAgICBhY3RpdmVCcmVha3BvaW50czogZnVuY3Rpb24gYWN0aXZlQnJlYWtwb2ludHMoKSB7XG4gICAgICB2YXIgYnJlYWtwb2ludHMgPSBPYmplY3Qua2V5cyh0aGlzLiRtcUF2YWlsYWJsZUJyZWFrcG9pbnRzKTtcbiAgICAgIHZhciBtcSA9IHRoaXMucGx1c01vZGlmaWVyID8gdGhpcy5tcS5zbGljZSgwLCAtMSkgOiBpc0FycmF5KHRoaXMubXEpID8gdGhpcy5tcSA6IFt0aGlzLm1xXTtcbiAgICAgIHJldHVybiB0aGlzLnBsdXNNb2RpZmllciA/IHNlbGVjdEJyZWFrcG9pbnRzKGJyZWFrcG9pbnRzLCBtcSkgOiBtcTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKGgsIHByb3BzKSB7XG4gICAgdmFyIHNob3VsZFJlbmRlckNoaWxkcmVuID0gdGhpcy5hY3RpdmVCcmVha3BvaW50cy5pbmNsdWRlcyh0aGlzLiRtcSk7XG4gICAgcmV0dXJuIHNob3VsZFJlbmRlckNoaWxkcmVuID8gaCgnZGl2JywgdGhpcy4kc2xvdHMuZGVmYXVsdCkgOiBoKCk7XG4gIH1cbn07XG5cbnZhciBERUZBVUxUX0JSRUFLUE9JTlQgPSB7XG4gIHNtOiA0NTAsXG4gIG1kOiAxMjUwLFxuICBsZzogSW5maW5pdHlcbn07XG5cbnZhciBpbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbChWdWUpIHtcbiAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9LFxuICAgICAgX3JlZiRicmVha3BvaW50cyA9IF9yZWYuYnJlYWtwb2ludHMsXG4gICAgICBicmVha3BvaW50cyA9IF9yZWYkYnJlYWtwb2ludHMgPT09IHZvaWQgMCA/IERFRkFVTFRfQlJFQUtQT0lOVCA6IF9yZWYkYnJlYWtwb2ludHMsXG4gICAgICBfcmVmJGRlZmF1bHRCcmVha3BvaW4gPSBfcmVmLmRlZmF1bHRCcmVha3BvaW50LFxuICAgICAgZGVmYXVsdEJyZWFrcG9pbnQgPSBfcmVmJGRlZmF1bHRCcmVha3BvaW4gPT09IHZvaWQgMCA/ICdzbScgOiBfcmVmJGRlZmF1bHRCcmVha3BvaW47XG5cbiAgdmFyIGhhc1NldHVwTGlzdGVuZXJzID0gZmFsc2U7IC8vIEluaXQgcmVhY3RpdmUgY29tcG9uZW50XG5cbiAgdmFyIHJlYWN0b3JDb21wb25lbnQgPSBuZXcgVnVlKHtcbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudEJyZWFrcG9pbnQ6IGRlZmF1bHRCcmVha3BvaW50XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG4gIFZ1ZS5maWx0ZXIoJ21xJywgZnVuY3Rpb24gKGN1cnJlbnRCcmVha3BvaW50LCB2YWx1ZXMpIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtVmFsdWVzRnJvbUJyZWFrcG9pbnRzKE9iamVjdC5rZXlzKGJyZWFrcG9pbnRzKSwgdmFsdWVzLCBjdXJyZW50QnJlYWtwb2ludCk7XG4gIH0pO1xuICBWdWUubWl4aW4oe1xuICAgIGNvbXB1dGVkOiB7XG4gICAgICAkbXE6IGZ1bmN0aW9uICRtcSgpIHtcbiAgICAgICAgcmV0dXJuIHJlYWN0b3JDb21wb25lbnQuY3VycmVudEJyZWFrcG9pbnQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBjcmVhdGVkOiBmdW5jdGlvbiBjcmVhdGVkKCkge1xuICAgICAgaWYgKHRoaXMuJGlzU2VydmVyKSByZWFjdG9yQ29tcG9uZW50LmN1cnJlbnRCcmVha3BvaW50ID0gZGVmYXVsdEJyZWFrcG9pbnQ7XG4gICAgfSxcbiAgICBtb3VudGVkOiBmdW5jdGlvbiBtb3VudGVkKCkge1xuICAgICAgaWYgKCFoYXNTZXR1cExpc3RlbmVycykge1xuICAgICAgICB2YXIgbWVkaWFRdWVyaWVzID0gY29udmVydEJyZWFrcG9pbnRzVG9NZWRpYVF1ZXJpZXMoYnJlYWtwb2ludHMpOyAvLyBzZXR1cCBsaXN0ZW5lcnNcblxuICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChrZXkpIHtcbiAgICAgICAgICB2YXIgbWVkaWFRdWVyeSA9IG1lZGlhUXVlcmllc1trZXldO1xuXG4gICAgICAgICAgdmFyIGVudGVyID0gZnVuY3Rpb24gZW50ZXIoKSB7XG4gICAgICAgICAgICByZWFjdG9yQ29tcG9uZW50LmN1cnJlbnRCcmVha3BvaW50ID0ga2V5O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzdWJzY3JpYmVUb01lZGlhUXVlcnkobWVkaWFRdWVyeSwgZW50ZXIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBtZWRpYVF1ZXJpZXMpIHtcbiAgICAgICAgICBfbG9vcChrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzU2V0dXBMaXN0ZW5lcnMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFZ1ZS5wcm90b3R5cGUuJG1xQXZhaWxhYmxlQnJlYWtwb2ludHMgPSBicmVha3BvaW50cztcbiAgVnVlLmNvbXBvbmVudCgnTXFMYXlvdXQnLCBjb21wb25lbnQpO1xufTtcblxudmFyIGluZGV4ID0ge1xuICBpbnN0YWxsOiBpbnN0YWxsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmRleDtcbiIsIi8qIVxuICAqIHZ1ZS1yb3V0ZXIgdjMuNS4xXG4gICogKGMpIDIwMjEgRXZhbiBZb3VcbiAgKiBAbGljZW5zZSBNSVRcbiAgKi9cbi8qICAqL1xuXG5mdW5jdGlvbiBhc3NlcnQgKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcigoXCJbdnVlLXJvdXRlcl0gXCIgKyBtZXNzYWdlKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB3YXJuIChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgIWNvbmRpdGlvbikge1xuICAgIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLndhcm4oKFwiW3Z1ZS1yb3V0ZXJdIFwiICsgbWVzc2FnZSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV4dGVuZCAoYSwgYikge1xuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGFba2V5XSA9IGJba2V5XTtcbiAgfVxuICByZXR1cm4gYVxufVxuXG4vKiAgKi9cblxudmFyIGVuY29kZVJlc2VydmVSRSA9IC9bIScoKSpdL2c7XG52YXIgZW5jb2RlUmVzZXJ2ZVJlcGxhY2VyID0gZnVuY3Rpb24gKGMpIHsgcmV0dXJuICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNik7IH07XG52YXIgY29tbWFSRSA9IC8lMkMvZztcblxuLy8gZml4ZWQgZW5jb2RlVVJJQ29tcG9uZW50IHdoaWNoIGlzIG1vcmUgY29uZm9ybWFudCB0byBSRkMzOTg2OlxuLy8gLSBlc2NhcGVzIFshJygpKl1cbi8vIC0gcHJlc2VydmUgY29tbWFzXG52YXIgZW5jb2RlID0gZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgICAucmVwbGFjZShlbmNvZGVSZXNlcnZlUkUsIGVuY29kZVJlc2VydmVSZXBsYWNlcilcbiAgICAucmVwbGFjZShjb21tYVJFLCAnLCcpOyB9O1xuXG5mdW5jdGlvbiBkZWNvZGUgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgd2FybihmYWxzZSwgKFwiRXJyb3IgZGVjb2RpbmcgXFxcIlwiICsgc3RyICsgXCJcXFwiLiBMZWF2aW5nIGl0IGludGFjdC5cIikpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVRdWVyeSAoXG4gIHF1ZXJ5LFxuICBleHRyYVF1ZXJ5LFxuICBfcGFyc2VRdWVyeVxuKSB7XG4gIGlmICggZXh0cmFRdWVyeSA9PT0gdm9pZCAwICkgZXh0cmFRdWVyeSA9IHt9O1xuXG4gIHZhciBwYXJzZSA9IF9wYXJzZVF1ZXJ5IHx8IHBhcnNlUXVlcnk7XG4gIHZhciBwYXJzZWRRdWVyeTtcbiAgdHJ5IHtcbiAgICBwYXJzZWRRdWVyeSA9IHBhcnNlKHF1ZXJ5IHx8ICcnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihmYWxzZSwgZS5tZXNzYWdlKTtcbiAgICBwYXJzZWRRdWVyeSA9IHt9O1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBleHRyYVF1ZXJ5KSB7XG4gICAgdmFyIHZhbHVlID0gZXh0cmFRdWVyeVtrZXldO1xuICAgIHBhcnNlZFF1ZXJ5W2tleV0gPSBBcnJheS5pc0FycmF5KHZhbHVlKVxuICAgICAgPyB2YWx1ZS5tYXAoY2FzdFF1ZXJ5UGFyYW1WYWx1ZSlcbiAgICAgIDogY2FzdFF1ZXJ5UGFyYW1WYWx1ZSh2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFF1ZXJ5XG59XG5cbnZhciBjYXN0UXVlcnlQYXJhbVZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiAodmFsdWUgPT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpKTsgfTtcblxuZnVuY3Rpb24gcGFyc2VRdWVyeSAocXVlcnkpIHtcbiAgdmFyIHJlcyA9IHt9O1xuXG4gIHF1ZXJ5ID0gcXVlcnkudHJpbSgpLnJlcGxhY2UoL14oXFw/fCN8JikvLCAnJyk7XG5cbiAgaWYgKCFxdWVyeSkge1xuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHF1ZXJ5LnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBkZWNvZGUocGFydHMuc2hpZnQoKSk7XG4gICAgdmFyIHZhbCA9IHBhcnRzLmxlbmd0aCA+IDAgPyBkZWNvZGUocGFydHMuam9pbignPScpKSA6IG51bGw7XG5cbiAgICBpZiAocmVzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzW2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlc1trZXldKSkge1xuICAgICAgcmVzW2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNba2V5XSA9IFtyZXNba2V5XSwgdmFsXTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5UXVlcnkgKG9iaikge1xuICB2YXIgcmVzID0gb2JqXG4gICAgPyBPYmplY3Qua2V5cyhvYmopXG4gICAgICAubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiAnJ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBlbmNvZGUoa2V5KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICB2YWwuZm9yRWFjaChmdW5jdGlvbiAodmFsMikge1xuICAgICAgICAgICAgaWYgKHZhbDIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWwyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZShrZXkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHZhbDIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJyYnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHZhbClcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Lmxlbmd0aCA+IDA7IH0pXG4gICAgICAuam9pbignJicpXG4gICAgOiBudWxsO1xuICByZXR1cm4gcmVzID8gKFwiP1wiICsgcmVzKSA6ICcnXG59XG5cbi8qICAqL1xuXG52YXIgdHJhaWxpbmdTbGFzaFJFID0gL1xcLz8kLztcblxuZnVuY3Rpb24gY3JlYXRlUm91dGUgKFxuICByZWNvcmQsXG4gIGxvY2F0aW9uLFxuICByZWRpcmVjdGVkRnJvbSxcbiAgcm91dGVyXG4pIHtcbiAgdmFyIHN0cmluZ2lmeVF1ZXJ5ID0gcm91dGVyICYmIHJvdXRlci5vcHRpb25zLnN0cmluZ2lmeVF1ZXJ5O1xuXG4gIHZhciBxdWVyeSA9IGxvY2F0aW9uLnF1ZXJ5IHx8IHt9O1xuICB0cnkge1xuICAgIHF1ZXJ5ID0gY2xvbmUocXVlcnkpO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByb3V0ZSA9IHtcbiAgICBuYW1lOiBsb2NhdGlvbi5uYW1lIHx8IChyZWNvcmQgJiYgcmVjb3JkLm5hbWUpLFxuICAgIG1ldGE6IChyZWNvcmQgJiYgcmVjb3JkLm1ldGEpIHx8IHt9LFxuICAgIHBhdGg6IGxvY2F0aW9uLnBhdGggfHwgJy8nLFxuICAgIGhhc2g6IGxvY2F0aW9uLmhhc2ggfHwgJycsXG4gICAgcXVlcnk6IHF1ZXJ5LFxuICAgIHBhcmFtczogbG9jYXRpb24ucGFyYW1zIHx8IHt9LFxuICAgIGZ1bGxQYXRoOiBnZXRGdWxsUGF0aChsb2NhdGlvbiwgc3RyaW5naWZ5UXVlcnkpLFxuICAgIG1hdGNoZWQ6IHJlY29yZCA/IGZvcm1hdE1hdGNoKHJlY29yZCkgOiBbXVxuICB9O1xuICBpZiAocmVkaXJlY3RlZEZyb20pIHtcbiAgICByb3V0ZS5yZWRpcmVjdGVkRnJvbSA9IGdldEZ1bGxQYXRoKHJlZGlyZWN0ZWRGcm9tLCBzdHJpbmdpZnlRdWVyeSk7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocm91dGUpXG59XG5cbmZ1bmN0aW9uIGNsb25lICh2YWx1ZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUubWFwKGNsb25lKVxuICB9IGVsc2UgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgcmVzID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICByZXNba2V5XSA9IGNsb25lKHZhbHVlW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbn1cblxuLy8gdGhlIHN0YXJ0aW5nIHJvdXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgaW5pdGlhbCBzdGF0ZVxudmFyIFNUQVJUID0gY3JlYXRlUm91dGUobnVsbCwge1xuICBwYXRoOiAnLydcbn0pO1xuXG5mdW5jdGlvbiBmb3JtYXRNYXRjaCAocmVjb3JkKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgd2hpbGUgKHJlY29yZCkge1xuICAgIHJlcy51bnNoaWZ0KHJlY29yZCk7XG4gICAgcmVjb3JkID0gcmVjb3JkLnBhcmVudDtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxQYXRoIChcbiAgcmVmLFxuICBfc3RyaW5naWZ5UXVlcnlcbikge1xuICB2YXIgcGF0aCA9IHJlZi5wYXRoO1xuICB2YXIgcXVlcnkgPSByZWYucXVlcnk7IGlmICggcXVlcnkgPT09IHZvaWQgMCApIHF1ZXJ5ID0ge307XG4gIHZhciBoYXNoID0gcmVmLmhhc2g7IGlmICggaGFzaCA9PT0gdm9pZCAwICkgaGFzaCA9ICcnO1xuXG4gIHZhciBzdHJpbmdpZnkgPSBfc3RyaW5naWZ5UXVlcnkgfHwgc3RyaW5naWZ5UXVlcnk7XG4gIHJldHVybiAocGF0aCB8fCAnLycpICsgc3RyaW5naWZ5KHF1ZXJ5KSArIGhhc2hcbn1cblxuZnVuY3Rpb24gaXNTYW1lUm91dGUgKGEsIGIsIG9ubHlQYXRoKSB7XG4gIGlmIChiID09PSBTVEFSVCkge1xuICAgIHJldHVybiBhID09PSBiXG4gIH0gZWxzZSBpZiAoIWIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIGlmIChhLnBhdGggJiYgYi5wYXRoKSB7XG4gICAgcmV0dXJuIGEucGF0aC5yZXBsYWNlKHRyYWlsaW5nU2xhc2hSRSwgJycpID09PSBiLnBhdGgucmVwbGFjZSh0cmFpbGluZ1NsYXNoUkUsICcnKSAmJiAob25seVBhdGggfHxcbiAgICAgIGEuaGFzaCA9PT0gYi5oYXNoICYmXG4gICAgICBpc09iamVjdEVxdWFsKGEucXVlcnksIGIucXVlcnkpKVxuICB9IGVsc2UgaWYgKGEubmFtZSAmJiBiLm5hbWUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgYS5uYW1lID09PSBiLm5hbWUgJiZcbiAgICAgIChvbmx5UGF0aCB8fCAoXG4gICAgICAgIGEuaGFzaCA9PT0gYi5oYXNoICYmXG4gICAgICBpc09iamVjdEVxdWFsKGEucXVlcnksIGIucXVlcnkpICYmXG4gICAgICBpc09iamVjdEVxdWFsKGEucGFyYW1zLCBiLnBhcmFtcykpXG4gICAgICApXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0RXF1YWwgKGEsIGIpIHtcbiAgaWYgKCBhID09PSB2b2lkIDAgKSBhID0ge307XG4gIGlmICggYiA9PT0gdm9pZCAwICkgYiA9IHt9O1xuXG4gIC8vIGhhbmRsZSBudWxsIHZhbHVlICMxNTY2XG4gIGlmICghYSB8fCAhYikgeyByZXR1cm4gYSA9PT0gYiB9XG4gIHZhciBhS2V5cyA9IE9iamVjdC5rZXlzKGEpLnNvcnQoKTtcbiAgdmFyIGJLZXlzID0gT2JqZWN0LmtleXMoYikuc29ydCgpO1xuICBpZiAoYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gYUtleXMuZXZlcnkoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgIHZhciBhVmFsID0gYVtrZXldO1xuICAgIHZhciBiS2V5ID0gYktleXNbaV07XG4gICAgaWYgKGJLZXkgIT09IGtleSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHZhciBiVmFsID0gYltrZXldO1xuICAgIC8vIHF1ZXJ5IHZhbHVlcyBjYW4gYmUgbnVsbCBhbmQgdW5kZWZpbmVkXG4gICAgaWYgKGFWYWwgPT0gbnVsbCB8fCBiVmFsID09IG51bGwpIHsgcmV0dXJuIGFWYWwgPT09IGJWYWwgfVxuICAgIC8vIGNoZWNrIG5lc3RlZCBlcXVhbGl0eVxuICAgIGlmICh0eXBlb2YgYVZhbCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGJWYWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3RFcXVhbChhVmFsLCBiVmFsKVxuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nKGFWYWwpID09PSBTdHJpbmcoYlZhbClcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXNJbmNsdWRlZFJvdXRlIChjdXJyZW50LCB0YXJnZXQpIHtcbiAgcmV0dXJuIChcbiAgICBjdXJyZW50LnBhdGgucmVwbGFjZSh0cmFpbGluZ1NsYXNoUkUsICcvJykuaW5kZXhPZihcbiAgICAgIHRhcmdldC5wYXRoLnJlcGxhY2UodHJhaWxpbmdTbGFzaFJFLCAnLycpXG4gICAgKSA9PT0gMCAmJlxuICAgICghdGFyZ2V0Lmhhc2ggfHwgY3VycmVudC5oYXNoID09PSB0YXJnZXQuaGFzaCkgJiZcbiAgICBxdWVyeUluY2x1ZGVzKGN1cnJlbnQucXVlcnksIHRhcmdldC5xdWVyeSlcbiAgKVxufVxuXG5mdW5jdGlvbiBxdWVyeUluY2x1ZGVzIChjdXJyZW50LCB0YXJnZXQpIHtcbiAgZm9yICh2YXIga2V5IGluIHRhcmdldCkge1xuICAgIGlmICghKGtleSBpbiBjdXJyZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGhhbmRsZVJvdXRlRW50ZXJlZCAocm91dGUpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZS5tYXRjaGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHJlY29yZCA9IHJvdXRlLm1hdGNoZWRbaV07XG4gICAgZm9yICh2YXIgbmFtZSBpbiByZWNvcmQuaW5zdGFuY2VzKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSByZWNvcmQuaW5zdGFuY2VzW25hbWVdO1xuICAgICAgdmFyIGNicyA9IHJlY29yZC5lbnRlcmVkQ2JzW25hbWVdO1xuICAgICAgaWYgKCFpbnN0YW5jZSB8fCAhY2JzKSB7IGNvbnRpbnVlIH1cbiAgICAgIGRlbGV0ZSByZWNvcmQuZW50ZXJlZENic1tuYW1lXTtcbiAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGNicy5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UuX2lzQmVpbmdEZXN0cm95ZWQpIHsgY2JzW2kkMV0oaW5zdGFuY2UpOyB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnZhciBWaWV3ID0ge1xuICBuYW1lOiAnUm91dGVyVmlldycsXG4gIGZ1bmN0aW9uYWw6IHRydWUsXG4gIHByb3BzOiB7XG4gICAgbmFtZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2RlZmF1bHQnXG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoXywgcmVmKSB7XG4gICAgdmFyIHByb3BzID0gcmVmLnByb3BzO1xuICAgIHZhciBjaGlsZHJlbiA9IHJlZi5jaGlsZHJlbjtcbiAgICB2YXIgcGFyZW50ID0gcmVmLnBhcmVudDtcbiAgICB2YXIgZGF0YSA9IHJlZi5kYXRhO1xuXG4gICAgLy8gdXNlZCBieSBkZXZ0b29scyB0byBkaXNwbGF5IGEgcm91dGVyLXZpZXcgYmFkZ2VcbiAgICBkYXRhLnJvdXRlclZpZXcgPSB0cnVlO1xuXG4gICAgLy8gZGlyZWN0bHkgdXNlIHBhcmVudCBjb250ZXh0J3MgY3JlYXRlRWxlbWVudCgpIGZ1bmN0aW9uXG4gICAgLy8gc28gdGhhdCBjb21wb25lbnRzIHJlbmRlcmVkIGJ5IHJvdXRlci12aWV3IGNhbiByZXNvbHZlIG5hbWVkIHNsb3RzXG4gICAgdmFyIGggPSBwYXJlbnQuJGNyZWF0ZUVsZW1lbnQ7XG4gICAgdmFyIG5hbWUgPSBwcm9wcy5uYW1lO1xuICAgIHZhciByb3V0ZSA9IHBhcmVudC4kcm91dGU7XG4gICAgdmFyIGNhY2hlID0gcGFyZW50Ll9yb3V0ZXJWaWV3Q2FjaGUgfHwgKHBhcmVudC5fcm91dGVyVmlld0NhY2hlID0ge30pO1xuXG4gICAgLy8gZGV0ZXJtaW5lIGN1cnJlbnQgdmlldyBkZXB0aCwgYWxzbyBjaGVjayB0byBzZWUgaWYgdGhlIHRyZWVcbiAgICAvLyBoYXMgYmVlbiB0b2dnbGVkIGluYWN0aXZlIGJ1dCBrZXB0LWFsaXZlLlxuICAgIHZhciBkZXB0aCA9IDA7XG4gICAgdmFyIGluYWN0aXZlID0gZmFsc2U7XG4gICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQuX3JvdXRlclJvb3QgIT09IHBhcmVudCkge1xuICAgICAgdmFyIHZub2RlRGF0YSA9IHBhcmVudC4kdm5vZGUgPyBwYXJlbnQuJHZub2RlLmRhdGEgOiB7fTtcbiAgICAgIGlmICh2bm9kZURhdGEucm91dGVyVmlldykge1xuICAgICAgICBkZXB0aCsrO1xuICAgICAgfVxuICAgICAgaWYgKHZub2RlRGF0YS5rZWVwQWxpdmUgJiYgcGFyZW50Ll9kaXJlY3RJbmFjdGl2ZSAmJiBwYXJlbnQuX2luYWN0aXZlKSB7XG4gICAgICAgIGluYWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHBhcmVudCA9IHBhcmVudC4kcGFyZW50O1xuICAgIH1cbiAgICBkYXRhLnJvdXRlclZpZXdEZXB0aCA9IGRlcHRoO1xuXG4gICAgLy8gcmVuZGVyIHByZXZpb3VzIHZpZXcgaWYgdGhlIHRyZWUgaXMgaW5hY3RpdmUgYW5kIGtlcHQtYWxpdmVcbiAgICBpZiAoaW5hY3RpdmUpIHtcbiAgICAgIHZhciBjYWNoZWREYXRhID0gY2FjaGVbbmFtZV07XG4gICAgICB2YXIgY2FjaGVkQ29tcG9uZW50ID0gY2FjaGVkRGF0YSAmJiBjYWNoZWREYXRhLmNvbXBvbmVudDtcbiAgICAgIGlmIChjYWNoZWRDb21wb25lbnQpIHtcbiAgICAgICAgLy8gIzIzMDFcbiAgICAgICAgLy8gcGFzcyBwcm9wc1xuICAgICAgICBpZiAoY2FjaGVkRGF0YS5jb25maWdQcm9wcykge1xuICAgICAgICAgIGZpbGxQcm9wc2luRGF0YShjYWNoZWRDb21wb25lbnQsIGRhdGEsIGNhY2hlZERhdGEucm91dGUsIGNhY2hlZERhdGEuY29uZmlnUHJvcHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoKGNhY2hlZENvbXBvbmVudCwgZGF0YSwgY2hpbGRyZW4pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW5kZXIgcHJldmlvdXMgZW1wdHkgdmlld1xuICAgICAgICByZXR1cm4gaCgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoZWQgPSByb3V0ZS5tYXRjaGVkW2RlcHRoXTtcbiAgICB2YXIgY29tcG9uZW50ID0gbWF0Y2hlZCAmJiBtYXRjaGVkLmNvbXBvbmVudHNbbmFtZV07XG5cbiAgICAvLyByZW5kZXIgZW1wdHkgbm9kZSBpZiBubyBtYXRjaGVkIHJvdXRlIG9yIG5vIGNvbmZpZyBjb21wb25lbnRcbiAgICBpZiAoIW1hdGNoZWQgfHwgIWNvbXBvbmVudCkge1xuICAgICAgY2FjaGVbbmFtZV0gPSBudWxsO1xuICAgICAgcmV0dXJuIGgoKVxuICAgIH1cblxuICAgIC8vIGNhY2hlIGNvbXBvbmVudFxuICAgIGNhY2hlW25hbWVdID0geyBjb21wb25lbnQ6IGNvbXBvbmVudCB9O1xuXG4gICAgLy8gYXR0YWNoIGluc3RhbmNlIHJlZ2lzdHJhdGlvbiBob29rXG4gICAgLy8gdGhpcyB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgaW5zdGFuY2UncyBpbmplY3RlZCBsaWZlY3ljbGUgaG9va3NcbiAgICBkYXRhLnJlZ2lzdGVyUm91dGVJbnN0YW5jZSA9IGZ1bmN0aW9uICh2bSwgdmFsKSB7XG4gICAgICAvLyB2YWwgY291bGQgYmUgdW5kZWZpbmVkIGZvciB1bnJlZ2lzdHJhdGlvblxuICAgICAgdmFyIGN1cnJlbnQgPSBtYXRjaGVkLmluc3RhbmNlc1tuYW1lXTtcbiAgICAgIGlmIChcbiAgICAgICAgKHZhbCAmJiBjdXJyZW50ICE9PSB2bSkgfHxcbiAgICAgICAgKCF2YWwgJiYgY3VycmVudCA9PT0gdm0pXG4gICAgICApIHtcbiAgICAgICAgbWF0Y2hlZC5pbnN0YW5jZXNbbmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWxzbyByZWdpc3RlciBpbnN0YW5jZSBpbiBwcmVwYXRjaCBob29rXG4gICAgLy8gaW4gY2FzZSB0aGUgc2FtZSBjb21wb25lbnQgaW5zdGFuY2UgaXMgcmV1c2VkIGFjcm9zcyBkaWZmZXJlbnQgcm91dGVzXG4gICAgOyhkYXRhLmhvb2sgfHwgKGRhdGEuaG9vayA9IHt9KSkucHJlcGF0Y2ggPSBmdW5jdGlvbiAoXywgdm5vZGUpIHtcbiAgICAgIG1hdGNoZWQuaW5zdGFuY2VzW25hbWVdID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgfTtcblxuICAgIC8vIHJlZ2lzdGVyIGluc3RhbmNlIGluIGluaXQgaG9va1xuICAgIC8vIGluIGNhc2Uga2VwdC1hbGl2ZSBjb21wb25lbnQgYmUgYWN0aXZlZCB3aGVuIHJvdXRlcyBjaGFuZ2VkXG4gICAgZGF0YS5ob29rLmluaXQgPSBmdW5jdGlvbiAodm5vZGUpIHtcbiAgICAgIGlmICh2bm9kZS5kYXRhLmtlZXBBbGl2ZSAmJlxuICAgICAgICB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSAmJlxuICAgICAgICB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSAhPT0gbWF0Y2hlZC5pbnN0YW5jZXNbbmFtZV1cbiAgICAgICkge1xuICAgICAgICBtYXRjaGVkLmluc3RhbmNlc1tuYW1lXSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcm91dGUgdHJhbnNpdGlvbiBoYXMgYWxyZWFkeSBiZWVuIGNvbmZpcm1lZCB0aGVuIHdlIHdlcmVuJ3RcbiAgICAgIC8vIGFibGUgdG8gY2FsbCB0aGUgY2JzIGR1cmluZyBjb25maXJtYXRpb24gYXMgdGhlIGNvbXBvbmVudCB3YXMgbm90XG4gICAgICAvLyByZWdpc3RlcmVkIHlldCwgc28gd2UgY2FsbCBpdCBoZXJlLlxuICAgICAgaGFuZGxlUm91dGVFbnRlcmVkKHJvdXRlKTtcbiAgICB9O1xuXG4gICAgdmFyIGNvbmZpZ1Byb3BzID0gbWF0Y2hlZC5wcm9wcyAmJiBtYXRjaGVkLnByb3BzW25hbWVdO1xuICAgIC8vIHNhdmUgcm91dGUgYW5kIGNvbmZpZ1Byb3BzIGluIGNhY2hlXG4gICAgaWYgKGNvbmZpZ1Byb3BzKSB7XG4gICAgICBleHRlbmQoY2FjaGVbbmFtZV0sIHtcbiAgICAgICAgcm91dGU6IHJvdXRlLFxuICAgICAgICBjb25maWdQcm9wczogY29uZmlnUHJvcHNcbiAgICAgIH0pO1xuICAgICAgZmlsbFByb3BzaW5EYXRhKGNvbXBvbmVudCwgZGF0YSwgcm91dGUsIGNvbmZpZ1Byb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaChjb21wb25lbnQsIGRhdGEsIGNoaWxkcmVuKVxuICB9XG59O1xuXG5mdW5jdGlvbiBmaWxsUHJvcHNpbkRhdGEgKGNvbXBvbmVudCwgZGF0YSwgcm91dGUsIGNvbmZpZ1Byb3BzKSB7XG4gIC8vIHJlc29sdmUgcHJvcHNcbiAgdmFyIHByb3BzVG9QYXNzID0gZGF0YS5wcm9wcyA9IHJlc29sdmVQcm9wcyhyb3V0ZSwgY29uZmlnUHJvcHMpO1xuICBpZiAocHJvcHNUb1Bhc3MpIHtcbiAgICAvLyBjbG9uZSB0byBwcmV2ZW50IG11dGF0aW9uXG4gICAgcHJvcHNUb1Bhc3MgPSBkYXRhLnByb3BzID0gZXh0ZW5kKHt9LCBwcm9wc1RvUGFzcyk7XG4gICAgLy8gcGFzcyBub24tZGVjbGFyZWQgcHJvcHMgYXMgYXR0cnNcbiAgICB2YXIgYXR0cnMgPSBkYXRhLmF0dHJzID0gZGF0YS5hdHRycyB8fCB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcHNUb1Bhc3MpIHtcbiAgICAgIGlmICghY29tcG9uZW50LnByb3BzIHx8ICEoa2V5IGluIGNvbXBvbmVudC5wcm9wcykpIHtcbiAgICAgICAgYXR0cnNba2V5XSA9IHByb3BzVG9QYXNzW2tleV07XG4gICAgICAgIGRlbGV0ZSBwcm9wc1RvUGFzc1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUHJvcHMgKHJvdXRlLCBjb25maWcpIHtcbiAgc3dpdGNoICh0eXBlb2YgY29uZmlnKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVyblxuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgcmV0dXJuIGNvbmZpZyhyb3V0ZSlcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiBjb25maWcgPyByb3V0ZS5wYXJhbXMgOiB1bmRlZmluZWRcbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBcInByb3BzIGluIFxcXCJcIiArIChyb3V0ZS5wYXRoKSArIFwiXFxcIiBpcyBhIFwiICsgKHR5cGVvZiBjb25maWcpICsgXCIsIFwiICtcbiAgICAgICAgICBcImV4cGVjdGluZyBhbiBvYmplY3QsIGZ1bmN0aW9uIG9yIGJvb2xlYW4uXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgfVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gcmVzb2x2ZVBhdGggKFxuICByZWxhdGl2ZSxcbiAgYmFzZSxcbiAgYXBwZW5kXG4pIHtcbiAgdmFyIGZpcnN0Q2hhciA9IHJlbGF0aXZlLmNoYXJBdCgwKTtcbiAgaWYgKGZpcnN0Q2hhciA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIHJlbGF0aXZlXG4gIH1cblxuICBpZiAoZmlyc3RDaGFyID09PSAnPycgfHwgZmlyc3RDaGFyID09PSAnIycpIHtcbiAgICByZXR1cm4gYmFzZSArIHJlbGF0aXZlXG4gIH1cblxuICB2YXIgc3RhY2sgPSBiYXNlLnNwbGl0KCcvJyk7XG5cbiAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNlZ21lbnQgaWY6XG4gIC8vIC0gbm90IGFwcGVuZGluZ1xuICAvLyAtIGFwcGVuZGluZyB0byB0cmFpbGluZyBzbGFzaCAobGFzdCBzZWdtZW50IGlzIGVtcHR5KVxuICBpZiAoIWFwcGVuZCB8fCAhc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICBzdGFjay5wb3AoKTtcbiAgfVxuXG4gIC8vIHJlc29sdmUgcmVsYXRpdmUgcGF0aFxuICB2YXIgc2VnbWVudHMgPSByZWxhdGl2ZS5yZXBsYWNlKC9eXFwvLywgJycpLnNwbGl0KCcvJyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRzW2ldO1xuICAgIGlmIChzZWdtZW50ID09PSAnLi4nKSB7XG4gICAgICBzdGFjay5wb3AoKTtcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnQgIT09ICcuJykge1xuICAgICAgc3RhY2sucHVzaChzZWdtZW50KTtcbiAgICB9XG4gIH1cblxuICAvLyBlbnN1cmUgbGVhZGluZyBzbGFzaFxuICBpZiAoc3RhY2tbMF0gIT09ICcnKSB7XG4gICAgc3RhY2sudW5zaGlmdCgnJyk7XG4gIH1cblxuICByZXR1cm4gc3RhY2suam9pbignLycpXG59XG5cbmZ1bmN0aW9uIHBhcnNlUGF0aCAocGF0aCkge1xuICB2YXIgaGFzaCA9ICcnO1xuICB2YXIgcXVlcnkgPSAnJztcblxuICB2YXIgaGFzaEluZGV4ID0gcGF0aC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoSW5kZXggPj0gMCkge1xuICAgIGhhc2ggPSBwYXRoLnNsaWNlKGhhc2hJbmRleCk7XG4gICAgcGF0aCA9IHBhdGguc2xpY2UoMCwgaGFzaEluZGV4KTtcbiAgfVxuXG4gIHZhciBxdWVyeUluZGV4ID0gcGF0aC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxdWVyeUluZGV4ID49IDApIHtcbiAgICBxdWVyeSA9IHBhdGguc2xpY2UocXVlcnlJbmRleCArIDEpO1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDAsIHF1ZXJ5SW5kZXgpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoOiBwYXRoLFxuICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICBoYXNoOiBoYXNoXG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYW5QYXRoIChwYXRoKSB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcL1xcLy9nLCAnLycpXG59XG5cbnZhciBpc2FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHBhdGhUb1JlZ2V4cGAuXG4gKi9cbnZhciBwYXRoVG9SZWdleHBfMSA9IHBhdGhUb1JlZ2V4cDtcbnZhciBwYXJzZV8xID0gcGFyc2U7XG52YXIgY29tcGlsZV8xID0gY29tcGlsZTtcbnZhciB0b2tlbnNUb0Z1bmN0aW9uXzEgPSB0b2tlbnNUb0Z1bmN0aW9uO1xudmFyIHRva2Vuc1RvUmVnRXhwXzEgPSB0b2tlbnNUb1JlZ0V4cDtcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiLCB1bmRlZmluZWRdXG4gIC8vIFwiL3JvdXRlKFxcXFxkKylcIiAgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgLy8gXCIvKlwiICAgICAgICAgICAgPT4gW1wiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiKlwiXVxuICAnKFtcXFxcLy5dKT8oPzooPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteXFxcXFxcXFwoKV0pKylcXFxcKSk/fFxcXFwoKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcKCldKSspXFxcXCkpKFsrKj9dKT98KFxcXFwqKSknXG5dLmpvaW4oJ3wnKSwgJ2cnKTtcblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBmb3IgdGhlIHJhdyB0b2tlbnMuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSAgc3RyXG4gKiBAcGFyYW0gIHtPYmplY3Q9fSBvcHRpb25zXG4gKiBAcmV0dXJuIHshQXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlIChzdHIsIG9wdGlvbnMpIHtcbiAgdmFyIHRva2VucyA9IFtdO1xuICB2YXIga2V5ID0gMDtcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIHBhdGggPSAnJztcbiAgdmFyIGRlZmF1bHREZWxpbWl0ZXIgPSBvcHRpb25zICYmIG9wdGlvbnMuZGVsaW1pdGVyIHx8ICcvJztcbiAgdmFyIHJlcztcblxuICB3aGlsZSAoKHJlcyA9IFBBVEhfUkVHRVhQLmV4ZWMoc3RyKSkgIT0gbnVsbCkge1xuICAgIHZhciBtID0gcmVzWzBdO1xuICAgIHZhciBlc2NhcGVkID0gcmVzWzFdO1xuICAgIHZhciBvZmZzZXQgPSByZXMuaW5kZXg7XG4gICAgcGF0aCArPSBzdHIuc2xpY2UoaW5kZXgsIG9mZnNldCk7XG4gICAgaW5kZXggPSBvZmZzZXQgKyBtLmxlbmd0aDtcblxuICAgIC8vIElnbm9yZSBhbHJlYWR5IGVzY2FwZWQgc2VxdWVuY2VzLlxuICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICBwYXRoICs9IGVzY2FwZWRbMV07XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIHZhciBuZXh0ID0gc3RyW2luZGV4XTtcbiAgICB2YXIgcHJlZml4ID0gcmVzWzJdO1xuICAgIHZhciBuYW1lID0gcmVzWzNdO1xuICAgIHZhciBjYXB0dXJlID0gcmVzWzRdO1xuICAgIHZhciBncm91cCA9IHJlc1s1XTtcbiAgICB2YXIgbW9kaWZpZXIgPSByZXNbNl07XG4gICAgdmFyIGFzdGVyaXNrID0gcmVzWzddO1xuXG4gICAgLy8gUHVzaCB0aGUgY3VycmVudCBwYXRoIG9udG8gdGhlIHRva2Vucy5cbiAgICBpZiAocGF0aCkge1xuICAgICAgdG9rZW5zLnB1c2gocGF0aCk7XG4gICAgICBwYXRoID0gJyc7XG4gICAgfVxuXG4gICAgdmFyIHBhcnRpYWwgPSBwcmVmaXggIT0gbnVsbCAmJiBuZXh0ICE9IG51bGwgJiYgbmV4dCAhPT0gcHJlZml4O1xuICAgIHZhciByZXBlYXQgPSBtb2RpZmllciA9PT0gJysnIHx8IG1vZGlmaWVyID09PSAnKic7XG4gICAgdmFyIG9wdGlvbmFsID0gbW9kaWZpZXIgPT09ICc/JyB8fCBtb2RpZmllciA9PT0gJyonO1xuICAgIHZhciBkZWxpbWl0ZXIgPSByZXNbMl0gfHwgZGVmYXVsdERlbGltaXRlcjtcbiAgICB2YXIgcGF0dGVybiA9IGNhcHR1cmUgfHwgZ3JvdXA7XG5cbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lIHx8IGtleSsrLFxuICAgICAgcHJlZml4OiBwcmVmaXggfHwgJycsXG4gICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgcGFydGlhbDogcGFydGlhbCxcbiAgICAgIGFzdGVyaXNrOiAhIWFzdGVyaXNrLFxuICAgICAgcGF0dGVybjogcGF0dGVybiA/IGVzY2FwZUdyb3VwKHBhdHRlcm4pIDogKGFzdGVyaXNrID8gJy4qJyA6ICdbXicgKyBlc2NhcGVTdHJpbmcoZGVsaW1pdGVyKSArICddKz8nKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gTWF0Y2ggYW55IGNoYXJhY3RlcnMgc3RpbGwgcmVtYWluaW5nLlxuICBpZiAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgcGF0aCArPSBzdHIuc3Vic3RyKGluZGV4KTtcbiAgfVxuXG4gIC8vIElmIHRoZSBwYXRoIGV4aXN0cywgcHVzaCBpdCBvbnRvIHRoZSBlbmQuXG4gIGlmIChwYXRoKSB7XG4gICAgdG9rZW5zLnB1c2gocGF0aCk7XG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogQ29tcGlsZSBhIHN0cmluZyB0byBhIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciB0aGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgICAgICAgICAgIHN0clxuICogQHBhcmFtICB7T2JqZWN0PX0gICAgICAgICAgICBvcHRpb25zXG4gKiBAcmV0dXJuIHshZnVuY3Rpb24oT2JqZWN0PSwgT2JqZWN0PSl9XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGUgKHN0ciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9rZW5zVG9GdW5jdGlvbihwYXJzZShzdHIsIG9wdGlvbnMpLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFByZXR0aWVyIGVuY29kaW5nIG9mIFVSSSBwYXRoIHNlZ21lbnRzLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ31cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZW5jb2RlVVJJQ29tcG9uZW50UHJldHR5IChzdHIpIHtcbiAgcmV0dXJuIGVuY29kZVVSSShzdHIpLnJlcGxhY2UoL1tcXC8/I10vZywgZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpXG4gIH0pXG59XG5cbi8qKlxuICogRW5jb2RlIHRoZSBhc3RlcmlzayBwYXJhbWV0ZXIuIFNpbWlsYXIgdG8gYHByZXR0eWAsIGJ1dCBhbGxvd3Mgc2xhc2hlcy5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVuY29kZUFzdGVyaXNrIChzdHIpIHtcbiAgcmV0dXJuIGVuY29kZVVSSShzdHIpLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpXG4gIH0pXG59XG5cbi8qKlxuICogRXhwb3NlIGEgbWV0aG9kIGZvciB0cmFuc2Zvcm1pbmcgdG9rZW5zIGludG8gdGhlIHBhdGggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvRnVuY3Rpb24gKHRva2Vucywgb3B0aW9ucykge1xuICAvLyBDb21waWxlIGFsbCB0aGUgdG9rZW5zIGludG8gcmVnZXhwcy5cbiAgdmFyIG1hdGNoZXMgPSBuZXcgQXJyYXkodG9rZW5zLmxlbmd0aCk7XG5cbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHBhdHRlcm5zIGJlZm9yZSBjb21waWxhdGlvbi5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1hdGNoZXNbaV0gPSBuZXcgUmVnRXhwKCdeKD86JyArIHRva2Vuc1tpXS5wYXR0ZXJuICsgJykkJywgZmxhZ3Mob3B0aW9ucykpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAob2JqLCBvcHRzKSB7XG4gICAgdmFyIHBhdGggPSAnJztcbiAgICB2YXIgZGF0YSA9IG9iaiB8fCB7fTtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdHMgfHwge307XG4gICAgdmFyIGVuY29kZSA9IG9wdGlvbnMucHJldHR5ID8gZW5jb2RlVVJJQ29tcG9uZW50UHJldHR5IDogZW5jb2RlVVJJQ29tcG9uZW50O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCArPSB0b2tlbjtcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW3Rva2VuLm5hbWVdO1xuICAgICAgdmFyIHNlZ21lbnQ7XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgIC8vIFByZXBlbmQgcGFydGlhbCBzZWdtZW50IHByZWZpeGVzLlxuICAgICAgICAgIGlmICh0b2tlbi5wYXJ0aWFsKSB7XG4gICAgICAgICAgICBwYXRoICs9IHRva2VuLnByZWZpeDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICghdG9rZW4ucmVwZWF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgcmVwZWF0LCBidXQgcmVjZWl2ZWQgYCcgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgKyAnYCcpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHNlZ21lbnQgPSBlbmNvZGUodmFsdWVbal0pO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBgJyArIEpTT04uc3RyaW5naWZ5KHNlZ21lbnQpICsgJ2AnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGggKz0gKGogPT09IDAgPyB0b2tlbi5wcmVmaXggOiB0b2tlbi5kZWxpbWl0ZXIpICsgc2VnbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgPSB0b2tlbi5hc3RlcmlzayA/IGVuY29kZUFzdGVyaXNrKHZhbHVlKSA6IGVuY29kZSh2YWx1ZSk7XG5cbiAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgfVxuXG4gICAgICBwYXRoICs9IHRva2VuLnByZWZpeCArIHNlZ21lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhcbiAgfVxufVxuXG4vKipcbiAqIEVzY2FwZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcL1xcXFxdKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBncm91cFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHshUmVnRXhwfSByZVxuICogQHBhcmFtICB7QXJyYXl9ICAga2V5c1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXM7XG4gIHJldHVybiByZVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmxhZ3MgZm9yIGEgcmVnZXhwIGZyb20gdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZsYWdzIChvcHRpb25zKSB7XG4gIHJldHVybiBvcHRpb25zICYmIG9wdGlvbnMuc2Vuc2l0aXZlID8gJycgOiAnaSdcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7IVJlZ0V4cH0gcGF0aFxuICogQHBhcmFtICB7IUFycmF5fSAga2V5c1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpO1xuXG4gIGlmIChncm91cHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgbmFtZTogaSxcbiAgICAgICAgcHJlZml4OiBudWxsLFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiBmYWxzZSxcbiAgICAgICAgcmVwZWF0OiBmYWxzZSxcbiAgICAgICAgcGFydGlhbDogZmFsc2UsXG4gICAgICAgIGFzdGVyaXNrOiBmYWxzZSxcbiAgICAgICAgcGF0dGVybjogbnVsbFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocGF0aCwga2V5cylcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gYXJyYXkgaW50byBhIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHshQXJyYXl9ICBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICBrZXlzXG4gKiBAcGFyYW0gIHshT2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHshUmVnRXhwfVxuICovXG5mdW5jdGlvbiBhcnJheVRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciBwYXJ0cyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2gocGF0aFRvUmVnZXhwKHBhdGhbaV0sIGtleXMsIG9wdGlvbnMpLnNvdXJjZSk7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnKD86JyArIHBhcnRzLmpvaW4oJ3wnKSArICcpJywgZmxhZ3Mob3B0aW9ucykpO1xuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlZ2V4cCwga2V5cylcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwYXRoIHJlZ2V4cCBmcm9tIHN0cmluZyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICBwYXRoXG4gKiBAcGFyYW0gIHshQXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHshT2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHshUmVnRXhwfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICByZXR1cm4gdG9rZW5zVG9SZWdFeHAocGFyc2UocGF0aCwgb3B0aW9ucyksIGtleXMsIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgZnVuY3Rpb24gZm9yIHRha2luZyB0b2tlbnMgYW5kIHJldHVybmluZyBhIFJlZ0V4cC5cbiAqXG4gKiBAcGFyYW0gIHshQXJyYXl9ICAgICAgICAgIHRva2Vuc1xuICogQHBhcmFtICB7KEFycmF5fE9iamVjdCk9fSBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3Q9fSAgICAgICAgIG9wdGlvbnNcbiAqIEByZXR1cm4geyFSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvUmVnRXhwICh0b2tlbnMsIGtleXMsIG9wdGlvbnMpIHtcbiAgaWYgKCFpc2FycmF5KGtleXMpKSB7XG4gICAgb3B0aW9ucyA9IC8qKiBAdHlwZSB7IU9iamVjdH0gKi8gKGtleXMgfHwgb3B0aW9ucyk7XG4gICAga2V5cyA9IFtdO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0O1xuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlO1xuICB2YXIgcm91dGUgPSAnJztcblxuICAvLyBJdGVyYXRlIG92ZXIgdGhlIHRva2VucyBhbmQgY3JlYXRlIG91ciByZWdleHAgc3RyaW5nLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByb3V0ZSArPSBlc2NhcGVTdHJpbmcodG9rZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcHJlZml4ID0gZXNjYXBlU3RyaW5nKHRva2VuLnByZWZpeCk7XG4gICAgICB2YXIgY2FwdHVyZSA9ICcoPzonICsgdG9rZW4ucGF0dGVybiArICcpJztcblxuICAgICAga2V5cy5wdXNoKHRva2VuKTtcblxuICAgICAgaWYgKHRva2VuLnJlcGVhdCkge1xuICAgICAgICBjYXB0dXJlICs9ICcoPzonICsgcHJlZml4ICsgY2FwdHVyZSArICcpKic7XG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICBpZiAoIXRva2VuLnBhcnRpYWwpIHtcbiAgICAgICAgICBjYXB0dXJlID0gJyg/OicgKyBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJykpPyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9IHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKT8nO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYXB0dXJlID0gcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpJztcbiAgICAgIH1cblxuICAgICAgcm91dGUgKz0gY2FwdHVyZTtcbiAgICB9XG4gIH1cblxuICB2YXIgZGVsaW1pdGVyID0gZXNjYXBlU3RyaW5nKG9wdGlvbnMuZGVsaW1pdGVyIHx8ICcvJyk7XG4gIHZhciBlbmRzV2l0aERlbGltaXRlciA9IHJvdXRlLnNsaWNlKC1kZWxpbWl0ZXIubGVuZ3RoKSA9PT0gZGVsaW1pdGVyO1xuXG4gIC8vIEluIG5vbi1zdHJpY3QgbW9kZSB3ZSBhbGxvdyBhIHNsYXNoIGF0IHRoZSBlbmQgb2YgbWF0Y2guIElmIHRoZSBwYXRoIHRvXG4gIC8vIG1hdGNoIGFscmVhZHkgZW5kcyB3aXRoIGEgc2xhc2gsIHdlIHJlbW92ZSBpdCBmb3IgY29uc2lzdGVuY3kuIFRoZSBzbGFzaFxuICAvLyBpcyB2YWxpZCBhdCB0aGUgZW5kIG9mIGEgcGF0aCBtYXRjaCwgbm90IGluIHRoZSBtaWRkbGUuIFRoaXMgaXMgaW1wb3J0YW50XG4gIC8vIGluIG5vbi1lbmRpbmcgbW9kZSwgd2hlcmUgXCIvdGVzdC9cIiBzaG91bGRuJ3QgbWF0Y2ggXCIvdGVzdC8vcm91dGVcIi5cbiAgaWYgKCFzdHJpY3QpIHtcbiAgICByb3V0ZSA9IChlbmRzV2l0aERlbGltaXRlciA/IHJvdXRlLnNsaWNlKDAsIC1kZWxpbWl0ZXIubGVuZ3RoKSA6IHJvdXRlKSArICcoPzonICsgZGVsaW1pdGVyICsgJyg/PSQpKT8nO1xuICB9XG5cbiAgaWYgKGVuZCkge1xuICAgIHJvdXRlICs9ICckJztcbiAgfSBlbHNlIHtcbiAgICAvLyBJbiBub24tZW5kaW5nIG1vZGUsIHdlIG5lZWQgdGhlIGNhcHR1cmluZyBncm91cHMgdG8gbWF0Y2ggYXMgbXVjaCBhc1xuICAgIC8vIHBvc3NpYmxlIGJ5IHVzaW5nIGEgcG9zaXRpdmUgbG9va2FoZWFkIHRvIHRoZSBlbmQgb3IgbmV4dCBwYXRoIHNlZ21lbnQuXG4gICAgcm91dGUgKz0gc3RyaWN0ICYmIGVuZHNXaXRoRGVsaW1pdGVyID8gJycgOiAnKD89JyArIGRlbGltaXRlciArICd8JCknO1xuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMobmV3IFJlZ0V4cCgnXicgKyByb3V0ZSwgZmxhZ3Mob3B0aW9ucykpLCBrZXlzKVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBjYW4gYmUgcGFzc2VkIGluIGZvciB0aGUga2V5cywgd2hpY2ggd2lsbCBob2xkIHRoZVxuICogcGxhY2Vob2xkZXIga2V5IGRlc2NyaXB0aW9ucy4gRm9yIGV4YW1wbGUsIHVzaW5nIGAvdXNlci86aWRgLCBga2V5c2Agd2lsbFxuICogY29udGFpbiBgW3sgbmFtZTogJ2lkJywgZGVsaW1pdGVyOiAnLycsIG9wdGlvbmFsOiBmYWxzZSwgcmVwZWF0OiBmYWxzZSB9XWAuXG4gKlxuICogQHBhcmFtICB7KHN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHsoQXJyYXl8T2JqZWN0KT19ICAgICAgIGtleXNcbiAqIEBwYXJhbSAge09iamVjdD19ICAgICAgICAgICAgICAgb3B0aW9uc1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcGF0aFRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIGlmICghaXNhcnJheShrZXlzKSkge1xuICAgIG9wdGlvbnMgPSAvKiogQHR5cGUgeyFPYmplY3R9ICovIChrZXlzIHx8IG9wdGlvbnMpO1xuICAgIGtleXMgPSBbXTtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuIHJlZ2V4cFRvUmVnZXhwKHBhdGgsIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoa2V5cykpXG4gIH1cblxuICBpZiAoaXNhcnJheShwYXRoKSkge1xuICAgIHJldHVybiBhcnJheVRvUmVnZXhwKC8qKiBAdHlwZSB7IUFycmF5fSAqLyAocGF0aCksIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoa2V5cyksIG9wdGlvbnMpXG4gIH1cblxuICByZXR1cm4gc3RyaW5nVG9SZWdleHAoLyoqIEB0eXBlIHtzdHJpbmd9ICovIChwYXRoKSwgLyoqIEB0eXBlIHshQXJyYXl9ICovIChrZXlzKSwgb3B0aW9ucylcbn1cbnBhdGhUb1JlZ2V4cF8xLnBhcnNlID0gcGFyc2VfMTtcbnBhdGhUb1JlZ2V4cF8xLmNvbXBpbGUgPSBjb21waWxlXzE7XG5wYXRoVG9SZWdleHBfMS50b2tlbnNUb0Z1bmN0aW9uID0gdG9rZW5zVG9GdW5jdGlvbl8xO1xucGF0aFRvUmVnZXhwXzEudG9rZW5zVG9SZWdFeHAgPSB0b2tlbnNUb1JlZ0V4cF8xO1xuXG4vKiAgKi9cblxuLy8gJGZsb3ctZGlzYWJsZS1saW5lXG52YXIgcmVnZXhwQ29tcGlsZUNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZnVuY3Rpb24gZmlsbFBhcmFtcyAoXG4gIHBhdGgsXG4gIHBhcmFtcyxcbiAgcm91dGVNc2dcbikge1xuICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gIHRyeSB7XG4gICAgdmFyIGZpbGxlciA9XG4gICAgICByZWdleHBDb21waWxlQ2FjaGVbcGF0aF0gfHxcbiAgICAgIChyZWdleHBDb21waWxlQ2FjaGVbcGF0aF0gPSBwYXRoVG9SZWdleHBfMS5jb21waWxlKHBhdGgpKTtcblxuICAgIC8vIEZpeCAjMjUwNSByZXNvbHZpbmcgYXN0ZXJpc2sgcm91dGVzIHsgbmFtZTogJ25vdC1mb3VuZCcsIHBhcmFtczogeyBwYXRoTWF0Y2g6ICcvbm90LWZvdW5kJyB9fVxuICAgIC8vIGFuZCBmaXggIzMxMDYgc28gdGhhdCB5b3UgY2FuIHdvcmsgd2l0aCBsb2NhdGlvbiBkZXNjcmlwdG9yIG9iamVjdCBoYXZpbmcgcGFyYW1zLnBhdGhNYXRjaCBlcXVhbCB0byBlbXB0eSBzdHJpbmdcbiAgICBpZiAodHlwZW9mIHBhcmFtcy5wYXRoTWF0Y2ggPT09ICdzdHJpbmcnKSB7IHBhcmFtc1swXSA9IHBhcmFtcy5wYXRoTWF0Y2g7IH1cblxuICAgIHJldHVybiBmaWxsZXIocGFyYW1zLCB7IHByZXR0eTogdHJ1ZSB9KVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIC8vIEZpeCAjMzA3MiBubyB3YXJuIGlmIGBwYXRoTWF0Y2hgIGlzIHN0cmluZ1xuICAgICAgd2Fybih0eXBlb2YgcGFyYW1zLnBhdGhNYXRjaCA9PT0gJ3N0cmluZycsIChcIm1pc3NpbmcgcGFyYW0gZm9yIFwiICsgcm91dGVNc2cgKyBcIjogXCIgKyAoZS5tZXNzYWdlKSkpO1xuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyBkZWxldGUgdGhlIDAgaWYgaXQgd2FzIGFkZGVkXG4gICAgZGVsZXRlIHBhcmFtc1swXTtcbiAgfVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTG9jYXRpb24gKFxuICByYXcsXG4gIGN1cnJlbnQsXG4gIGFwcGVuZCxcbiAgcm91dGVyXG4pIHtcbiAgdmFyIG5leHQgPSB0eXBlb2YgcmF3ID09PSAnc3RyaW5nJyA/IHsgcGF0aDogcmF3IH0gOiByYXc7XG4gIC8vIG5hbWVkIHRhcmdldFxuICBpZiAobmV4dC5fbm9ybWFsaXplZCkge1xuICAgIHJldHVybiBuZXh0XG4gIH0gZWxzZSBpZiAobmV4dC5uYW1lKSB7XG4gICAgbmV4dCA9IGV4dGVuZCh7fSwgcmF3KTtcbiAgICB2YXIgcGFyYW1zID0gbmV4dC5wYXJhbXM7XG4gICAgaWYgKHBhcmFtcyAmJiB0eXBlb2YgcGFyYW1zID09PSAnb2JqZWN0Jykge1xuICAgICAgbmV4dC5wYXJhbXMgPSBleHRlbmQoe30sIHBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0XG4gIH1cblxuICAvLyByZWxhdGl2ZSBwYXJhbXNcbiAgaWYgKCFuZXh0LnBhdGggJiYgbmV4dC5wYXJhbXMgJiYgY3VycmVudCkge1xuICAgIG5leHQgPSBleHRlbmQoe30sIG5leHQpO1xuICAgIG5leHQuX25vcm1hbGl6ZWQgPSB0cnVlO1xuICAgIHZhciBwYXJhbXMkMSA9IGV4dGVuZChleHRlbmQoe30sIGN1cnJlbnQucGFyYW1zKSwgbmV4dC5wYXJhbXMpO1xuICAgIGlmIChjdXJyZW50Lm5hbWUpIHtcbiAgICAgIG5leHQubmFtZSA9IGN1cnJlbnQubmFtZTtcbiAgICAgIG5leHQucGFyYW1zID0gcGFyYW1zJDE7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50Lm1hdGNoZWQubGVuZ3RoKSB7XG4gICAgICB2YXIgcmF3UGF0aCA9IGN1cnJlbnQubWF0Y2hlZFtjdXJyZW50Lm1hdGNoZWQubGVuZ3RoIC0gMV0ucGF0aDtcbiAgICAgIG5leHQucGF0aCA9IGZpbGxQYXJhbXMocmF3UGF0aCwgcGFyYW1zJDEsIChcInBhdGggXCIgKyAoY3VycmVudC5wYXRoKSkpO1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgd2FybihmYWxzZSwgXCJyZWxhdGl2ZSBwYXJhbXMgbmF2aWdhdGlvbiByZXF1aXJlcyBhIGN1cnJlbnQgcm91dGUuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dFxuICB9XG5cbiAgdmFyIHBhcnNlZFBhdGggPSBwYXJzZVBhdGgobmV4dC5wYXRoIHx8ICcnKTtcbiAgdmFyIGJhc2VQYXRoID0gKGN1cnJlbnQgJiYgY3VycmVudC5wYXRoKSB8fCAnLyc7XG4gIHZhciBwYXRoID0gcGFyc2VkUGF0aC5wYXRoXG4gICAgPyByZXNvbHZlUGF0aChwYXJzZWRQYXRoLnBhdGgsIGJhc2VQYXRoLCBhcHBlbmQgfHwgbmV4dC5hcHBlbmQpXG4gICAgOiBiYXNlUGF0aDtcblxuICB2YXIgcXVlcnkgPSByZXNvbHZlUXVlcnkoXG4gICAgcGFyc2VkUGF0aC5xdWVyeSxcbiAgICBuZXh0LnF1ZXJ5LFxuICAgIHJvdXRlciAmJiByb3V0ZXIub3B0aW9ucy5wYXJzZVF1ZXJ5XG4gICk7XG5cbiAgdmFyIGhhc2ggPSBuZXh0Lmhhc2ggfHwgcGFyc2VkUGF0aC5oYXNoO1xuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSB7XG4gICAgaGFzaCA9IFwiI1wiICsgaGFzaDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgX25vcm1hbGl6ZWQ6IHRydWUsXG4gICAgcGF0aDogcGF0aCxcbiAgICBxdWVyeTogcXVlcnksXG4gICAgaGFzaDogaGFzaFxuICB9XG59XG5cbi8qICAqL1xuXG4vLyB3b3JrIGFyb3VuZCB3ZWlyZCBmbG93IGJ1Z1xudmFyIHRvVHlwZXMgPSBbU3RyaW5nLCBPYmplY3RdO1xudmFyIGV2ZW50VHlwZXMgPSBbU3RyaW5nLCBBcnJheV07XG5cbnZhciBub29wID0gZnVuY3Rpb24gKCkge307XG5cbnZhciB3YXJuZWRDdXN0b21TbG90O1xudmFyIHdhcm5lZFRhZ1Byb3A7XG52YXIgd2FybmVkRXZlbnRQcm9wO1xuXG52YXIgTGluayA9IHtcbiAgbmFtZTogJ1JvdXRlckxpbmsnLFxuICBwcm9wczoge1xuICAgIHRvOiB7XG4gICAgICB0eXBlOiB0b1R5cGVzLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2EnXG4gICAgfSxcbiAgICBjdXN0b206IEJvb2xlYW4sXG4gICAgZXhhY3Q6IEJvb2xlYW4sXG4gICAgZXhhY3RQYXRoOiBCb29sZWFuLFxuICAgIGFwcGVuZDogQm9vbGVhbixcbiAgICByZXBsYWNlOiBCb29sZWFuLFxuICAgIGFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXhhY3RBY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGFyaWFDdXJyZW50VmFsdWU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdwYWdlJ1xuICAgIH0sXG4gICAgZXZlbnQ6IHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZXMsXG4gICAgICBkZWZhdWx0OiAnY2xpY2snXG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoaCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMuJHJvdXRlcjtcbiAgICB2YXIgY3VycmVudCA9IHRoaXMuJHJvdXRlO1xuICAgIHZhciByZWYgPSByb3V0ZXIucmVzb2x2ZShcbiAgICAgIHRoaXMudG8sXG4gICAgICBjdXJyZW50LFxuICAgICAgdGhpcy5hcHBlbmRcbiAgICApO1xuICAgIHZhciBsb2NhdGlvbiA9IHJlZi5sb2NhdGlvbjtcbiAgICB2YXIgcm91dGUgPSByZWYucm91dGU7XG4gICAgdmFyIGhyZWYgPSByZWYuaHJlZjtcblxuICAgIHZhciBjbGFzc2VzID0ge307XG4gICAgdmFyIGdsb2JhbEFjdGl2ZUNsYXNzID0gcm91dGVyLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzO1xuICAgIHZhciBnbG9iYWxFeGFjdEFjdGl2ZUNsYXNzID0gcm91dGVyLm9wdGlvbnMubGlua0V4YWN0QWN0aXZlQ2xhc3M7XG4gICAgLy8gU3VwcG9ydCBnbG9iYWwgZW1wdHkgYWN0aXZlIGNsYXNzXG4gICAgdmFyIGFjdGl2ZUNsYXNzRmFsbGJhY2sgPVxuICAgICAgZ2xvYmFsQWN0aXZlQ2xhc3MgPT0gbnVsbCA/ICdyb3V0ZXItbGluay1hY3RpdmUnIDogZ2xvYmFsQWN0aXZlQ2xhc3M7XG4gICAgdmFyIGV4YWN0QWN0aXZlQ2xhc3NGYWxsYmFjayA9XG4gICAgICBnbG9iYWxFeGFjdEFjdGl2ZUNsYXNzID09IG51bGxcbiAgICAgICAgPyAncm91dGVyLWxpbmstZXhhY3QtYWN0aXZlJ1xuICAgICAgICA6IGdsb2JhbEV4YWN0QWN0aXZlQ2xhc3M7XG4gICAgdmFyIGFjdGl2ZUNsYXNzID1cbiAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPT0gbnVsbCA/IGFjdGl2ZUNsYXNzRmFsbGJhY2sgOiB0aGlzLmFjdGl2ZUNsYXNzO1xuICAgIHZhciBleGFjdEFjdGl2ZUNsYXNzID1cbiAgICAgIHRoaXMuZXhhY3RBY3RpdmVDbGFzcyA9PSBudWxsXG4gICAgICAgID8gZXhhY3RBY3RpdmVDbGFzc0ZhbGxiYWNrXG4gICAgICAgIDogdGhpcy5leGFjdEFjdGl2ZUNsYXNzO1xuXG4gICAgdmFyIGNvbXBhcmVUYXJnZXQgPSByb3V0ZS5yZWRpcmVjdGVkRnJvbVxuICAgICAgPyBjcmVhdGVSb3V0ZShudWxsLCBub3JtYWxpemVMb2NhdGlvbihyb3V0ZS5yZWRpcmVjdGVkRnJvbSksIG51bGwsIHJvdXRlcilcbiAgICAgIDogcm91dGU7XG5cbiAgICBjbGFzc2VzW2V4YWN0QWN0aXZlQ2xhc3NdID0gaXNTYW1lUm91dGUoY3VycmVudCwgY29tcGFyZVRhcmdldCwgdGhpcy5leGFjdFBhdGgpO1xuICAgIGNsYXNzZXNbYWN0aXZlQ2xhc3NdID0gdGhpcy5leGFjdCB8fCB0aGlzLmV4YWN0UGF0aFxuICAgICAgPyBjbGFzc2VzW2V4YWN0QWN0aXZlQ2xhc3NdXG4gICAgICA6IGlzSW5jbHVkZWRSb3V0ZShjdXJyZW50LCBjb21wYXJlVGFyZ2V0KTtcblxuICAgIHZhciBhcmlhQ3VycmVudFZhbHVlID0gY2xhc3Nlc1tleGFjdEFjdGl2ZUNsYXNzXSA/IHRoaXMuYXJpYUN1cnJlbnRWYWx1ZSA6IG51bGw7XG5cbiAgICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoZ3VhcmRFdmVudChlKSkge1xuICAgICAgICBpZiAodGhpcyQxLnJlcGxhY2UpIHtcbiAgICAgICAgICByb3V0ZXIucmVwbGFjZShsb2NhdGlvbiwgbm9vcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcm91dGVyLnB1c2gobG9jYXRpb24sIG5vb3ApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBvbiA9IHsgY2xpY2s6IGd1YXJkRXZlbnQgfTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50KSkge1xuICAgICAgdGhpcy5ldmVudC5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIG9uW2VdID0gaGFuZGxlcjtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBvblt0aGlzLmV2ZW50XSA9IGhhbmRsZXI7XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSB7IGNsYXNzOiBjbGFzc2VzIH07XG5cbiAgICB2YXIgc2NvcGVkU2xvdCA9XG4gICAgICAhdGhpcy4kc2NvcGVkU2xvdHMuJGhhc05vcm1hbCAmJlxuICAgICAgdGhpcy4kc2NvcGVkU2xvdHMuZGVmYXVsdCAmJlxuICAgICAgdGhpcy4kc2NvcGVkU2xvdHMuZGVmYXVsdCh7XG4gICAgICAgIGhyZWY6IGhyZWYsXG4gICAgICAgIHJvdXRlOiByb3V0ZSxcbiAgICAgICAgbmF2aWdhdGU6IGhhbmRsZXIsXG4gICAgICAgIGlzQWN0aXZlOiBjbGFzc2VzW2FjdGl2ZUNsYXNzXSxcbiAgICAgICAgaXNFeGFjdEFjdGl2ZTogY2xhc3Nlc1tleGFjdEFjdGl2ZUNsYXNzXVxuICAgICAgfSk7XG5cbiAgICBpZiAoc2NvcGVkU2xvdCkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgIXRoaXMuY3VzdG9tKSB7XG4gICAgICAgICF3YXJuZWRDdXN0b21TbG90ICYmIHdhcm4oZmFsc2UsICdJbiBWdWUgUm91dGVyIDQsIHRoZSB2LXNsb3QgQVBJIHdpbGwgYnkgZGVmYXVsdCB3cmFwIGl0cyBjb250ZW50IHdpdGggYW4gPGE+IGVsZW1lbnQuIFVzZSB0aGUgY3VzdG9tIHByb3AgdG8gcmVtb3ZlIHRoaXMgd2FybmluZzpcXG48cm91dGVyLWxpbmsgdi1zbG90PVwieyBuYXZpZ2F0ZSwgaHJlZiB9XCIgY3VzdG9tPjwvcm91dGVyLWxpbms+XFxuJyk7XG4gICAgICAgIHdhcm5lZEN1c3RvbVNsb3QgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHNjb3BlZFNsb3QubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBzY29wZWRTbG90WzBdXG4gICAgICB9IGVsc2UgaWYgKHNjb3BlZFNsb3QubGVuZ3RoID4gMSB8fCAhc2NvcGVkU2xvdC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAoXCI8cm91dGVyLWxpbms+IHdpdGggdG89XFxcIlwiICsgKHRoaXMudG8pICsgXCJcXFwiIGlzIHRyeWluZyB0byB1c2UgYSBzY29wZWQgc2xvdCBidXQgaXQgZGlkbid0IHByb3ZpZGUgZXhhY3RseSBvbmUgY2hpbGQuIFdyYXBwaW5nIHRoZSBjb250ZW50IHdpdGggYSBzcGFuIGVsZW1lbnQuXCIpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NvcGVkU2xvdC5sZW5ndGggPT09IDAgPyBoKCkgOiBoKCdzcGFuJywge30sIHNjb3BlZFNsb3QpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGlmICgndGFnJyBpbiB0aGlzLiRvcHRpb25zLnByb3BzRGF0YSAmJiAhd2FybmVkVGFnUHJvcCkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIFwiPHJvdXRlci1saW5rPidzIHRhZyBwcm9wIGlzIGRlcHJlY2F0ZWQgYW5kIGhhcyBiZWVuIHJlbW92ZWQgaW4gVnVlIFJvdXRlciA0LiBVc2UgdGhlIHYtc2xvdCBBUEkgdG8gcmVtb3ZlIHRoaXMgd2FybmluZzogaHR0cHM6Ly9uZXh0LnJvdXRlci52dWVqcy5vcmcvZ3VpZGUvbWlncmF0aW9uLyNyZW1vdmFsLW9mLWV2ZW50LWFuZC10YWctcHJvcHMtaW4tcm91dGVyLWxpbmsuXCJcbiAgICAgICAgKTtcbiAgICAgICAgd2FybmVkVGFnUHJvcCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoJ2V2ZW50JyBpbiB0aGlzLiRvcHRpb25zLnByb3BzRGF0YSAmJiAhd2FybmVkRXZlbnRQcm9wKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgXCI8cm91dGVyLWxpbms+J3MgZXZlbnQgcHJvcCBpcyBkZXByZWNhdGVkIGFuZCBoYXMgYmVlbiByZW1vdmVkIGluIFZ1ZSBSb3V0ZXIgNC4gVXNlIHRoZSB2LXNsb3QgQVBJIHRvIHJlbW92ZSB0aGlzIHdhcm5pbmc6IGh0dHBzOi8vbmV4dC5yb3V0ZXIudnVlanMub3JnL2d1aWRlL21pZ3JhdGlvbi8jcmVtb3ZhbC1vZi1ldmVudC1hbmQtdGFnLXByb3BzLWluLXJvdXRlci1saW5rLlwiXG4gICAgICAgICk7XG4gICAgICAgIHdhcm5lZEV2ZW50UHJvcCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGFnID09PSAnYScpIHtcbiAgICAgIGRhdGEub24gPSBvbjtcbiAgICAgIGRhdGEuYXR0cnMgPSB7IGhyZWY6IGhyZWYsICdhcmlhLWN1cnJlbnQnOiBhcmlhQ3VycmVudFZhbHVlIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IDxhPiBjaGlsZCBhbmQgYXBwbHkgbGlzdGVuZXIgYW5kIGhyZWZcbiAgICAgIHZhciBhID0gZmluZEFuY2hvcih0aGlzLiRzbG90cy5kZWZhdWx0KTtcbiAgICAgIGlmIChhKSB7XG4gICAgICAgIC8vIGluIGNhc2UgdGhlIDxhPiBpcyBhIHN0YXRpYyBub2RlXG4gICAgICAgIGEuaXNTdGF0aWMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGFEYXRhID0gKGEuZGF0YSA9IGV4dGVuZCh7fSwgYS5kYXRhKSk7XG4gICAgICAgIGFEYXRhLm9uID0gYURhdGEub24gfHwge307XG4gICAgICAgIC8vIHRyYW5zZm9ybSBleGlzdGluZyBldmVudHMgaW4gYm90aCBvYmplY3RzIGludG8gYXJyYXlzIHNvIHdlIGNhbiBwdXNoIGxhdGVyXG4gICAgICAgIGZvciAodmFyIGV2ZW50IGluIGFEYXRhLm9uKSB7XG4gICAgICAgICAgdmFyIGhhbmRsZXIkMSA9IGFEYXRhLm9uW2V2ZW50XTtcbiAgICAgICAgICBpZiAoZXZlbnQgaW4gb24pIHtcbiAgICAgICAgICAgIGFEYXRhLm9uW2V2ZW50XSA9IEFycmF5LmlzQXJyYXkoaGFuZGxlciQxKSA/IGhhbmRsZXIkMSA6IFtoYW5kbGVyJDFdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBhcHBlbmQgbmV3IGxpc3RlbmVycyBmb3Igcm91dGVyLWxpbmtcbiAgICAgICAgZm9yICh2YXIgZXZlbnQkMSBpbiBvbikge1xuICAgICAgICAgIGlmIChldmVudCQxIGluIGFEYXRhLm9uKSB7XG4gICAgICAgICAgICAvLyBvbltldmVudF0gaXMgYWx3YXlzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgIGFEYXRhLm9uW2V2ZW50JDFdLnB1c2gob25bZXZlbnQkMV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhRGF0YS5vbltldmVudCQxXSA9IGhhbmRsZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFBdHRycyA9IChhLmRhdGEuYXR0cnMgPSBleHRlbmQoe30sIGEuZGF0YS5hdHRycykpO1xuICAgICAgICBhQXR0cnMuaHJlZiA9IGhyZWY7XG4gICAgICAgIGFBdHRyc1snYXJpYS1jdXJyZW50J10gPSBhcmlhQ3VycmVudFZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9lc24ndCBoYXZlIDxhPiBjaGlsZCwgYXBwbHkgbGlzdGVuZXIgdG8gc2VsZlxuICAgICAgICBkYXRhLm9uID0gb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGgodGhpcy50YWcsIGRhdGEsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH1cbn07XG5cbmZ1bmN0aW9uIGd1YXJkRXZlbnQgKGUpIHtcbiAgLy8gZG9uJ3QgcmVkaXJlY3Qgd2l0aCBjb250cm9sIGtleXNcbiAgaWYgKGUubWV0YUtleSB8fCBlLmFsdEtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgeyByZXR1cm4gfVxuICAvLyBkb24ndCByZWRpcmVjdCB3aGVuIHByZXZlbnREZWZhdWx0IGNhbGxlZFxuICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybiB9XG4gIC8vIGRvbid0IHJlZGlyZWN0IG9uIHJpZ2h0IGNsaWNrXG4gIGlmIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSB7IHJldHVybiB9XG4gIC8vIGRvbid0IHJlZGlyZWN0IGlmIGB0YXJnZXQ9XCJfYmxhbmtcImBcbiAgaWYgKGUuY3VycmVudFRhcmdldCAmJiBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpO1xuICAgIGlmICgvXFxiX2JsYW5rXFxiL2kudGVzdCh0YXJnZXQpKSB7IHJldHVybiB9XG4gIH1cbiAgLy8gdGhpcyBtYXkgYmUgYSBXZWV4IGV2ZW50IHdoaWNoIGRvZXNuJ3QgaGF2ZSB0aGlzIG1ldGhvZFxuICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBmaW5kQW5jaG9yIChjaGlsZHJlbikge1xuICBpZiAoY2hpbGRyZW4pIHtcbiAgICB2YXIgY2hpbGQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmIChjaGlsZC50YWcgPT09ICdhJykge1xuICAgICAgICByZXR1cm4gY2hpbGRcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZC5jaGlsZHJlbiAmJiAoY2hpbGQgPSBmaW5kQW5jaG9yKGNoaWxkLmNoaWxkcmVuKSkpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnZhciBfVnVlO1xuXG5mdW5jdGlvbiBpbnN0YWxsIChWdWUpIHtcbiAgaWYgKGluc3RhbGwuaW5zdGFsbGVkICYmIF9WdWUgPT09IFZ1ZSkgeyByZXR1cm4gfVxuICBpbnN0YWxsLmluc3RhbGxlZCA9IHRydWU7XG5cbiAgX1Z1ZSA9IFZ1ZTtcblxuICB2YXIgaXNEZWYgPSBmdW5jdGlvbiAodikgeyByZXR1cm4gdiAhPT0gdW5kZWZpbmVkOyB9O1xuXG4gIHZhciByZWdpc3Rlckluc3RhbmNlID0gZnVuY3Rpb24gKHZtLCBjYWxsVmFsKSB7XG4gICAgdmFyIGkgPSB2bS4kb3B0aW9ucy5fcGFyZW50Vm5vZGU7XG4gICAgaWYgKGlzRGVmKGkpICYmIGlzRGVmKGkgPSBpLmRhdGEpICYmIGlzRGVmKGkgPSBpLnJlZ2lzdGVyUm91dGVJbnN0YW5jZSkpIHtcbiAgICAgIGkodm0sIGNhbGxWYWwpO1xuICAgIH1cbiAgfTtcblxuICBWdWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZTogZnVuY3Rpb24gYmVmb3JlQ3JlYXRlICgpIHtcbiAgICAgIGlmIChpc0RlZih0aGlzLiRvcHRpb25zLnJvdXRlcikpIHtcbiAgICAgICAgdGhpcy5fcm91dGVyUm9vdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3JvdXRlciA9IHRoaXMuJG9wdGlvbnMucm91dGVyO1xuICAgICAgICB0aGlzLl9yb3V0ZXIuaW5pdCh0aGlzKTtcbiAgICAgICAgVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUodGhpcywgJ19yb3V0ZScsIHRoaXMuX3JvdXRlci5oaXN0b3J5LmN1cnJlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcm91dGVyUm9vdCA9ICh0aGlzLiRwYXJlbnQgJiYgdGhpcy4kcGFyZW50Ll9yb3V0ZXJSb290KSB8fCB0aGlzO1xuICAgICAgfVxuICAgICAgcmVnaXN0ZXJJbnN0YW5jZSh0aGlzLCB0aGlzKTtcbiAgICB9LFxuICAgIGRlc3Ryb3llZDogZnVuY3Rpb24gZGVzdHJveWVkICgpIHtcbiAgICAgIHJlZ2lzdGVySW5zdGFuY2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRyb3V0ZXInLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQgKCkgeyByZXR1cm4gdGhpcy5fcm91dGVyUm9vdC5fcm91dGVyIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFZ1ZS5wcm90b3R5cGUsICckcm91dGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQgKCkgeyByZXR1cm4gdGhpcy5fcm91dGVyUm9vdC5fcm91dGUgfVxuICB9KTtcblxuICBWdWUuY29tcG9uZW50KCdSb3V0ZXJWaWV3JywgVmlldyk7XG4gIFZ1ZS5jb21wb25lbnQoJ1JvdXRlckxpbmsnLCBMaW5rKTtcblxuICB2YXIgc3RyYXRzID0gVnVlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXM7XG4gIC8vIHVzZSB0aGUgc2FtZSBob29rIG1lcmdpbmcgc3RyYXRlZ3kgZm9yIHJvdXRlIGhvb2tzXG4gIHN0cmF0cy5iZWZvcmVSb3V0ZUVudGVyID0gc3RyYXRzLmJlZm9yZVJvdXRlTGVhdmUgPSBzdHJhdHMuYmVmb3JlUm91dGVVcGRhdGUgPSBzdHJhdHMuY3JlYXRlZDtcbn1cblxuLyogICovXG5cbnZhciBpbkJyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcblxuLyogICovXG5cbmZ1bmN0aW9uIGNyZWF0ZVJvdXRlTWFwIChcbiAgcm91dGVzLFxuICBvbGRQYXRoTGlzdCxcbiAgb2xkUGF0aE1hcCxcbiAgb2xkTmFtZU1hcCxcbiAgcGFyZW50Um91dGVcbikge1xuICAvLyB0aGUgcGF0aCBsaXN0IGlzIHVzZWQgdG8gY29udHJvbCBwYXRoIG1hdGNoaW5nIHByaW9yaXR5XG4gIHZhciBwYXRoTGlzdCA9IG9sZFBhdGhMaXN0IHx8IFtdO1xuICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgdmFyIHBhdGhNYXAgPSBvbGRQYXRoTWFwIHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIC8vICRmbG93LWRpc2FibGUtbGluZVxuICB2YXIgbmFtZU1hcCA9IG9sZE5hbWVNYXAgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByb3V0ZXMuZm9yRWFjaChmdW5jdGlvbiAocm91dGUpIHtcbiAgICBhZGRSb3V0ZVJlY29yZChwYXRoTGlzdCwgcGF0aE1hcCwgbmFtZU1hcCwgcm91dGUsIHBhcmVudFJvdXRlKTtcbiAgfSk7XG5cbiAgLy8gZW5zdXJlIHdpbGRjYXJkIHJvdXRlcyBhcmUgYWx3YXlzIGF0IHRoZSBlbmRcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXRoTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAocGF0aExpc3RbaV0gPT09ICcqJykge1xuICAgICAgcGF0aExpc3QucHVzaChwYXRoTGlzdC5zcGxpY2UoaSwgMSlbMF0pO1xuICAgICAgbC0tO1xuICAgICAgaS0tO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgIC8vIHdhcm4gaWYgcm91dGVzIGRvIG5vdCBpbmNsdWRlIGxlYWRpbmcgc2xhc2hlc1xuICAgIHZhciBmb3VuZCA9IHBhdGhMaXN0XG4gICAgLy8gY2hlY2sgZm9yIG1pc3NpbmcgbGVhZGluZyBzbGFzaFxuICAgICAgLmZpbHRlcihmdW5jdGlvbiAocGF0aCkgeyByZXR1cm4gcGF0aCAmJiBwYXRoLmNoYXJBdCgwKSAhPT0gJyonICYmIHBhdGguY2hhckF0KDApICE9PSAnLyc7IH0pO1xuXG4gICAgaWYgKGZvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBwYXRoTmFtZXMgPSBmb3VuZC5tYXAoZnVuY3Rpb24gKHBhdGgpIHsgcmV0dXJuIChcIi0gXCIgKyBwYXRoKTsgfSkuam9pbignXFxuJyk7XG4gICAgICB3YXJuKGZhbHNlLCAoXCJOb24tbmVzdGVkIHJvdXRlcyBtdXN0IGluY2x1ZGUgYSBsZWFkaW5nIHNsYXNoIGNoYXJhY3Rlci4gRml4IHRoZSBmb2xsb3dpbmcgcm91dGVzOiBcXG5cIiArIHBhdGhOYW1lcykpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aExpc3Q6IHBhdGhMaXN0LFxuICAgIHBhdGhNYXA6IHBhdGhNYXAsXG4gICAgbmFtZU1hcDogbmFtZU1hcFxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFJvdXRlUmVjb3JkIChcbiAgcGF0aExpc3QsXG4gIHBhdGhNYXAsXG4gIG5hbWVNYXAsXG4gIHJvdXRlLFxuICBwYXJlbnQsXG4gIG1hdGNoQXNcbikge1xuICB2YXIgcGF0aCA9IHJvdXRlLnBhdGg7XG4gIHZhciBuYW1lID0gcm91dGUubmFtZTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBhc3NlcnQocGF0aCAhPSBudWxsLCBcIlxcXCJwYXRoXFxcIiBpcyByZXF1aXJlZCBpbiBhIHJvdXRlIGNvbmZpZ3VyYXRpb24uXCIpO1xuICAgIGFzc2VydChcbiAgICAgIHR5cGVvZiByb3V0ZS5jb21wb25lbnQgIT09ICdzdHJpbmcnLFxuICAgICAgXCJyb3V0ZSBjb25maWcgXFxcImNvbXBvbmVudFxcXCIgZm9yIHBhdGg6IFwiICsgKFN0cmluZyhcbiAgICAgICAgcGF0aCB8fCBuYW1lXG4gICAgICApKSArIFwiIGNhbm5vdCBiZSBhIFwiICsgXCJzdHJpbmcgaWQuIFVzZSBhbiBhY3R1YWwgY29tcG9uZW50IGluc3RlYWQuXCJcbiAgICApO1xuXG4gICAgd2FybihcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gICAgICAhL1teXFx1MDAwMC1cXHUwMDdGXSsvLnRlc3QocGF0aCksXG4gICAgICBcIlJvdXRlIHdpdGggcGF0aCBcXFwiXCIgKyBwYXRoICsgXCJcXFwiIGNvbnRhaW5zIHVuZW5jb2RlZCBjaGFyYWN0ZXJzLCBtYWtlIHN1cmUgXCIgK1xuICAgICAgICBcInlvdXIgcGF0aCBpcyBjb3JyZWN0bHkgZW5jb2RlZCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUgcm91dGVyLiBVc2UgXCIgK1xuICAgICAgICBcImVuY29kZVVSSSB0byBlbmNvZGUgc3RhdGljIHNlZ21lbnRzIG9mIHlvdXIgcGF0aC5cIlxuICAgICk7XG4gIH1cblxuICB2YXIgcGF0aFRvUmVnZXhwT3B0aW9ucyA9XG4gICAgcm91dGUucGF0aFRvUmVnZXhwT3B0aW9ucyB8fCB7fTtcbiAgdmFyIG5vcm1hbGl6ZWRQYXRoID0gbm9ybWFsaXplUGF0aChwYXRoLCBwYXJlbnQsIHBhdGhUb1JlZ2V4cE9wdGlvbnMuc3RyaWN0KTtcblxuICBpZiAodHlwZW9mIHJvdXRlLmNhc2VTZW5zaXRpdmUgPT09ICdib29sZWFuJykge1xuICAgIHBhdGhUb1JlZ2V4cE9wdGlvbnMuc2Vuc2l0aXZlID0gcm91dGUuY2FzZVNlbnNpdGl2ZTtcbiAgfVxuXG4gIHZhciByZWNvcmQgPSB7XG4gICAgcGF0aDogbm9ybWFsaXplZFBhdGgsXG4gICAgcmVnZXg6IGNvbXBpbGVSb3V0ZVJlZ2V4KG5vcm1hbGl6ZWRQYXRoLCBwYXRoVG9SZWdleHBPcHRpb25zKSxcbiAgICBjb21wb25lbnRzOiByb3V0ZS5jb21wb25lbnRzIHx8IHsgZGVmYXVsdDogcm91dGUuY29tcG9uZW50IH0sXG4gICAgYWxpYXM6IHJvdXRlLmFsaWFzXG4gICAgICA/IHR5cGVvZiByb3V0ZS5hbGlhcyA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBbcm91dGUuYWxpYXNdXG4gICAgICAgIDogcm91dGUuYWxpYXNcbiAgICAgIDogW10sXG4gICAgaW5zdGFuY2VzOiB7fSxcbiAgICBlbnRlcmVkQ2JzOiB7fSxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHBhcmVudDogcGFyZW50LFxuICAgIG1hdGNoQXM6IG1hdGNoQXMsXG4gICAgcmVkaXJlY3Q6IHJvdXRlLnJlZGlyZWN0LFxuICAgIGJlZm9yZUVudGVyOiByb3V0ZS5iZWZvcmVFbnRlcixcbiAgICBtZXRhOiByb3V0ZS5tZXRhIHx8IHt9LFxuICAgIHByb3BzOlxuICAgICAgcm91dGUucHJvcHMgPT0gbnVsbFxuICAgICAgICA/IHt9XG4gICAgICAgIDogcm91dGUuY29tcG9uZW50c1xuICAgICAgICAgID8gcm91dGUucHJvcHNcbiAgICAgICAgICA6IHsgZGVmYXVsdDogcm91dGUucHJvcHMgfVxuICB9O1xuXG4gIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgIC8vIFdhcm4gaWYgcm91dGUgaXMgbmFtZWQsIGRvZXMgbm90IHJlZGlyZWN0IGFuZCBoYXMgYSBkZWZhdWx0IGNoaWxkIHJvdXRlLlxuICAgIC8vIElmIHVzZXJzIG5hdmlnYXRlIHRvIHRoaXMgcm91dGUgYnkgbmFtZSwgdGhlIGRlZmF1bHQgY2hpbGQgd2lsbFxuICAgIC8vIG5vdCBiZSByZW5kZXJlZCAoR0ggSXNzdWUgIzYyOSlcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKFxuICAgICAgICByb3V0ZS5uYW1lICYmXG4gICAgICAgICFyb3V0ZS5yZWRpcmVjdCAmJlxuICAgICAgICByb3V0ZS5jaGlsZHJlbi5zb21lKGZ1bmN0aW9uIChjaGlsZCkgeyByZXR1cm4gL15cXC8/JC8udGVzdChjaGlsZC5wYXRoKTsgfSlcbiAgICAgICkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIFwiTmFtZWQgUm91dGUgJ1wiICsgKHJvdXRlLm5hbWUpICsgXCInIGhhcyBhIGRlZmF1bHQgY2hpbGQgcm91dGUuIFwiICtcbiAgICAgICAgICAgIFwiV2hlbiBuYXZpZ2F0aW5nIHRvIHRoaXMgbmFtZWQgcm91dGUgKDp0bz1cXFwie25hbWU6ICdcIiArIChyb3V0ZS5uYW1lKSArIFwiJ1xcXCIpLCBcIiArXG4gICAgICAgICAgICBcInRoZSBkZWZhdWx0IGNoaWxkIHJvdXRlIHdpbGwgbm90IGJlIHJlbmRlcmVkLiBSZW1vdmUgdGhlIG5hbWUgZnJvbSBcIiArXG4gICAgICAgICAgICBcInRoaXMgcm91dGUgYW5kIHVzZSB0aGUgbmFtZSBvZiB0aGUgZGVmYXVsdCBjaGlsZCByb3V0ZSBmb3IgbmFtZWQgXCIgK1xuICAgICAgICAgICAgXCJsaW5rcyBpbnN0ZWFkLlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJvdXRlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICB2YXIgY2hpbGRNYXRjaEFzID0gbWF0Y2hBc1xuICAgICAgICA/IGNsZWFuUGF0aCgobWF0Y2hBcyArIFwiL1wiICsgKGNoaWxkLnBhdGgpKSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICBhZGRSb3V0ZVJlY29yZChwYXRoTGlzdCwgcGF0aE1hcCwgbmFtZU1hcCwgY2hpbGQsIHJlY29yZCwgY2hpbGRNYXRjaEFzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICghcGF0aE1hcFtyZWNvcmQucGF0aF0pIHtcbiAgICBwYXRoTGlzdC5wdXNoKHJlY29yZC5wYXRoKTtcbiAgICBwYXRoTWFwW3JlY29yZC5wYXRoXSA9IHJlY29yZDtcbiAgfVxuXG4gIGlmIChyb3V0ZS5hbGlhcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGFsaWFzZXMgPSBBcnJheS5pc0FycmF5KHJvdXRlLmFsaWFzKSA/IHJvdXRlLmFsaWFzIDogW3JvdXRlLmFsaWFzXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBhbGlhcyA9IGFsaWFzZXNbaV07XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBhbGlhcyA9PT0gcGF0aCkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIChcIkZvdW5kIGFuIGFsaWFzIHdpdGggdGhlIHNhbWUgdmFsdWUgYXMgdGhlIHBhdGg6IFxcXCJcIiArIHBhdGggKyBcIlxcXCIuIFlvdSBoYXZlIHRvIHJlbW92ZSB0aGF0IGFsaWFzLiBJdCB3aWxsIGJlIGlnbm9yZWQgaW4gZGV2ZWxvcG1lbnQuXCIpXG4gICAgICAgICk7XG4gICAgICAgIC8vIHNraXAgaW4gZGV2IHRvIG1ha2UgaXQgd29ya1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgYWxpYXNSb3V0ZSA9IHtcbiAgICAgICAgcGF0aDogYWxpYXMsXG4gICAgICAgIGNoaWxkcmVuOiByb3V0ZS5jaGlsZHJlblxuICAgICAgfTtcbiAgICAgIGFkZFJvdXRlUmVjb3JkKFxuICAgICAgICBwYXRoTGlzdCxcbiAgICAgICAgcGF0aE1hcCxcbiAgICAgICAgbmFtZU1hcCxcbiAgICAgICAgYWxpYXNSb3V0ZSxcbiAgICAgICAgcGFyZW50LFxuICAgICAgICByZWNvcmQucGF0aCB8fCAnLycgLy8gbWF0Y2hBc1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBpZiAobmFtZSkge1xuICAgIGlmICghbmFtZU1hcFtuYW1lXSkge1xuICAgICAgbmFtZU1hcFtuYW1lXSA9IHJlY29yZDtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgIW1hdGNoQXMpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBcIkR1cGxpY2F0ZSBuYW1lZCByb3V0ZXMgZGVmaW5pdGlvbjogXCIgK1xuICAgICAgICAgIFwieyBuYW1lOiBcXFwiXCIgKyBuYW1lICsgXCJcXFwiLCBwYXRoOiBcXFwiXCIgKyAocmVjb3JkLnBhdGgpICsgXCJcXFwiIH1cIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcGlsZVJvdXRlUmVnZXggKFxuICBwYXRoLFxuICBwYXRoVG9SZWdleHBPcHRpb25zXG4pIHtcbiAgdmFyIHJlZ2V4ID0gcGF0aFRvUmVnZXhwXzEocGF0aCwgW10sIHBhdGhUb1JlZ2V4cE9wdGlvbnMpO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICByZWdleC5rZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgd2FybihcbiAgICAgICAgIWtleXNba2V5Lm5hbWVdLFxuICAgICAgICAoXCJEdXBsaWNhdGUgcGFyYW0ga2V5cyBpbiByb3V0ZSB3aXRoIHBhdGg6IFxcXCJcIiArIHBhdGggKyBcIlxcXCJcIilcbiAgICAgICk7XG4gICAgICBrZXlzW2tleS5uYW1lXSA9IHRydWU7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJlZ2V4XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGggKFxuICBwYXRoLFxuICBwYXJlbnQsXG4gIHN0cmljdFxuKSB7XG4gIGlmICghc3RyaWN0KSB7IHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLyQvLCAnJyk7IH1cbiAgaWYgKHBhdGhbMF0gPT09ICcvJykgeyByZXR1cm4gcGF0aCB9XG4gIGlmIChwYXJlbnQgPT0gbnVsbCkgeyByZXR1cm4gcGF0aCB9XG4gIHJldHVybiBjbGVhblBhdGgoKChwYXJlbnQucGF0aCkgKyBcIi9cIiArIHBhdGgpKVxufVxuXG4vKiAgKi9cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZU1hdGNoZXIgKFxuICByb3V0ZXMsXG4gIHJvdXRlclxuKSB7XG4gIHZhciByZWYgPSBjcmVhdGVSb3V0ZU1hcChyb3V0ZXMpO1xuICB2YXIgcGF0aExpc3QgPSByZWYucGF0aExpc3Q7XG4gIHZhciBwYXRoTWFwID0gcmVmLnBhdGhNYXA7XG4gIHZhciBuYW1lTWFwID0gcmVmLm5hbWVNYXA7XG5cbiAgZnVuY3Rpb24gYWRkUm91dGVzIChyb3V0ZXMpIHtcbiAgICBjcmVhdGVSb3V0ZU1hcChyb3V0ZXMsIHBhdGhMaXN0LCBwYXRoTWFwLCBuYW1lTWFwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFJvdXRlIChwYXJlbnRPclJvdXRlLCByb3V0ZSkge1xuICAgIHZhciBwYXJlbnQgPSAodHlwZW9mIHBhcmVudE9yUm91dGUgIT09ICdvYmplY3QnKSA/IG5hbWVNYXBbcGFyZW50T3JSb3V0ZV0gOiB1bmRlZmluZWQ7XG4gICAgLy8gJGZsb3ctZGlzYWJsZS1saW5lXG4gICAgY3JlYXRlUm91dGVNYXAoW3JvdXRlIHx8IHBhcmVudE9yUm91dGVdLCBwYXRoTGlzdCwgcGF0aE1hcCwgbmFtZU1hcCwgcGFyZW50KTtcblxuICAgIC8vIGFkZCBhbGlhc2VzIG9mIHBhcmVudFxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIGNyZWF0ZVJvdXRlTWFwKFxuICAgICAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmUgcm91dGUgaXMgZGVmaW5lZCBpZiBwYXJlbnQgaXNcbiAgICAgICAgcGFyZW50LmFsaWFzLm1hcChmdW5jdGlvbiAoYWxpYXMpIHsgcmV0dXJuICh7IHBhdGg6IGFsaWFzLCBjaGlsZHJlbjogW3JvdXRlXSB9KTsgfSksXG4gICAgICAgIHBhdGhMaXN0LFxuICAgICAgICBwYXRoTWFwLFxuICAgICAgICBuYW1lTWFwLFxuICAgICAgICBwYXJlbnRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Um91dGVzICgpIHtcbiAgICByZXR1cm4gcGF0aExpc3QubWFwKGZ1bmN0aW9uIChwYXRoKSB7IHJldHVybiBwYXRoTWFwW3BhdGhdOyB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2ggKFxuICAgIHJhdyxcbiAgICBjdXJyZW50Um91dGUsXG4gICAgcmVkaXJlY3RlZEZyb21cbiAgKSB7XG4gICAgdmFyIGxvY2F0aW9uID0gbm9ybWFsaXplTG9jYXRpb24ocmF3LCBjdXJyZW50Um91dGUsIGZhbHNlLCByb3V0ZXIpO1xuICAgIHZhciBuYW1lID0gbG9jYXRpb24ubmFtZTtcblxuICAgIGlmIChuYW1lKSB7XG4gICAgICB2YXIgcmVjb3JkID0gbmFtZU1hcFtuYW1lXTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHdhcm4ocmVjb3JkLCAoXCJSb3V0ZSB3aXRoIG5hbWUgJ1wiICsgbmFtZSArIFwiJyBkb2VzIG5vdCBleGlzdFwiKSk7XG4gICAgICB9XG4gICAgICBpZiAoIXJlY29yZCkgeyByZXR1cm4gX2NyZWF0ZVJvdXRlKG51bGwsIGxvY2F0aW9uKSB9XG4gICAgICB2YXIgcGFyYW1OYW1lcyA9IHJlY29yZC5yZWdleC5rZXlzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gIWtleS5vcHRpb25hbDsgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiBrZXkubmFtZTsgfSk7XG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24ucGFyYW1zICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBsb2NhdGlvbi5wYXJhbXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRSb3V0ZSAmJiB0eXBlb2YgY3VycmVudFJvdXRlLnBhcmFtcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGN1cnJlbnRSb3V0ZS5wYXJhbXMpIHtcbiAgICAgICAgICBpZiAoIShrZXkgaW4gbG9jYXRpb24ucGFyYW1zKSAmJiBwYXJhbU5hbWVzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXJhbXNba2V5XSA9IGN1cnJlbnRSb3V0ZS5wYXJhbXNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbG9jYXRpb24ucGF0aCA9IGZpbGxQYXJhbXMocmVjb3JkLnBhdGgsIGxvY2F0aW9uLnBhcmFtcywgKFwibmFtZWQgcm91dGUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKSk7XG4gICAgICByZXR1cm4gX2NyZWF0ZVJvdXRlKHJlY29yZCwgbG9jYXRpb24sIHJlZGlyZWN0ZWRGcm9tKVxuICAgIH0gZWxzZSBpZiAobG9jYXRpb24ucGF0aCkge1xuICAgICAgbG9jYXRpb24ucGFyYW1zID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXRoID0gcGF0aExpc3RbaV07XG4gICAgICAgIHZhciByZWNvcmQkMSA9IHBhdGhNYXBbcGF0aF07XG4gICAgICAgIGlmIChtYXRjaFJvdXRlKHJlY29yZCQxLnJlZ2V4LCBsb2NhdGlvbi5wYXRoLCBsb2NhdGlvbi5wYXJhbXMpKSB7XG4gICAgICAgICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShyZWNvcmQkMSwgbG9jYXRpb24sIHJlZGlyZWN0ZWRGcm9tKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG5vIG1hdGNoXG4gICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShudWxsLCBsb2NhdGlvbilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZGlyZWN0IChcbiAgICByZWNvcmQsXG4gICAgbG9jYXRpb25cbiAgKSB7XG4gICAgdmFyIG9yaWdpbmFsUmVkaXJlY3QgPSByZWNvcmQucmVkaXJlY3Q7XG4gICAgdmFyIHJlZGlyZWN0ID0gdHlwZW9mIG9yaWdpbmFsUmVkaXJlY3QgPT09ICdmdW5jdGlvbidcbiAgICAgID8gb3JpZ2luYWxSZWRpcmVjdChjcmVhdGVSb3V0ZShyZWNvcmQsIGxvY2F0aW9uLCBudWxsLCByb3V0ZXIpKVxuICAgICAgOiBvcmlnaW5hbFJlZGlyZWN0O1xuXG4gICAgaWYgKHR5cGVvZiByZWRpcmVjdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlZGlyZWN0ID0geyBwYXRoOiByZWRpcmVjdCB9O1xuICAgIH1cblxuICAgIGlmICghcmVkaXJlY3QgfHwgdHlwZW9mIHJlZGlyZWN0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICBmYWxzZSwgKFwiaW52YWxpZCByZWRpcmVjdCBvcHRpb246IFwiICsgKEpTT04uc3RyaW5naWZ5KHJlZGlyZWN0KSkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX2NyZWF0ZVJvdXRlKG51bGwsIGxvY2F0aW9uKVxuICAgIH1cblxuICAgIHZhciByZSA9IHJlZGlyZWN0O1xuICAgIHZhciBuYW1lID0gcmUubmFtZTtcbiAgICB2YXIgcGF0aCA9IHJlLnBhdGg7XG4gICAgdmFyIHF1ZXJ5ID0gbG9jYXRpb24ucXVlcnk7XG4gICAgdmFyIGhhc2ggPSBsb2NhdGlvbi5oYXNoO1xuICAgIHZhciBwYXJhbXMgPSBsb2NhdGlvbi5wYXJhbXM7XG4gICAgcXVlcnkgPSByZS5oYXNPd25Qcm9wZXJ0eSgncXVlcnknKSA/IHJlLnF1ZXJ5IDogcXVlcnk7XG4gICAgaGFzaCA9IHJlLmhhc093blByb3BlcnR5KCdoYXNoJykgPyByZS5oYXNoIDogaGFzaDtcbiAgICBwYXJhbXMgPSByZS5oYXNPd25Qcm9wZXJ0eSgncGFyYW1zJykgPyByZS5wYXJhbXMgOiBwYXJhbXM7XG5cbiAgICBpZiAobmFtZSkge1xuICAgICAgLy8gcmVzb2x2ZWQgbmFtZWQgZGlyZWN0XG4gICAgICB2YXIgdGFyZ2V0UmVjb3JkID0gbmFtZU1hcFtuYW1lXTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGFzc2VydCh0YXJnZXRSZWNvcmQsIChcInJlZGlyZWN0IGZhaWxlZDogbmFtZWQgcm91dGUgXFxcIlwiICsgbmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaCh7XG4gICAgICAgIF9ub3JtYWxpemVkOiB0cnVlLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBxdWVyeTogcXVlcnksXG4gICAgICAgIGhhc2g6IGhhc2gsXG4gICAgICAgIHBhcmFtczogcGFyYW1zXG4gICAgICB9LCB1bmRlZmluZWQsIGxvY2F0aW9uKVxuICAgIH0gZWxzZSBpZiAocGF0aCkge1xuICAgICAgLy8gMS4gcmVzb2x2ZSByZWxhdGl2ZSByZWRpcmVjdFxuICAgICAgdmFyIHJhd1BhdGggPSByZXNvbHZlUmVjb3JkUGF0aChwYXRoLCByZWNvcmQpO1xuICAgICAgLy8gMi4gcmVzb2x2ZSBwYXJhbXNcbiAgICAgIHZhciByZXNvbHZlZFBhdGggPSBmaWxsUGFyYW1zKHJhd1BhdGgsIHBhcmFtcywgKFwicmVkaXJlY3Qgcm91dGUgd2l0aCBwYXRoIFxcXCJcIiArIHJhd1BhdGggKyBcIlxcXCJcIikpO1xuICAgICAgLy8gMy4gcmVtYXRjaCB3aXRoIGV4aXN0aW5nIHF1ZXJ5IGFuZCBoYXNoXG4gICAgICByZXR1cm4gbWF0Y2goe1xuICAgICAgICBfbm9ybWFsaXplZDogdHJ1ZSxcbiAgICAgICAgcGF0aDogcmVzb2x2ZWRQYXRoLFxuICAgICAgICBxdWVyeTogcXVlcnksXG4gICAgICAgIGhhc2g6IGhhc2hcbiAgICAgIH0sIHVuZGVmaW5lZCwgbG9jYXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHdhcm4oZmFsc2UsIChcImludmFsaWQgcmVkaXJlY3Qgb3B0aW9uOiBcIiArIChKU09OLnN0cmluZ2lmeShyZWRpcmVjdCkpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX2NyZWF0ZVJvdXRlKG51bGwsIGxvY2F0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFsaWFzIChcbiAgICByZWNvcmQsXG4gICAgbG9jYXRpb24sXG4gICAgbWF0Y2hBc1xuICApIHtcbiAgICB2YXIgYWxpYXNlZFBhdGggPSBmaWxsUGFyYW1zKG1hdGNoQXMsIGxvY2F0aW9uLnBhcmFtcywgKFwiYWxpYXNlZCByb3V0ZSB3aXRoIHBhdGggXFxcIlwiICsgbWF0Y2hBcyArIFwiXFxcIlwiKSk7XG4gICAgdmFyIGFsaWFzZWRNYXRjaCA9IG1hdGNoKHtcbiAgICAgIF9ub3JtYWxpemVkOiB0cnVlLFxuICAgICAgcGF0aDogYWxpYXNlZFBhdGhcbiAgICB9KTtcbiAgICBpZiAoYWxpYXNlZE1hdGNoKSB7XG4gICAgICB2YXIgbWF0Y2hlZCA9IGFsaWFzZWRNYXRjaC5tYXRjaGVkO1xuICAgICAgdmFyIGFsaWFzZWRSZWNvcmQgPSBtYXRjaGVkW21hdGNoZWQubGVuZ3RoIC0gMV07XG4gICAgICBsb2NhdGlvbi5wYXJhbXMgPSBhbGlhc2VkTWF0Y2gucGFyYW1zO1xuICAgICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShhbGlhc2VkUmVjb3JkLCBsb2NhdGlvbilcbiAgICB9XG4gICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShudWxsLCBsb2NhdGlvbilcbiAgfVxuXG4gIGZ1bmN0aW9uIF9jcmVhdGVSb3V0ZSAoXG4gICAgcmVjb3JkLFxuICAgIGxvY2F0aW9uLFxuICAgIHJlZGlyZWN0ZWRGcm9tXG4gICkge1xuICAgIGlmIChyZWNvcmQgJiYgcmVjb3JkLnJlZGlyZWN0KSB7XG4gICAgICByZXR1cm4gcmVkaXJlY3QocmVjb3JkLCByZWRpcmVjdGVkRnJvbSB8fCBsb2NhdGlvbilcbiAgICB9XG4gICAgaWYgKHJlY29yZCAmJiByZWNvcmQubWF0Y2hBcykge1xuICAgICAgcmV0dXJuIGFsaWFzKHJlY29yZCwgbG9jYXRpb24sIHJlY29yZC5tYXRjaEFzKVxuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlUm91dGUocmVjb3JkLCBsb2NhdGlvbiwgcmVkaXJlY3RlZEZyb20sIHJvdXRlcilcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWF0Y2g6IG1hdGNoLFxuICAgIGFkZFJvdXRlOiBhZGRSb3V0ZSxcbiAgICBnZXRSb3V0ZXM6IGdldFJvdXRlcyxcbiAgICBhZGRSb3V0ZXM6IGFkZFJvdXRlc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hdGNoUm91dGUgKFxuICByZWdleCxcbiAgcGF0aCxcbiAgcGFyYW1zXG4pIHtcbiAgdmFyIG0gPSBwYXRoLm1hdGNoKHJlZ2V4KTtcblxuICBpZiAoIW0pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIGtleSA9IHJlZ2V4LmtleXNbaSAtIDFdO1xuICAgIGlmIChrZXkpIHtcbiAgICAgIC8vIEZpeCAjMTk5NDogdXNpbmcgKiB3aXRoIHByb3BzOiB0cnVlIGdlbmVyYXRlcyBhIHBhcmFtIG5hbWVkIDBcbiAgICAgIHBhcmFtc1trZXkubmFtZSB8fCAncGF0aE1hdGNoJ10gPSB0eXBlb2YgbVtpXSA9PT0gJ3N0cmluZycgPyBkZWNvZGUobVtpXSkgOiBtW2ldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVSZWNvcmRQYXRoIChwYXRoLCByZWNvcmQpIHtcbiAgcmV0dXJuIHJlc29sdmVQYXRoKHBhdGgsIHJlY29yZC5wYXJlbnQgPyByZWNvcmQucGFyZW50LnBhdGggOiAnLycsIHRydWUpXG59XG5cbi8qICAqL1xuXG4vLyB1c2UgVXNlciBUaW1pbmcgYXBpIChpZiBwcmVzZW50KSBmb3IgbW9yZSBhY2N1cmF0ZSBrZXkgcHJlY2lzaW9uXG52YXIgVGltZSA9XG4gIGluQnJvd3NlciAmJiB3aW5kb3cucGVyZm9ybWFuY2UgJiYgd2luZG93LnBlcmZvcm1hbmNlLm5vd1xuICAgID8gd2luZG93LnBlcmZvcm1hbmNlXG4gICAgOiBEYXRlO1xuXG5mdW5jdGlvbiBnZW5TdGF0ZUtleSAoKSB7XG4gIHJldHVybiBUaW1lLm5vdygpLnRvRml4ZWQoMylcbn1cblxudmFyIF9rZXkgPSBnZW5TdGF0ZUtleSgpO1xuXG5mdW5jdGlvbiBnZXRTdGF0ZUtleSAoKSB7XG4gIHJldHVybiBfa2V5XG59XG5cbmZ1bmN0aW9uIHNldFN0YXRlS2V5IChrZXkpIHtcbiAgcmV0dXJuIChfa2V5ID0ga2V5KVxufVxuXG4vKiAgKi9cblxudmFyIHBvc2l0aW9uU3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5mdW5jdGlvbiBzZXR1cFNjcm9sbCAoKSB7XG4gIC8vIFByZXZlbnQgYnJvd3NlciBzY3JvbGwgYmVoYXZpb3Igb24gSGlzdG9yeSBwb3BzdGF0ZVxuICBpZiAoJ3Njcm9sbFJlc3RvcmF0aW9uJyBpbiB3aW5kb3cuaGlzdG9yeSkge1xuICAgIHdpbmRvdy5oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gJ21hbnVhbCc7XG4gIH1cbiAgLy8gRml4IGZvciAjMTU4NSBmb3IgRmlyZWZveFxuICAvLyBGaXggZm9yICMyMTk1IEFkZCBvcHRpb25hbCB0aGlyZCBhdHRyaWJ1dGUgdG8gd29ya2Fyb3VuZCBhIGJ1ZyBpbiBzYWZhcmkgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE4MjY3OFxuICAvLyBGaXggZm9yICMyNzc0IFN1cHBvcnQgZm9yIGFwcHMgbG9hZGVkIGZyb20gV2luZG93cyBmaWxlIHNoYXJlcyBub3QgbWFwcGVkIHRvIG5ldHdvcmsgZHJpdmVzOiByZXBsYWNlZCBsb2NhdGlvbi5vcmlnaW4gd2l0aFxuICAvLyB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RcbiAgLy8gbG9jYXRpb24uaG9zdCBjb250YWlucyB0aGUgcG9ydCBhbmQgbG9jYXRpb24uaG9zdG5hbWUgZG9lc24ndFxuICB2YXIgcHJvdG9jb2xBbmRQYXRoID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICB2YXIgYWJzb2x1dGVQYXRoID0gd2luZG93LmxvY2F0aW9uLmhyZWYucmVwbGFjZShwcm90b2NvbEFuZFBhdGgsICcnKTtcbiAgLy8gcHJlc2VydmUgZXhpc3RpbmcgaGlzdG9yeSBzdGF0ZSBhcyBpdCBjb3VsZCBiZSBvdmVycmlkZW4gYnkgdGhlIHVzZXJcbiAgdmFyIHN0YXRlQ29weSA9IGV4dGVuZCh7fSwgd2luZG93Lmhpc3Rvcnkuc3RhdGUpO1xuICBzdGF0ZUNvcHkua2V5ID0gZ2V0U3RhdGVLZXkoKTtcbiAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlQ29weSwgJycsIGFic29sdXRlUGF0aCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGhhbmRsZVBvcFN0YXRlKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBoYW5kbGVQb3BTdGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlU2Nyb2xsIChcbiAgcm91dGVyLFxuICB0byxcbiAgZnJvbSxcbiAgaXNQb3Bcbikge1xuICBpZiAoIXJvdXRlci5hcHApIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBiZWhhdmlvciA9IHJvdXRlci5vcHRpb25zLnNjcm9sbEJlaGF2aW9yO1xuICBpZiAoIWJlaGF2aW9yKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGFzc2VydCh0eXBlb2YgYmVoYXZpb3IgPT09ICdmdW5jdGlvbicsIFwic2Nyb2xsQmVoYXZpb3IgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgLy8gd2FpdCB1bnRpbCByZS1yZW5kZXIgZmluaXNoZXMgYmVmb3JlIHNjcm9sbGluZ1xuICByb3V0ZXIuYXBwLiRuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gZ2V0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICB2YXIgc2hvdWxkU2Nyb2xsID0gYmVoYXZpb3IuY2FsbChcbiAgICAgIHJvdXRlcixcbiAgICAgIHRvLFxuICAgICAgZnJvbSxcbiAgICAgIGlzUG9wID8gcG9zaXRpb24gOiBudWxsXG4gICAgKTtcblxuICAgIGlmICghc2hvdWxkU2Nyb2xsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNob3VsZFNjcm9sbC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBzaG91bGRTY3JvbGxcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNob3VsZFNjcm9sbCkge1xuICAgICAgICAgIHNjcm9sbFRvUG9zaXRpb24oKHNob3VsZFNjcm9sbCksIHBvc2l0aW9uKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgYXNzZXJ0KGZhbHNlLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2Nyb2xsVG9Qb3NpdGlvbihzaG91bGRTY3JvbGwsIHBvc2l0aW9uKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzYXZlU2Nyb2xsUG9zaXRpb24gKCkge1xuICB2YXIga2V5ID0gZ2V0U3RhdGVLZXkoKTtcbiAgaWYgKGtleSkge1xuICAgIHBvc2l0aW9uU3RvcmVba2V5XSA9IHtcbiAgICAgIHg6IHdpbmRvdy5wYWdlWE9mZnNldCxcbiAgICAgIHk6IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUG9wU3RhdGUgKGUpIHtcbiAgc2F2ZVNjcm9sbFBvc2l0aW9uKCk7XG4gIGlmIChlLnN0YXRlICYmIGUuc3RhdGUua2V5KSB7XG4gICAgc2V0U3RhdGVLZXkoZS5zdGF0ZS5rZXkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbFBvc2l0aW9uICgpIHtcbiAgdmFyIGtleSA9IGdldFN0YXRlS2V5KCk7XG4gIGlmIChrZXkpIHtcbiAgICByZXR1cm4gcG9zaXRpb25TdG9yZVtrZXldXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudFBvc2l0aW9uIChlbCwgb2Zmc2V0KSB7XG4gIHZhciBkb2NFbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgdmFyIGRvY1JlY3QgPSBkb2NFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGVsUmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHg6IGVsUmVjdC5sZWZ0IC0gZG9jUmVjdC5sZWZ0IC0gb2Zmc2V0LngsXG4gICAgeTogZWxSZWN0LnRvcCAtIGRvY1JlY3QudG9wIC0gb2Zmc2V0LnlcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkUG9zaXRpb24gKG9iaikge1xuICByZXR1cm4gaXNOdW1iZXIob2JqLngpIHx8IGlzTnVtYmVyKG9iai55KVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQb3NpdGlvbiAob2JqKSB7XG4gIHJldHVybiB7XG4gICAgeDogaXNOdW1iZXIob2JqLngpID8gb2JqLnggOiB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgeTogaXNOdW1iZXIob2JqLnkpID8gb2JqLnkgOiB3aW5kb3cucGFnZVlPZmZzZXRcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVPZmZzZXQgKG9iaikge1xuICByZXR1cm4ge1xuICAgIHg6IGlzTnVtYmVyKG9iai54KSA/IG9iai54IDogMCxcbiAgICB5OiBpc051bWJlcihvYmoueSkgPyBvYmoueSA6IDBcbiAgfVxufVxuXG5mdW5jdGlvbiBpc051bWJlciAodikge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInXG59XG5cbnZhciBoYXNoU3RhcnRzV2l0aE51bWJlclJFID0gL14jXFxkLztcblxuZnVuY3Rpb24gc2Nyb2xsVG9Qb3NpdGlvbiAoc2hvdWxkU2Nyb2xsLCBwb3NpdGlvbikge1xuICB2YXIgaXNPYmplY3QgPSB0eXBlb2Ygc2hvdWxkU2Nyb2xsID09PSAnb2JqZWN0JztcbiAgaWYgKGlzT2JqZWN0ICYmIHR5cGVvZiBzaG91bGRTY3JvbGwuc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZ2V0RWxlbWVudEJ5SWQgd291bGQgc3RpbGwgZmFpbCBpZiB0aGUgc2VsZWN0b3IgY29udGFpbnMgYSBtb3JlIGNvbXBsaWNhdGVkIHF1ZXJ5IGxpa2UgI21haW5bZGF0YS1hdHRyXVxuICAgIC8vIGJ1dCBhdCB0aGUgc2FtZSB0aW1lLCBpdCBkb2Vzbid0IG1ha2UgbXVjaCBzZW5zZSB0byBzZWxlY3QgYW4gZWxlbWVudCB3aXRoIGFuIGlkIGFuZCBhbiBleHRyYSBzZWxlY3RvclxuICAgIHZhciBlbCA9IGhhc2hTdGFydHNXaXRoTnVtYmVyUkUudGVzdChzaG91bGRTY3JvbGwuc2VsZWN0b3IpIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzaG91bGRTY3JvbGwuc2VsZWN0b3Iuc2xpY2UoMSkpIC8vICRmbG93LWRpc2FibGUtbGluZVxuICAgICAgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNob3VsZFNjcm9sbC5zZWxlY3Rvcik7XG5cbiAgICBpZiAoZWwpIHtcbiAgICAgIHZhciBvZmZzZXQgPVxuICAgICAgICBzaG91bGRTY3JvbGwub2Zmc2V0ICYmIHR5cGVvZiBzaG91bGRTY3JvbGwub2Zmc2V0ID09PSAnb2JqZWN0J1xuICAgICAgICAgID8gc2hvdWxkU2Nyb2xsLm9mZnNldFxuICAgICAgICAgIDoge307XG4gICAgICBvZmZzZXQgPSBub3JtYWxpemVPZmZzZXQob2Zmc2V0KTtcbiAgICAgIHBvc2l0aW9uID0gZ2V0RWxlbWVudFBvc2l0aW9uKGVsLCBvZmZzZXQpO1xuICAgIH0gZWxzZSBpZiAoaXNWYWxpZFBvc2l0aW9uKHNob3VsZFNjcm9sbCkpIHtcbiAgICAgIHBvc2l0aW9uID0gbm9ybWFsaXplUG9zaXRpb24oc2hvdWxkU2Nyb2xsKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QgJiYgaXNWYWxpZFBvc2l0aW9uKHNob3VsZFNjcm9sbCkpIHtcbiAgICBwb3NpdGlvbiA9IG5vcm1hbGl6ZVBvc2l0aW9uKHNob3VsZFNjcm9sbCk7XG4gIH1cblxuICBpZiAocG9zaXRpb24pIHtcbiAgICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbyh7XG4gICAgICAgIGxlZnQ6IHBvc2l0aW9uLngsXG4gICAgICAgIHRvcDogcG9zaXRpb24ueSxcbiAgICAgICAgLy8gJGZsb3ctZGlzYWJsZS1saW5lXG4gICAgICAgIGJlaGF2aW9yOiBzaG91bGRTY3JvbGwuYmVoYXZpb3JcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG52YXIgc3VwcG9ydHNQdXNoU3RhdGUgPVxuICBpbkJyb3dzZXIgJiZcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuICAgIGlmIChcbiAgICAgICh1YS5pbmRleE9mKCdBbmRyb2lkIDIuJykgIT09IC0xIHx8IHVhLmluZGV4T2YoJ0FuZHJvaWQgNC4wJykgIT09IC0xKSAmJlxuICAgICAgdWEuaW5kZXhPZignTW9iaWxlIFNhZmFyaScpICE9PSAtMSAmJlxuICAgICAgdWEuaW5kZXhPZignQ2hyb21lJykgPT09IC0xICYmXG4gICAgICB1YS5pbmRleE9mKCdXaW5kb3dzIFBob25lJykgPT09IC0xXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gd2luZG93Lmhpc3RvcnkgJiYgdHlwZW9mIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSA9PT0gJ2Z1bmN0aW9uJ1xuICB9KSgpO1xuXG5mdW5jdGlvbiBwdXNoU3RhdGUgKHVybCwgcmVwbGFjZSkge1xuICBzYXZlU2Nyb2xsUG9zaXRpb24oKTtcbiAgLy8gdHJ5Li4uY2F0Y2ggdGhlIHB1c2hTdGF0ZSBjYWxsIHRvIGdldCBhcm91bmQgU2FmYXJpXG4gIC8vIERPTSBFeGNlcHRpb24gMTggd2hlcmUgaXQgbGltaXRzIHRvIDEwMCBwdXNoU3RhdGUgY2FsbHNcbiAgdmFyIGhpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeTtcbiAgdHJ5IHtcbiAgICBpZiAocmVwbGFjZSkge1xuICAgICAgLy8gcHJlc2VydmUgZXhpc3RpbmcgaGlzdG9yeSBzdGF0ZSBhcyBpdCBjb3VsZCBiZSBvdmVycmlkZW4gYnkgdGhlIHVzZXJcbiAgICAgIHZhciBzdGF0ZUNvcHkgPSBleHRlbmQoe30sIGhpc3Rvcnkuc3RhdGUpO1xuICAgICAgc3RhdGVDb3B5LmtleSA9IGdldFN0YXRlS2V5KCk7XG4gICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZUNvcHksICcnLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7IGtleTogc2V0U3RhdGVLZXkoZ2VuU3RhdGVLZXkoKSkgfSwgJycsIHVybCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgd2luZG93LmxvY2F0aW9uW3JlcGxhY2UgPyAncmVwbGFjZScgOiAnYXNzaWduJ10odXJsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXBsYWNlU3RhdGUgKHVybCkge1xuICBwdXNoU3RhdGUodXJsLCB0cnVlKTtcbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIHJ1blF1ZXVlIChxdWV1ZSwgZm4sIGNiKSB7XG4gIHZhciBzdGVwID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID49IHF1ZXVlLmxlbmd0aCkge1xuICAgICAgY2IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHF1ZXVlW2luZGV4XSkge1xuICAgICAgICBmbihxdWV1ZVtpbmRleF0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzdGVwKGluZGV4ICsgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RlcChpbmRleCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgc3RlcCgwKTtcbn1cblxuLy8gV2hlbiBjaGFuZ2luZyB0aGluZywgYWxzbyBlZGl0IHJvdXRlci5kLnRzXG52YXIgTmF2aWdhdGlvbkZhaWx1cmVUeXBlID0ge1xuICByZWRpcmVjdGVkOiAyLFxuICBhYm9ydGVkOiA0LFxuICBjYW5jZWxsZWQ6IDgsXG4gIGR1cGxpY2F0ZWQ6IDE2XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVOYXZpZ2F0aW9uUmVkaXJlY3RlZEVycm9yIChmcm9tLCB0bykge1xuICByZXR1cm4gY3JlYXRlUm91dGVyRXJyb3IoXG4gICAgZnJvbSxcbiAgICB0byxcbiAgICBOYXZpZ2F0aW9uRmFpbHVyZVR5cGUucmVkaXJlY3RlZCxcbiAgICAoXCJSZWRpcmVjdGVkIHdoZW4gZ29pbmcgZnJvbSBcXFwiXCIgKyAoZnJvbS5mdWxsUGF0aCkgKyBcIlxcXCIgdG8gXFxcIlwiICsgKHN0cmluZ2lmeVJvdXRlKFxuICAgICAgdG9cbiAgICApKSArIFwiXFxcIiB2aWEgYSBuYXZpZ2F0aW9uIGd1YXJkLlwiKVxuICApXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5hdmlnYXRpb25EdXBsaWNhdGVkRXJyb3IgKGZyb20sIHRvKSB7XG4gIHZhciBlcnJvciA9IGNyZWF0ZVJvdXRlckVycm9yKFxuICAgIGZyb20sXG4gICAgdG8sXG4gICAgTmF2aWdhdGlvbkZhaWx1cmVUeXBlLmR1cGxpY2F0ZWQsXG4gICAgKFwiQXZvaWRlZCByZWR1bmRhbnQgbmF2aWdhdGlvbiB0byBjdXJyZW50IGxvY2F0aW9uOiBcXFwiXCIgKyAoZnJvbS5mdWxsUGF0aCkgKyBcIlxcXCIuXCIpXG4gICk7XG4gIC8vIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGggdGhlIGZpcnN0IGludHJvZHVjdGlvbiBvZiBFcnJvcnNcbiAgZXJyb3IubmFtZSA9ICdOYXZpZ2F0aW9uRHVwbGljYXRlZCc7XG4gIHJldHVybiBlcnJvclxufVxuXG5mdW5jdGlvbiBjcmVhdGVOYXZpZ2F0aW9uQ2FuY2VsbGVkRXJyb3IgKGZyb20sIHRvKSB7XG4gIHJldHVybiBjcmVhdGVSb3V0ZXJFcnJvcihcbiAgICBmcm9tLFxuICAgIHRvLFxuICAgIE5hdmlnYXRpb25GYWlsdXJlVHlwZS5jYW5jZWxsZWQsXG4gICAgKFwiTmF2aWdhdGlvbiBjYW5jZWxsZWQgZnJvbSBcXFwiXCIgKyAoZnJvbS5mdWxsUGF0aCkgKyBcIlxcXCIgdG8gXFxcIlwiICsgKHRvLmZ1bGxQYXRoKSArIFwiXFxcIiB3aXRoIGEgbmV3IG5hdmlnYXRpb24uXCIpXG4gIClcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmF2aWdhdGlvbkFib3J0ZWRFcnJvciAoZnJvbSwgdG8pIHtcbiAgcmV0dXJuIGNyZWF0ZVJvdXRlckVycm9yKFxuICAgIGZyb20sXG4gICAgdG8sXG4gICAgTmF2aWdhdGlvbkZhaWx1cmVUeXBlLmFib3J0ZWQsXG4gICAgKFwiTmF2aWdhdGlvbiBhYm9ydGVkIGZyb20gXFxcIlwiICsgKGZyb20uZnVsbFBhdGgpICsgXCJcXFwiIHRvIFxcXCJcIiArICh0by5mdWxsUGF0aCkgKyBcIlxcXCIgdmlhIGEgbmF2aWdhdGlvbiBndWFyZC5cIilcbiAgKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVSb3V0ZXJFcnJvciAoZnJvbSwgdG8sIHR5cGUsIG1lc3NhZ2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICBlcnJvci5faXNSb3V0ZXIgPSB0cnVlO1xuICBlcnJvci5mcm9tID0gZnJvbTtcbiAgZXJyb3IudG8gPSB0bztcbiAgZXJyb3IudHlwZSA9IHR5cGU7XG5cbiAgcmV0dXJuIGVycm9yXG59XG5cbnZhciBwcm9wZXJ0aWVzVG9Mb2cgPSBbJ3BhcmFtcycsICdxdWVyeScsICdoYXNoJ107XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVJvdXRlICh0bykge1xuICBpZiAodHlwZW9mIHRvID09PSAnc3RyaW5nJykgeyByZXR1cm4gdG8gfVxuICBpZiAoJ3BhdGgnIGluIHRvKSB7IHJldHVybiB0by5wYXRoIH1cbiAgdmFyIGxvY2F0aW9uID0ge307XG4gIHByb3BlcnRpZXNUb0xvZy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IGluIHRvKSB7IGxvY2F0aW9uW2tleV0gPSB0b1trZXldOyB9XG4gIH0pO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobG9jYXRpb24sIG51bGwsIDIpXG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IgKGVycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVycikuaW5kZXhPZignRXJyb3InKSA+IC0xXG59XG5cbmZ1bmN0aW9uIGlzTmF2aWdhdGlvbkZhaWx1cmUgKGVyciwgZXJyb3JUeXBlKSB7XG4gIHJldHVybiAoXG4gICAgaXNFcnJvcihlcnIpICYmXG4gICAgZXJyLl9pc1JvdXRlciAmJlxuICAgIChlcnJvclR5cGUgPT0gbnVsbCB8fCBlcnIudHlwZSA9PT0gZXJyb3JUeXBlKVxuICApXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiByZXNvbHZlQXN5bmNDb21wb25lbnRzIChtYXRjaGVkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodG8sIGZyb20sIG5leHQpIHtcbiAgICB2YXIgaGFzQXN5bmMgPSBmYWxzZTtcbiAgICB2YXIgcGVuZGluZyA9IDA7XG4gICAgdmFyIGVycm9yID0gbnVsbDtcblxuICAgIGZsYXRNYXBDb21wb25lbnRzKG1hdGNoZWQsIGZ1bmN0aW9uIChkZWYsIF8sIG1hdGNoLCBrZXkpIHtcbiAgICAgIC8vIGlmIGl0J3MgYSBmdW5jdGlvbiBhbmQgZG9lc24ndCBoYXZlIGNpZCBhdHRhY2hlZCxcbiAgICAgIC8vIGFzc3VtZSBpdCdzIGFuIGFzeW5jIGNvbXBvbmVudCByZXNvbHZlIGZ1bmN0aW9uLlxuICAgICAgLy8gd2UgYXJlIG5vdCB1c2luZyBWdWUncyBkZWZhdWx0IGFzeW5jIHJlc29sdmluZyBtZWNoYW5pc20gYmVjYXVzZVxuICAgICAgLy8gd2Ugd2FudCB0byBoYWx0IHRoZSBuYXZpZ2F0aW9uIHVudGlsIHRoZSBpbmNvbWluZyBjb21wb25lbnQgaGFzIGJlZW5cbiAgICAgIC8vIHJlc29sdmVkLlxuICAgICAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicgJiYgZGVmLmNpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGhhc0FzeW5jID0gdHJ1ZTtcbiAgICAgICAgcGVuZGluZysrO1xuXG4gICAgICAgIHZhciByZXNvbHZlID0gb25jZShmdW5jdGlvbiAocmVzb2x2ZWREZWYpIHtcbiAgICAgICAgICBpZiAoaXNFU01vZHVsZShyZXNvbHZlZERlZikpIHtcbiAgICAgICAgICAgIHJlc29sdmVkRGVmID0gcmVzb2x2ZWREZWYuZGVmYXVsdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc2F2ZSByZXNvbHZlZCBvbiBhc3luYyBmYWN0b3J5IGluIGNhc2UgaXQncyB1c2VkIGVsc2V3aGVyZVxuICAgICAgICAgIGRlZi5yZXNvbHZlZCA9IHR5cGVvZiByZXNvbHZlZERlZiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyByZXNvbHZlZERlZlxuICAgICAgICAgICAgOiBfVnVlLmV4dGVuZChyZXNvbHZlZERlZik7XG4gICAgICAgICAgbWF0Y2guY29tcG9uZW50c1trZXldID0gcmVzb2x2ZWREZWY7XG4gICAgICAgICAgcGVuZGluZy0tO1xuICAgICAgICAgIGlmIChwZW5kaW5nIDw9IDApIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByZWplY3QgPSBvbmNlKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICB2YXIgbXNnID0gXCJGYWlsZWQgdG8gcmVzb2x2ZSBhc3luYyBjb21wb25lbnQgXCIgKyBrZXkgKyBcIjogXCIgKyByZWFzb247XG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKGZhbHNlLCBtc2cpO1xuICAgICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gaXNFcnJvcihyZWFzb24pXG4gICAgICAgICAgICAgID8gcmVhc29uXG4gICAgICAgICAgICAgIDogbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICBuZXh0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByZXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzID0gZGVmKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlcy50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5ldyBzeW50YXggaW4gVnVlIDIuM1xuICAgICAgICAgICAgdmFyIGNvbXAgPSByZXMuY29tcG9uZW50O1xuICAgICAgICAgICAgaWYgKGNvbXAgJiYgdHlwZW9mIGNvbXAudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjb21wLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghaGFzQXN5bmMpIHsgbmV4dCgpOyB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdE1hcENvbXBvbmVudHMgKFxuICBtYXRjaGVkLFxuICBmblxuKSB7XG4gIHJldHVybiBmbGF0dGVuKG1hdGNoZWQubWFwKGZ1bmN0aW9uIChtKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG0uY29tcG9uZW50cykubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIGZuKFxuICAgICAgbS5jb21wb25lbnRzW2tleV0sXG4gICAgICBtLmluc3RhbmNlc1trZXldLFxuICAgICAgbSwga2V5XG4gICAgKTsgfSlcbiAgfSkpXG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4gKGFycikge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJyKVxufVxuXG52YXIgaGFzU3ltYm9sID1cbiAgdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICB0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJztcblxuZnVuY3Rpb24gaXNFU01vZHVsZSAob2JqKSB7XG4gIHJldHVybiBvYmouX19lc01vZHVsZSB8fCAoaGFzU3ltYm9sICYmIG9ialtTeW1ib2wudG9TdHJpbmdUYWddID09PSAnTW9kdWxlJylcbn1cblxuLy8gaW4gV2VicGFjayAyLCByZXF1aXJlLmVuc3VyZSBub3cgYWxzbyByZXR1cm5zIGEgUHJvbWlzZVxuLy8gc28gdGhlIHJlc29sdmUvcmVqZWN0IGZ1bmN0aW9ucyBtYXkgZ2V0IGNhbGxlZCBhbiBleHRyYSB0aW1lXG4vLyBpZiB0aGUgdXNlciB1c2VzIGFuIGFycm93IGZ1bmN0aW9uIHNob3J0aGFuZCB0aGF0IGhhcHBlbnMgdG9cbi8vIHJldHVybiB0aGF0IFByb21pc2UuXG5mdW5jdGlvbiBvbmNlIChmbikge1xuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgaWYgKGNhbGxlZCkgeyByZXR1cm4gfVxuICAgIGNhbGxlZCA9IHRydWU7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3MpXG4gIH1cbn1cblxuLyogICovXG5cbnZhciBIaXN0b3J5ID0gZnVuY3Rpb24gSGlzdG9yeSAocm91dGVyLCBiYXNlKSB7XG4gIHRoaXMucm91dGVyID0gcm91dGVyO1xuICB0aGlzLmJhc2UgPSBub3JtYWxpemVCYXNlKGJhc2UpO1xuICAvLyBzdGFydCB3aXRoIGEgcm91dGUgb2JqZWN0IHRoYXQgc3RhbmRzIGZvciBcIm5vd2hlcmVcIlxuICB0aGlzLmN1cnJlbnQgPSBTVEFSVDtcbiAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgdGhpcy5yZWFkeSA9IGZhbHNlO1xuICB0aGlzLnJlYWR5Q2JzID0gW107XG4gIHRoaXMucmVhZHlFcnJvckNicyA9IFtdO1xuICB0aGlzLmVycm9yQ2JzID0gW107XG4gIHRoaXMubGlzdGVuZXJzID0gW107XG59O1xuXG5IaXN0b3J5LnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiBsaXN0ZW4gKGNiKSB7XG4gIHRoaXMuY2IgPSBjYjtcbn07XG5cbkhpc3RvcnkucHJvdG90eXBlLm9uUmVhZHkgPSBmdW5jdGlvbiBvblJlYWR5IChjYiwgZXJyb3JDYikge1xuICBpZiAodGhpcy5yZWFkeSkge1xuICAgIGNiKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yZWFkeUNicy5wdXNoKGNiKTtcbiAgICBpZiAoZXJyb3JDYikge1xuICAgICAgdGhpcy5yZWFkeUVycm9yQ2JzLnB1c2goZXJyb3JDYik7XG4gICAgfVxuICB9XG59O1xuXG5IaXN0b3J5LnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gb25FcnJvciAoZXJyb3JDYikge1xuICB0aGlzLmVycm9yQ2JzLnB1c2goZXJyb3JDYik7XG59O1xuXG5IaXN0b3J5LnByb3RvdHlwZS50cmFuc2l0aW9uVG8gPSBmdW5jdGlvbiB0cmFuc2l0aW9uVG8gKFxuICBsb2NhdGlvbixcbiAgb25Db21wbGV0ZSxcbiAgb25BYm9ydFxuKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIHJvdXRlO1xuICAvLyBjYXRjaCByZWRpcmVjdCBvcHRpb24gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1yb3V0ZXIvaXNzdWVzLzMyMDFcbiAgdHJ5IHtcbiAgICByb3V0ZSA9IHRoaXMucm91dGVyLm1hdGNoKGxvY2F0aW9uLCB0aGlzLmN1cnJlbnQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhpcy5lcnJvckNicy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgY2IoZSk7XG4gICAgfSk7XG4gICAgLy8gRXhjZXB0aW9uIHNob3VsZCBzdGlsbCBiZSB0aHJvd25cbiAgICB0aHJvdyBlXG4gIH1cbiAgdmFyIHByZXYgPSB0aGlzLmN1cnJlbnQ7XG4gIHRoaXMuY29uZmlybVRyYW5zaXRpb24oXG4gICAgcm91dGUsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcyQxLnVwZGF0ZVJvdXRlKHJvdXRlKTtcbiAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgICB0aGlzJDEuZW5zdXJlVVJMKCk7XG4gICAgICB0aGlzJDEucm91dGVyLmFmdGVySG9va3MuZm9yRWFjaChmdW5jdGlvbiAoaG9vaykge1xuICAgICAgICBob29rICYmIGhvb2socm91dGUsIHByZXYpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGZpcmUgcmVhZHkgY2JzIG9uY2VcbiAgICAgIGlmICghdGhpcyQxLnJlYWR5KSB7XG4gICAgICAgIHRoaXMkMS5yZWFkeSA9IHRydWU7XG4gICAgICAgIHRoaXMkMS5yZWFkeUNicy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgIGNiKHJvdXRlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBpZiAob25BYm9ydCkge1xuICAgICAgICBvbkFib3J0KGVycik7XG4gICAgICB9XG4gICAgICBpZiAoZXJyICYmICF0aGlzJDEucmVhZHkpIHtcbiAgICAgICAgLy8gSW5pdGlhbCByZWRpcmVjdGlvbiBzaG91bGQgbm90IG1hcmsgdGhlIGhpc3RvcnkgYXMgcmVhZHkgeWV0XG4gICAgICAgIC8vIGJlY2F1c2UgaXQncyB0cmlnZ2VyZWQgYnkgdGhlIHJlZGlyZWN0aW9uIGluc3RlYWRcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1yb3V0ZXIvaXNzdWVzLzMyMjVcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1yb3V0ZXIvaXNzdWVzLzMzMzFcbiAgICAgICAgaWYgKCFpc05hdmlnYXRpb25GYWlsdXJlKGVyciwgTmF2aWdhdGlvbkZhaWx1cmVUeXBlLnJlZGlyZWN0ZWQpIHx8IHByZXYgIT09IFNUQVJUKSB7XG4gICAgICAgICAgdGhpcyQxLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzJDEucmVhZHlFcnJvckNicy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgKTtcbn07XG5cbkhpc3RvcnkucHJvdG90eXBlLmNvbmZpcm1UcmFuc2l0aW9uID0gZnVuY3Rpb24gY29uZmlybVRyYW5zaXRpb24gKHJvdXRlLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnQ7XG4gIHRoaXMucGVuZGluZyA9IHJvdXRlO1xuICB2YXIgYWJvcnQgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgLy8gY2hhbmdlZCBhZnRlciBhZGRpbmcgZXJyb3JzIHdpdGhcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLXJvdXRlci9wdWxsLzMwNDcgYmVmb3JlIHRoYXQgY2hhbmdlLFxuICAgIC8vIHJlZGlyZWN0IGFuZCBhYm9ydGVkIG5hdmlnYXRpb24gd291bGQgcHJvZHVjZSBhbiBlcnIgPT0gbnVsbFxuICAgIGlmICghaXNOYXZpZ2F0aW9uRmFpbHVyZShlcnIpICYmIGlzRXJyb3IoZXJyKSkge1xuICAgICAgaWYgKHRoaXMkMS5lcnJvckNicy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcyQxLmVycm9yQ2JzLmZvckVhY2goZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKGZhbHNlLCAndW5jYXVnaHQgZXJyb3IgZHVyaW5nIHJvdXRlIG5hdmlnYXRpb246Jyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgb25BYm9ydCAmJiBvbkFib3J0KGVycik7XG4gIH07XG4gIHZhciBsYXN0Um91dGVJbmRleCA9IHJvdXRlLm1hdGNoZWQubGVuZ3RoIC0gMTtcbiAgdmFyIGxhc3RDdXJyZW50SW5kZXggPSBjdXJyZW50Lm1hdGNoZWQubGVuZ3RoIC0gMTtcbiAgaWYgKFxuICAgIGlzU2FtZVJvdXRlKHJvdXRlLCBjdXJyZW50KSAmJlxuICAgIC8vIGluIHRoZSBjYXNlIHRoZSByb3V0ZSBtYXAgaGFzIGJlZW4gZHluYW1pY2FsbHkgYXBwZW5kZWQgdG9cbiAgICBsYXN0Um91dGVJbmRleCA9PT0gbGFzdEN1cnJlbnRJbmRleCAmJlxuICAgIHJvdXRlLm1hdGNoZWRbbGFzdFJvdXRlSW5kZXhdID09PSBjdXJyZW50Lm1hdGNoZWRbbGFzdEN1cnJlbnRJbmRleF1cbiAgKSB7XG4gICAgdGhpcy5lbnN1cmVVUkwoKTtcbiAgICByZXR1cm4gYWJvcnQoY3JlYXRlTmF2aWdhdGlvbkR1cGxpY2F0ZWRFcnJvcihjdXJyZW50LCByb3V0ZSkpXG4gIH1cblxuICB2YXIgcmVmID0gcmVzb2x2ZVF1ZXVlKFxuICAgIHRoaXMuY3VycmVudC5tYXRjaGVkLFxuICAgIHJvdXRlLm1hdGNoZWRcbiAgKTtcbiAgICB2YXIgdXBkYXRlZCA9IHJlZi51cGRhdGVkO1xuICAgIHZhciBkZWFjdGl2YXRlZCA9IHJlZi5kZWFjdGl2YXRlZDtcbiAgICB2YXIgYWN0aXZhdGVkID0gcmVmLmFjdGl2YXRlZDtcblxuICB2YXIgcXVldWUgPSBbXS5jb25jYXQoXG4gICAgLy8gaW4tY29tcG9uZW50IGxlYXZlIGd1YXJkc1xuICAgIGV4dHJhY3RMZWF2ZUd1YXJkcyhkZWFjdGl2YXRlZCksXG4gICAgLy8gZ2xvYmFsIGJlZm9yZSBob29rc1xuICAgIHRoaXMucm91dGVyLmJlZm9yZUhvb2tzLFxuICAgIC8vIGluLWNvbXBvbmVudCB1cGRhdGUgaG9va3NcbiAgICBleHRyYWN0VXBkYXRlSG9va3ModXBkYXRlZCksXG4gICAgLy8gaW4tY29uZmlnIGVudGVyIGd1YXJkc1xuICAgIGFjdGl2YXRlZC5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0uYmVmb3JlRW50ZXI7IH0pLFxuICAgIC8vIGFzeW5jIGNvbXBvbmVudHNcbiAgICByZXNvbHZlQXN5bmNDb21wb25lbnRzKGFjdGl2YXRlZClcbiAgKTtcblxuICB2YXIgaXRlcmF0b3IgPSBmdW5jdGlvbiAoaG9vaywgbmV4dCkge1xuICAgIGlmICh0aGlzJDEucGVuZGluZyAhPT0gcm91dGUpIHtcbiAgICAgIHJldHVybiBhYm9ydChjcmVhdGVOYXZpZ2F0aW9uQ2FuY2VsbGVkRXJyb3IoY3VycmVudCwgcm91dGUpKVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgaG9vayhyb3V0ZSwgY3VycmVudCwgZnVuY3Rpb24gKHRvKSB7XG4gICAgICAgIGlmICh0byA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvLyBuZXh0KGZhbHNlKSAtPiBhYm9ydCBuYXZpZ2F0aW9uLCBlbnN1cmUgY3VycmVudCBVUkxcbiAgICAgICAgICB0aGlzJDEuZW5zdXJlVVJMKHRydWUpO1xuICAgICAgICAgIGFib3J0KGNyZWF0ZU5hdmlnYXRpb25BYm9ydGVkRXJyb3IoY3VycmVudCwgcm91dGUpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Vycm9yKHRvKSkge1xuICAgICAgICAgIHRoaXMkMS5lbnN1cmVVUkwodHJ1ZSk7XG4gICAgICAgICAgYWJvcnQodG8pO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHR5cGVvZiB0byA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAodHlwZW9mIHRvID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgKHR5cGVvZiB0by5wYXRoID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdG8ubmFtZSA9PT0gJ3N0cmluZycpKVxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBuZXh0KCcvJykgb3IgbmV4dCh7IHBhdGg6ICcvJyB9KSAtPiByZWRpcmVjdFxuICAgICAgICAgIGFib3J0KGNyZWF0ZU5hdmlnYXRpb25SZWRpcmVjdGVkRXJyb3IoY3VycmVudCwgcm91dGUpKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRvID09PSAnb2JqZWN0JyAmJiB0by5yZXBsYWNlKSB7XG4gICAgICAgICAgICB0aGlzJDEucmVwbGFjZSh0byk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMkMS5wdXNoKHRvKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY29uZmlybSB0cmFuc2l0aW9uIGFuZCBwYXNzIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgIG5leHQodG8pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhYm9ydChlKTtcbiAgICB9XG4gIH07XG5cbiAgcnVuUXVldWUocXVldWUsIGl0ZXJhdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gd2FpdCB1bnRpbCBhc3luYyBjb21wb25lbnRzIGFyZSByZXNvbHZlZCBiZWZvcmVcbiAgICAvLyBleHRyYWN0aW5nIGluLWNvbXBvbmVudCBlbnRlciBndWFyZHNcbiAgICB2YXIgZW50ZXJHdWFyZHMgPSBleHRyYWN0RW50ZXJHdWFyZHMoYWN0aXZhdGVkKTtcbiAgICB2YXIgcXVldWUgPSBlbnRlckd1YXJkcy5jb25jYXQodGhpcyQxLnJvdXRlci5yZXNvbHZlSG9va3MpO1xuICAgIHJ1blF1ZXVlKHF1ZXVlLCBpdGVyYXRvciwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMkMS5wZW5kaW5nICE9PSByb3V0ZSkge1xuICAgICAgICByZXR1cm4gYWJvcnQoY3JlYXRlTmF2aWdhdGlvbkNhbmNlbGxlZEVycm9yKGN1cnJlbnQsIHJvdXRlKSlcbiAgICAgIH1cbiAgICAgIHRoaXMkMS5wZW5kaW5nID0gbnVsbDtcbiAgICAgIG9uQ29tcGxldGUocm91dGUpO1xuICAgICAgaWYgKHRoaXMkMS5yb3V0ZXIuYXBwKSB7XG4gICAgICAgIHRoaXMkMS5yb3V0ZXIuYXBwLiRuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaGFuZGxlUm91dGVFbnRlcmVkKHJvdXRlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuSGlzdG9yeS5wcm90b3R5cGUudXBkYXRlUm91dGUgPSBmdW5jdGlvbiB1cGRhdGVSb3V0ZSAocm91dGUpIHtcbiAgdGhpcy5jdXJyZW50ID0gcm91dGU7XG4gIHRoaXMuY2IgJiYgdGhpcy5jYihyb3V0ZSk7XG59O1xuXG5IaXN0b3J5LnByb3RvdHlwZS5zZXR1cExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldHVwTGlzdGVuZXJzICgpIHtcbiAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyBlbXB0eVxufTtcblxuSGlzdG9yeS5wcm90b3R5cGUudGVhcmRvd24gPSBmdW5jdGlvbiB0ZWFyZG93biAoKSB7XG4gIC8vIGNsZWFuIHVwIGV2ZW50IGxpc3RlbmVyc1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLXJvdXRlci9pc3N1ZXMvMjM0MVxuICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChjbGVhbnVwTGlzdGVuZXIpIHtcbiAgICBjbGVhbnVwTGlzdGVuZXIoKTtcbiAgfSk7XG4gIHRoaXMubGlzdGVuZXJzID0gW107XG5cbiAgLy8gcmVzZXQgY3VycmVudCBoaXN0b3J5IHJvdXRlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUtcm91dGVyL2lzc3Vlcy8zMjk0XG4gIHRoaXMuY3VycmVudCA9IFNUQVJUO1xuICB0aGlzLnBlbmRpbmcgPSBudWxsO1xufTtcblxuZnVuY3Rpb24gbm9ybWFsaXplQmFzZSAoYmFzZSkge1xuICBpZiAoIWJhc2UpIHtcbiAgICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgICAvLyByZXNwZWN0IDxiYXNlPiB0YWdcbiAgICAgIHZhciBiYXNlRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdiYXNlJyk7XG4gICAgICBiYXNlID0gKGJhc2VFbCAmJiBiYXNlRWwuZ2V0QXR0cmlidXRlKCdocmVmJykpIHx8ICcvJztcbiAgICAgIC8vIHN0cmlwIGZ1bGwgVVJMIG9yaWdpblxuICAgICAgYmFzZSA9IGJhc2UucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC9bXlxcL10rLywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlID0gJy8nO1xuICAgIH1cbiAgfVxuICAvLyBtYWtlIHN1cmUgdGhlcmUncyB0aGUgc3RhcnRpbmcgc2xhc2hcbiAgaWYgKGJhc2UuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICBiYXNlID0gJy8nICsgYmFzZTtcbiAgfVxuICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2hcbiAgcmV0dXJuIGJhc2UucmVwbGFjZSgvXFwvJC8sICcnKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUXVldWUgKFxuICBjdXJyZW50LFxuICBuZXh0XG4pIHtcbiAgdmFyIGk7XG4gIHZhciBtYXggPSBNYXRoLm1heChjdXJyZW50Lmxlbmd0aCwgbmV4dC5sZW5ndGgpO1xuICBmb3IgKGkgPSAwOyBpIDwgbWF4OyBpKyspIHtcbiAgICBpZiAoY3VycmVudFtpXSAhPT0gbmV4dFtpXSkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB1cGRhdGVkOiBuZXh0LnNsaWNlKDAsIGkpLFxuICAgIGFjdGl2YXRlZDogbmV4dC5zbGljZShpKSxcbiAgICBkZWFjdGl2YXRlZDogY3VycmVudC5zbGljZShpKVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RHdWFyZHMgKFxuICByZWNvcmRzLFxuICBuYW1lLFxuICBiaW5kLFxuICByZXZlcnNlXG4pIHtcbiAgdmFyIGd1YXJkcyA9IGZsYXRNYXBDb21wb25lbnRzKHJlY29yZHMsIGZ1bmN0aW9uIChkZWYsIGluc3RhbmNlLCBtYXRjaCwga2V5KSB7XG4gICAgdmFyIGd1YXJkID0gZXh0cmFjdEd1YXJkKGRlZiwgbmFtZSk7XG4gICAgaWYgKGd1YXJkKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShndWFyZClcbiAgICAgICAgPyBndWFyZC5tYXAoZnVuY3Rpb24gKGd1YXJkKSB7IHJldHVybiBiaW5kKGd1YXJkLCBpbnN0YW5jZSwgbWF0Y2gsIGtleSk7IH0pXG4gICAgICAgIDogYmluZChndWFyZCwgaW5zdGFuY2UsIG1hdGNoLCBrZXkpXG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGZsYXR0ZW4ocmV2ZXJzZSA/IGd1YXJkcy5yZXZlcnNlKCkgOiBndWFyZHMpXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RHdWFyZCAoXG4gIGRlZixcbiAga2V5XG4pIHtcbiAgaWYgKHR5cGVvZiBkZWYgIT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBleHRlbmQgbm93IHNvIHRoYXQgZ2xvYmFsIG1peGlucyBhcmUgYXBwbGllZC5cbiAgICBkZWYgPSBfVnVlLmV4dGVuZChkZWYpO1xuICB9XG4gIHJldHVybiBkZWYub3B0aW9uc1trZXldXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RMZWF2ZUd1YXJkcyAoZGVhY3RpdmF0ZWQpIHtcbiAgcmV0dXJuIGV4dHJhY3RHdWFyZHMoZGVhY3RpdmF0ZWQsICdiZWZvcmVSb3V0ZUxlYXZlJywgYmluZEd1YXJkLCB0cnVlKVxufVxuXG5mdW5jdGlvbiBleHRyYWN0VXBkYXRlSG9va3MgKHVwZGF0ZWQpIHtcbiAgcmV0dXJuIGV4dHJhY3RHdWFyZHModXBkYXRlZCwgJ2JlZm9yZVJvdXRlVXBkYXRlJywgYmluZEd1YXJkKVxufVxuXG5mdW5jdGlvbiBiaW5kR3VhcmQgKGd1YXJkLCBpbnN0YW5jZSkge1xuICBpZiAoaW5zdGFuY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gYm91bmRSb3V0ZUd1YXJkICgpIHtcbiAgICAgIHJldHVybiBndWFyZC5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0RW50ZXJHdWFyZHMgKFxuICBhY3RpdmF0ZWRcbikge1xuICByZXR1cm4gZXh0cmFjdEd1YXJkcyhcbiAgICBhY3RpdmF0ZWQsXG4gICAgJ2JlZm9yZVJvdXRlRW50ZXInLFxuICAgIGZ1bmN0aW9uIChndWFyZCwgXywgbWF0Y2gsIGtleSkge1xuICAgICAgcmV0dXJuIGJpbmRFbnRlckd1YXJkKGd1YXJkLCBtYXRjaCwga2V5KVxuICAgIH1cbiAgKVxufVxuXG5mdW5jdGlvbiBiaW5kRW50ZXJHdWFyZCAoXG4gIGd1YXJkLFxuICBtYXRjaCxcbiAga2V5XG4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJvdXRlRW50ZXJHdWFyZCAodG8sIGZyb20sIG5leHQpIHtcbiAgICByZXR1cm4gZ3VhcmQodG8sIGZyb20sIGZ1bmN0aW9uIChjYikge1xuICAgICAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAoIW1hdGNoLmVudGVyZWRDYnNba2V5XSkge1xuICAgICAgICAgIG1hdGNoLmVudGVyZWRDYnNba2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIG1hdGNoLmVudGVyZWRDYnNba2V5XS5wdXNoKGNiKTtcbiAgICAgIH1cbiAgICAgIG5leHQoY2IpO1xuICAgIH0pXG4gIH1cbn1cblxuLyogICovXG5cbnZhciBIVE1MNUhpc3RvcnkgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChIaXN0b3J5KSB7XG4gIGZ1bmN0aW9uIEhUTUw1SGlzdG9yeSAocm91dGVyLCBiYXNlKSB7XG4gICAgSGlzdG9yeS5jYWxsKHRoaXMsIHJvdXRlciwgYmFzZSk7XG5cbiAgICB0aGlzLl9zdGFydExvY2F0aW9uID0gZ2V0TG9jYXRpb24odGhpcy5iYXNlKTtcbiAgfVxuXG4gIGlmICggSGlzdG9yeSApIEhUTUw1SGlzdG9yeS5fX3Byb3RvX18gPSBIaXN0b3J5O1xuICBIVE1MNUhpc3RvcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggSGlzdG9yeSAmJiBIaXN0b3J5LnByb3RvdHlwZSApO1xuICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSFRNTDVIaXN0b3J5O1xuXG4gIEhUTUw1SGlzdG9yeS5wcm90b3R5cGUuc2V0dXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXR1cExpc3RlbmVycyAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5saXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMucm91dGVyO1xuICAgIHZhciBleHBlY3RTY3JvbGwgPSByb3V0ZXIub3B0aW9ucy5zY3JvbGxCZWhhdmlvcjtcbiAgICB2YXIgc3VwcG9ydHNTY3JvbGwgPSBzdXBwb3J0c1B1c2hTdGF0ZSAmJiBleHBlY3RTY3JvbGw7XG5cbiAgICBpZiAoc3VwcG9ydHNTY3JvbGwpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goc2V0dXBTY3JvbGwoKSk7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZVJvdXRpbmdFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcyQxLmN1cnJlbnQ7XG5cbiAgICAgIC8vIEF2b2lkaW5nIGZpcnN0IGBwb3BzdGF0ZWAgZXZlbnQgZGlzcGF0Y2hlZCBpbiBzb21lIGJyb3dzZXJzIGJ1dCBmaXJzdFxuICAgICAgLy8gaGlzdG9yeSByb3V0ZSBub3QgdXBkYXRlZCBzaW5jZSBhc3luYyBndWFyZCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24odGhpcyQxLmJhc2UpO1xuICAgICAgaWYgKHRoaXMkMS5jdXJyZW50ID09PSBTVEFSVCAmJiBsb2NhdGlvbiA9PT0gdGhpcyQxLl9zdGFydExvY2F0aW9uKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzJDEudHJhbnNpdGlvblRvKGxvY2F0aW9uLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgaWYgKHN1cHBvcnRzU2Nyb2xsKSB7XG4gICAgICAgICAgaGFuZGxlU2Nyb2xsKHJvdXRlciwgcm91dGUsIGN1cnJlbnQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGhhbmRsZVJvdXRpbmdFdmVudCk7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBoYW5kbGVSb3V0aW5nRXZlbnQpO1xuICAgIH0pO1xuICB9O1xuXG4gIEhUTUw1SGlzdG9yeS5wcm90b3R5cGUuZ28gPSBmdW5jdGlvbiBnbyAobikge1xuICAgIHdpbmRvdy5oaXN0b3J5LmdvKG4pO1xuICB9O1xuXG4gIEhUTUw1SGlzdG9yeS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIHB1c2ggKGxvY2F0aW9uLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgcmVmID0gdGhpcztcbiAgICB2YXIgZnJvbVJvdXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgdGhpcy50cmFuc2l0aW9uVG8obG9jYXRpb24sIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgcHVzaFN0YXRlKGNsZWFuUGF0aCh0aGlzJDEuYmFzZSArIHJvdXRlLmZ1bGxQYXRoKSk7XG4gICAgICBoYW5kbGVTY3JvbGwodGhpcyQxLnJvdXRlciwgcm91dGUsIGZyb21Sb3V0ZSwgZmFsc2UpO1xuICAgICAgb25Db21wbGV0ZSAmJiBvbkNvbXBsZXRlKHJvdXRlKTtcbiAgICB9LCBvbkFib3J0KTtcbiAgfTtcblxuICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiByZXBsYWNlIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdmFyIHJlZiA9IHRoaXM7XG4gICAgdmFyIGZyb21Sb3V0ZSA9IHJlZi5jdXJyZW50O1xuICAgIHRoaXMudHJhbnNpdGlvblRvKGxvY2F0aW9uLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgIHJlcGxhY2VTdGF0ZShjbGVhblBhdGgodGhpcyQxLmJhc2UgKyByb3V0ZS5mdWxsUGF0aCkpO1xuICAgICAgaGFuZGxlU2Nyb2xsKHRoaXMkMS5yb3V0ZXIsIHJvdXRlLCBmcm9tUm91dGUsIGZhbHNlKTtcbiAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgfSwgb25BYm9ydCk7XG4gIH07XG5cbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5lbnN1cmVVUkwgPSBmdW5jdGlvbiBlbnN1cmVVUkwgKHB1c2gpIHtcbiAgICBpZiAoZ2V0TG9jYXRpb24odGhpcy5iYXNlKSAhPT0gdGhpcy5jdXJyZW50LmZ1bGxQYXRoKSB7XG4gICAgICB2YXIgY3VycmVudCA9IGNsZWFuUGF0aCh0aGlzLmJhc2UgKyB0aGlzLmN1cnJlbnQuZnVsbFBhdGgpO1xuICAgICAgcHVzaCA/IHB1c2hTdGF0ZShjdXJyZW50KSA6IHJlcGxhY2VTdGF0ZShjdXJyZW50KTtcbiAgICB9XG4gIH07XG5cbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5nZXRDdXJyZW50TG9jYXRpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50TG9jYXRpb24gKCkge1xuICAgIHJldHVybiBnZXRMb2NhdGlvbih0aGlzLmJhc2UpXG4gIH07XG5cbiAgcmV0dXJuIEhUTUw1SGlzdG9yeTtcbn0oSGlzdG9yeSkpO1xuXG5mdW5jdGlvbiBnZXRMb2NhdGlvbiAoYmFzZSkge1xuICB2YXIgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgaWYgKGJhc2UgJiYgcGF0aC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoYmFzZS50b0xvd2VyQ2FzZSgpKSA9PT0gMCkge1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKGJhc2UubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gKHBhdGggfHwgJy8nKSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKyB3aW5kb3cubG9jYXRpb24uaGFzaFxufVxuXG4vKiAgKi9cblxudmFyIEhhc2hIaXN0b3J5ID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoSGlzdG9yeSkge1xuICBmdW5jdGlvbiBIYXNoSGlzdG9yeSAocm91dGVyLCBiYXNlLCBmYWxsYmFjaykge1xuICAgIEhpc3RvcnkuY2FsbCh0aGlzLCByb3V0ZXIsIGJhc2UpO1xuICAgIC8vIGNoZWNrIGhpc3RvcnkgZmFsbGJhY2sgZGVlcGxpbmtpbmdcbiAgICBpZiAoZmFsbGJhY2sgJiYgY2hlY2tGYWxsYmFjayh0aGlzLmJhc2UpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZW5zdXJlU2xhc2goKTtcbiAgfVxuXG4gIGlmICggSGlzdG9yeSApIEhhc2hIaXN0b3J5Ll9fcHJvdG9fXyA9IEhpc3Rvcnk7XG4gIEhhc2hIaXN0b3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEhpc3RvcnkgJiYgSGlzdG9yeS5wcm90b3R5cGUgKTtcbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGFzaEhpc3Rvcnk7XG5cbiAgLy8gdGhpcyBpcyBkZWxheWVkIHVudGlsIHRoZSBhcHAgbW91bnRzXG4gIC8vIHRvIGF2b2lkIHRoZSBoYXNoY2hhbmdlIGxpc3RlbmVyIGJlaW5nIGZpcmVkIHRvbyBlYXJseVxuICBIYXNoSGlzdG9yeS5wcm90b3R5cGUuc2V0dXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXR1cExpc3RlbmVycyAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5saXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMucm91dGVyO1xuICAgIHZhciBleHBlY3RTY3JvbGwgPSByb3V0ZXIub3B0aW9ucy5zY3JvbGxCZWhhdmlvcjtcbiAgICB2YXIgc3VwcG9ydHNTY3JvbGwgPSBzdXBwb3J0c1B1c2hTdGF0ZSAmJiBleHBlY3RTY3JvbGw7XG5cbiAgICBpZiAoc3VwcG9ydHNTY3JvbGwpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goc2V0dXBTY3JvbGwoKSk7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZVJvdXRpbmdFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcyQxLmN1cnJlbnQ7XG4gICAgICBpZiAoIWVuc3VyZVNsYXNoKCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzJDEudHJhbnNpdGlvblRvKGdldEhhc2goKSwgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICAgIGlmIChzdXBwb3J0c1Njcm9sbCkge1xuICAgICAgICAgIGhhbmRsZVNjcm9sbCh0aGlzJDEucm91dGVyLCByb3V0ZSwgY3VycmVudCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdXBwb3J0c1B1c2hTdGF0ZSkge1xuICAgICAgICAgIHJlcGxhY2VIYXNoKHJvdXRlLmZ1bGxQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICB2YXIgZXZlbnRUeXBlID0gc3VwcG9ydHNQdXNoU3RhdGUgPyAncG9wc3RhdGUnIDogJ2hhc2hjaGFuZ2UnO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgZXZlbnRUeXBlLFxuICAgICAgaGFuZGxlUm91dGluZ0V2ZW50XG4gICAgKTtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlUm91dGluZ0V2ZW50KTtcbiAgICB9KTtcbiAgfTtcblxuICBIYXNoSGlzdG9yeS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIHB1c2ggKGxvY2F0aW9uLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgcmVmID0gdGhpcztcbiAgICB2YXIgZnJvbVJvdXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgdGhpcy50cmFuc2l0aW9uVG8oXG4gICAgICBsb2NhdGlvbixcbiAgICAgIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICBwdXNoSGFzaChyb3V0ZS5mdWxsUGF0aCk7XG4gICAgICAgIGhhbmRsZVNjcm9sbCh0aGlzJDEucm91dGVyLCByb3V0ZSwgZnJvbVJvdXRlLCBmYWxzZSk7XG4gICAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgICB9LFxuICAgICAgb25BYm9ydFxuICAgICk7XG4gIH07XG5cbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiByZXBsYWNlIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdmFyIHJlZiA9IHRoaXM7XG4gICAgdmFyIGZyb21Sb3V0ZSA9IHJlZi5jdXJyZW50O1xuICAgIHRoaXMudHJhbnNpdGlvblRvKFxuICAgICAgbG9jYXRpb24sXG4gICAgICBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgcmVwbGFjZUhhc2gocm91dGUuZnVsbFBhdGgpO1xuICAgICAgICBoYW5kbGVTY3JvbGwodGhpcyQxLnJvdXRlciwgcm91dGUsIGZyb21Sb3V0ZSwgZmFsc2UpO1xuICAgICAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUocm91dGUpO1xuICAgICAgfSxcbiAgICAgIG9uQWJvcnRcbiAgICApO1xuICB9O1xuXG4gIEhhc2hIaXN0b3J5LnByb3RvdHlwZS5nbyA9IGZ1bmN0aW9uIGdvIChuKSB7XG4gICAgd2luZG93Lmhpc3RvcnkuZ28obik7XG4gIH07XG5cbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLmVuc3VyZVVSTCA9IGZ1bmN0aW9uIGVuc3VyZVVSTCAocHVzaCkge1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50LmZ1bGxQYXRoO1xuICAgIGlmIChnZXRIYXNoKCkgIT09IGN1cnJlbnQpIHtcbiAgICAgIHB1c2ggPyBwdXNoSGFzaChjdXJyZW50KSA6IHJlcGxhY2VIYXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgfTtcblxuICBIYXNoSGlzdG9yeS5wcm90b3R5cGUuZ2V0Q3VycmVudExvY2F0aW9uID0gZnVuY3Rpb24gZ2V0Q3VycmVudExvY2F0aW9uICgpIHtcbiAgICByZXR1cm4gZ2V0SGFzaCgpXG4gIH07XG5cbiAgcmV0dXJuIEhhc2hIaXN0b3J5O1xufShIaXN0b3J5KSk7XG5cbmZ1bmN0aW9uIGNoZWNrRmFsbGJhY2sgKGJhc2UpIHtcbiAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oYmFzZSk7XG4gIGlmICghL15cXC8jLy50ZXN0KGxvY2F0aW9uKSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGNsZWFuUGF0aChiYXNlICsgJy8jJyArIGxvY2F0aW9uKSk7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVTbGFzaCAoKSB7XG4gIHZhciBwYXRoID0gZ2V0SGFzaCgpO1xuICBpZiAocGF0aC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmVwbGFjZUhhc2goJy8nICsgcGF0aCk7XG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBnZXRIYXNoICgpIHtcbiAgLy8gV2UgY2FuJ3QgdXNlIHdpbmRvdy5sb2NhdGlvbi5oYXNoIGhlcmUgYmVjYXVzZSBpdCdzIG5vdFxuICAvLyBjb25zaXN0ZW50IGFjcm9zcyBicm93c2VycyAtIEZpcmVmb3ggd2lsbCBwcmUtZGVjb2RlIGl0IVxuICB2YXIgaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB2YXIgaW5kZXggPSBocmVmLmluZGV4T2YoJyMnKTtcbiAgLy8gZW1wdHkgcGF0aFxuICBpZiAoaW5kZXggPCAwKSB7IHJldHVybiAnJyB9XG5cbiAgaHJlZiA9IGhyZWYuc2xpY2UoaW5kZXggKyAxKTtcblxuICByZXR1cm4gaHJlZlxufVxuXG5mdW5jdGlvbiBnZXRVcmwgKHBhdGgpIHtcbiAgdmFyIGhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgdmFyIGkgPSBocmVmLmluZGV4T2YoJyMnKTtcbiAgdmFyIGJhc2UgPSBpID49IDAgPyBocmVmLnNsaWNlKDAsIGkpIDogaHJlZjtcbiAgcmV0dXJuIChiYXNlICsgXCIjXCIgKyBwYXRoKVxufVxuXG5mdW5jdGlvbiBwdXNoSGFzaCAocGF0aCkge1xuICBpZiAoc3VwcG9ydHNQdXNoU3RhdGUpIHtcbiAgICBwdXNoU3RhdGUoZ2V0VXJsKHBhdGgpKTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IHBhdGg7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZUhhc2ggKHBhdGgpIHtcbiAgaWYgKHN1cHBvcnRzUHVzaFN0YXRlKSB7XG4gICAgcmVwbGFjZVN0YXRlKGdldFVybChwYXRoKSk7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoZ2V0VXJsKHBhdGgpKTtcbiAgfVxufVxuXG4vKiAgKi9cblxudmFyIEFic3RyYWN0SGlzdG9yeSA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKEhpc3RvcnkpIHtcbiAgZnVuY3Rpb24gQWJzdHJhY3RIaXN0b3J5IChyb3V0ZXIsIGJhc2UpIHtcbiAgICBIaXN0b3J5LmNhbGwodGhpcywgcm91dGVyLCBiYXNlKTtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5pbmRleCA9IC0xO1xuICB9XG5cbiAgaWYgKCBIaXN0b3J5ICkgQWJzdHJhY3RIaXN0b3J5Ll9fcHJvdG9fXyA9IEhpc3Rvcnk7XG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBIaXN0b3J5ICYmIEhpc3RvcnkucHJvdG90eXBlICk7XG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBYnN0cmFjdEhpc3Rvcnk7XG5cbiAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaCAobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIHRoaXMudHJhbnNpdGlvblRvKFxuICAgICAgbG9jYXRpb24sXG4gICAgICBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgdGhpcyQxLnN0YWNrID0gdGhpcyQxLnN0YWNrLnNsaWNlKDAsIHRoaXMkMS5pbmRleCArIDEpLmNvbmNhdChyb3V0ZSk7XG4gICAgICAgIHRoaXMkMS5pbmRleCsrO1xuICAgICAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUocm91dGUpO1xuICAgICAgfSxcbiAgICAgIG9uQWJvcnRcbiAgICApO1xuICB9O1xuXG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIHJlcGxhY2UgKGxvY2F0aW9uLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25UbyhcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICAgIHRoaXMkMS5zdGFjayA9IHRoaXMkMS5zdGFjay5zbGljZSgwLCB0aGlzJDEuaW5kZXgpLmNvbmNhdChyb3V0ZSk7XG4gICAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgICB9LFxuICAgICAgb25BYm9ydFxuICAgICk7XG4gIH07XG5cbiAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5nbyA9IGZ1bmN0aW9uIGdvIChuKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgdGFyZ2V0SW5kZXggPSB0aGlzLmluZGV4ICsgbjtcbiAgICBpZiAodGFyZ2V0SW5kZXggPCAwIHx8IHRhcmdldEluZGV4ID49IHRoaXMuc3RhY2subGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHJvdXRlID0gdGhpcy5zdGFja1t0YXJnZXRJbmRleF07XG4gICAgdGhpcy5jb25maXJtVHJhbnNpdGlvbihcbiAgICAgIHJvdXRlLFxuICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldiA9IHRoaXMkMS5jdXJyZW50O1xuICAgICAgICB0aGlzJDEuaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgICAgdGhpcyQxLnVwZGF0ZVJvdXRlKHJvdXRlKTtcbiAgICAgICAgdGhpcyQxLnJvdXRlci5hZnRlckhvb2tzLmZvckVhY2goZnVuY3Rpb24gKGhvb2spIHtcbiAgICAgICAgICBob29rICYmIGhvb2socm91dGUsIHByZXYpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGlmIChpc05hdmlnYXRpb25GYWlsdXJlKGVyciwgTmF2aWdhdGlvbkZhaWx1cmVUeXBlLmR1cGxpY2F0ZWQpKSB7XG4gICAgICAgICAgdGhpcyQxLmluZGV4ID0gdGFyZ2V0SW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUuZ2V0Q3VycmVudExvY2F0aW9uID0gZnVuY3Rpb24gZ2V0Q3VycmVudExvY2F0aW9uICgpIHtcbiAgICB2YXIgY3VycmVudCA9IHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gY3VycmVudCA/IGN1cnJlbnQuZnVsbFBhdGggOiAnLydcbiAgfTtcblxuICBBYnN0cmFjdEhpc3RvcnkucHJvdG90eXBlLmVuc3VyZVVSTCA9IGZ1bmN0aW9uIGVuc3VyZVVSTCAoKSB7XG4gICAgLy8gbm9vcFxuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdEhpc3Rvcnk7XG59KEhpc3RvcnkpKTtcblxuLyogICovXG5cbnZhciBWdWVSb3V0ZXIgPSBmdW5jdGlvbiBWdWVSb3V0ZXIgKG9wdGlvbnMpIHtcbiAgaWYgKCBvcHRpb25zID09PSB2b2lkIDAgKSBvcHRpb25zID0ge307XG5cbiAgdGhpcy5hcHAgPSBudWxsO1xuICB0aGlzLmFwcHMgPSBbXTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5iZWZvcmVIb29rcyA9IFtdO1xuICB0aGlzLnJlc29sdmVIb29rcyA9IFtdO1xuICB0aGlzLmFmdGVySG9va3MgPSBbXTtcbiAgdGhpcy5tYXRjaGVyID0gY3JlYXRlTWF0Y2hlcihvcHRpb25zLnJvdXRlcyB8fCBbXSwgdGhpcyk7XG5cbiAgdmFyIG1vZGUgPSBvcHRpb25zLm1vZGUgfHwgJ2hhc2gnO1xuICB0aGlzLmZhbGxiYWNrID1cbiAgICBtb2RlID09PSAnaGlzdG9yeScgJiYgIXN1cHBvcnRzUHVzaFN0YXRlICYmIG9wdGlvbnMuZmFsbGJhY2sgIT09IGZhbHNlO1xuICBpZiAodGhpcy5mYWxsYmFjaykge1xuICAgIG1vZGUgPSAnaGFzaCc7XG4gIH1cbiAgaWYgKCFpbkJyb3dzZXIpIHtcbiAgICBtb2RlID0gJ2Fic3RyYWN0JztcbiAgfVxuICB0aGlzLm1vZGUgPSBtb2RlO1xuXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ2hpc3RvcnknOlxuICAgICAgdGhpcy5oaXN0b3J5ID0gbmV3IEhUTUw1SGlzdG9yeSh0aGlzLCBvcHRpb25zLmJhc2UpO1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdoYXNoJzpcbiAgICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBIYXNoSGlzdG9yeSh0aGlzLCBvcHRpb25zLmJhc2UsIHRoaXMuZmFsbGJhY2spO1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdhYnN0cmFjdCc6XG4gICAgICB0aGlzLmhpc3RvcnkgPSBuZXcgQWJzdHJhY3RIaXN0b3J5KHRoaXMsIG9wdGlvbnMuYmFzZSk7XG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBhc3NlcnQoZmFsc2UsIChcImludmFsaWQgbW9kZTogXCIgKyBtb2RlKSk7XG4gICAgICB9XG4gIH1cbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IGN1cnJlbnRSb3V0ZTogeyBjb25maWd1cmFibGU6IHRydWUgfSB9O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gbWF0Y2ggKHJhdywgY3VycmVudCwgcmVkaXJlY3RlZEZyb20pIHtcbiAgcmV0dXJuIHRoaXMubWF0Y2hlci5tYXRjaChyYXcsIGN1cnJlbnQsIHJlZGlyZWN0ZWRGcm9tKVxufTtcblxucHJvdG90eXBlQWNjZXNzb3JzLmN1cnJlbnRSb3V0ZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmhpc3RvcnkgJiYgdGhpcy5oaXN0b3J5LmN1cnJlbnRcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIGluaXQgKGFwcCAvKiBWdWUgY29tcG9uZW50IGluc3RhbmNlICovKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJlxuICAgIGFzc2VydChcbiAgICAgIGluc3RhbGwuaW5zdGFsbGVkLFxuICAgICAgXCJub3QgaW5zdGFsbGVkLiBNYWtlIHN1cmUgdG8gY2FsbCBgVnVlLnVzZShWdWVSb3V0ZXIpYCBcIiArXG4gICAgICAgIFwiYmVmb3JlIGNyZWF0aW5nIHJvb3QgaW5zdGFuY2UuXCJcbiAgICApO1xuXG4gIHRoaXMuYXBwcy5wdXNoKGFwcCk7XG5cbiAgLy8gc2V0IHVwIGFwcCBkZXN0cm95ZWQgaGFuZGxlclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLXJvdXRlci9pc3N1ZXMvMjYzOVxuICBhcHAuJG9uY2UoJ2hvb2s6ZGVzdHJveWVkJywgZnVuY3Rpb24gKCkge1xuICAgIC8vIGNsZWFuIG91dCBhcHAgZnJvbSB0aGlzLmFwcHMgYXJyYXkgb25jZSBkZXN0cm95ZWRcbiAgICB2YXIgaW5kZXggPSB0aGlzJDEuYXBwcy5pbmRleE9mKGFwcCk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHsgdGhpcyQxLmFwcHMuc3BsaWNlKGluZGV4LCAxKTsgfVxuICAgIC8vIGVuc3VyZSB3ZSBzdGlsbCBoYXZlIGEgbWFpbiBhcHAgb3IgbnVsbCBpZiBubyBhcHBzXG4gICAgLy8gd2UgZG8gbm90IHJlbGVhc2UgdGhlIHJvdXRlciBzbyBpdCBjYW4gYmUgcmV1c2VkXG4gICAgaWYgKHRoaXMkMS5hcHAgPT09IGFwcCkgeyB0aGlzJDEuYXBwID0gdGhpcyQxLmFwcHNbMF0gfHwgbnVsbDsgfVxuXG4gICAgaWYgKCF0aGlzJDEuYXBwKSB7IHRoaXMkMS5oaXN0b3J5LnRlYXJkb3duKCk7IH1cbiAgfSk7XG5cbiAgLy8gbWFpbiBhcHAgcHJldmlvdXNseSBpbml0aWFsaXplZFxuICAvLyByZXR1cm4gYXMgd2UgZG9uJ3QgbmVlZCB0byBzZXQgdXAgbmV3IGhpc3RvcnkgbGlzdGVuZXJcbiAgaWYgKHRoaXMuYXBwKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLmFwcCA9IGFwcDtcblxuICB2YXIgaGlzdG9yeSA9IHRoaXMuaGlzdG9yeTtcblxuICBpZiAoaGlzdG9yeSBpbnN0YW5jZW9mIEhUTUw1SGlzdG9yeSB8fCBoaXN0b3J5IGluc3RhbmNlb2YgSGFzaEhpc3RvcnkpIHtcbiAgICB2YXIgaGFuZGxlSW5pdGlhbFNjcm9sbCA9IGZ1bmN0aW9uIChyb3V0ZU9yRXJyb3IpIHtcbiAgICAgIHZhciBmcm9tID0gaGlzdG9yeS5jdXJyZW50O1xuICAgICAgdmFyIGV4cGVjdFNjcm9sbCA9IHRoaXMkMS5vcHRpb25zLnNjcm9sbEJlaGF2aW9yO1xuICAgICAgdmFyIHN1cHBvcnRzU2Nyb2xsID0gc3VwcG9ydHNQdXNoU3RhdGUgJiYgZXhwZWN0U2Nyb2xsO1xuXG4gICAgICBpZiAoc3VwcG9ydHNTY3JvbGwgJiYgJ2Z1bGxQYXRoJyBpbiByb3V0ZU9yRXJyb3IpIHtcbiAgICAgICAgaGFuZGxlU2Nyb2xsKHRoaXMkMSwgcm91dGVPckVycm9yLCBmcm9tLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgc2V0dXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiAocm91dGVPckVycm9yKSB7XG4gICAgICBoaXN0b3J5LnNldHVwTGlzdGVuZXJzKCk7XG4gICAgICBoYW5kbGVJbml0aWFsU2Nyb2xsKHJvdXRlT3JFcnJvcik7XG4gICAgfTtcbiAgICBoaXN0b3J5LnRyYW5zaXRpb25UbyhcbiAgICAgIGhpc3RvcnkuZ2V0Q3VycmVudExvY2F0aW9uKCksXG4gICAgICBzZXR1cExpc3RlbmVycyxcbiAgICAgIHNldHVwTGlzdGVuZXJzXG4gICAgKTtcbiAgfVxuXG4gIGhpc3RvcnkubGlzdGVuKGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgIHRoaXMkMS5hcHBzLmZvckVhY2goZnVuY3Rpb24gKGFwcCkge1xuICAgICAgYXBwLl9yb3V0ZSA9IHJvdXRlO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuYmVmb3JlRWFjaCA9IGZ1bmN0aW9uIGJlZm9yZUVhY2ggKGZuKSB7XG4gIHJldHVybiByZWdpc3Rlckhvb2sodGhpcy5iZWZvcmVIb29rcywgZm4pXG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmJlZm9yZVJlc29sdmUgPSBmdW5jdGlvbiBiZWZvcmVSZXNvbHZlIChmbikge1xuICByZXR1cm4gcmVnaXN0ZXJIb29rKHRoaXMucmVzb2x2ZUhvb2tzLCBmbilcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuYWZ0ZXJFYWNoID0gZnVuY3Rpb24gYWZ0ZXJFYWNoIChmbikge1xuICByZXR1cm4gcmVnaXN0ZXJIb29rKHRoaXMuYWZ0ZXJIb29rcywgZm4pXG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLm9uUmVhZHkgPSBmdW5jdGlvbiBvblJlYWR5IChjYiwgZXJyb3JDYikge1xuICB0aGlzLmhpc3Rvcnkub25SZWFkeShjYiwgZXJyb3JDYik7XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiBvbkVycm9yIChlcnJvckNiKSB7XG4gIHRoaXMuaGlzdG9yeS5vbkVycm9yKGVycm9yQ2IpO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaCAobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAvLyAkZmxvdy1kaXNhYmxlLWxpbmVcbiAgaWYgKCFvbkNvbXBsZXRlICYmICFvbkFib3J0ICYmIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB0aGlzJDEuaGlzdG9yeS5wdXNoKGxvY2F0aW9uLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5oaXN0b3J5LnB1c2gobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpO1xuICB9XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiByZXBsYWNlIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIC8vICRmbG93LWRpc2FibGUtbGluZVxuICBpZiAoIW9uQ29tcGxldGUgJiYgIW9uQWJvcnQgJiYgdHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHRoaXMkMS5oaXN0b3J5LnJlcGxhY2UobG9jYXRpb24sIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmhpc3RvcnkucmVwbGFjZShsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCk7XG4gIH1cbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuZ28gPSBmdW5jdGlvbiBnbyAobikge1xuICB0aGlzLmhpc3RvcnkuZ28obik7XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmJhY2sgPSBmdW5jdGlvbiBiYWNrICgpIHtcbiAgdGhpcy5nbygtMSk7XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiBmb3J3YXJkICgpIHtcbiAgdGhpcy5nbygxKTtcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuZ2V0TWF0Y2hlZENvbXBvbmVudHMgPSBmdW5jdGlvbiBnZXRNYXRjaGVkQ29tcG9uZW50cyAodG8pIHtcbiAgdmFyIHJvdXRlID0gdG9cbiAgICA/IHRvLm1hdGNoZWRcbiAgICAgID8gdG9cbiAgICAgIDogdGhpcy5yZXNvbHZlKHRvKS5yb3V0ZVxuICAgIDogdGhpcy5jdXJyZW50Um91dGU7XG4gIGlmICghcm91dGUpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFxuICAgIFtdLFxuICAgIHJvdXRlLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChtKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMobS5jb21wb25lbnRzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gbS5jb21wb25lbnRzW2tleV1cbiAgICAgIH0pXG4gICAgfSlcbiAgKVxufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24gcmVzb2x2ZSAoXG4gIHRvLFxuICBjdXJyZW50LFxuICBhcHBlbmRcbikge1xuICBjdXJyZW50ID0gY3VycmVudCB8fCB0aGlzLmhpc3RvcnkuY3VycmVudDtcbiAgdmFyIGxvY2F0aW9uID0gbm9ybWFsaXplTG9jYXRpb24odG8sIGN1cnJlbnQsIGFwcGVuZCwgdGhpcyk7XG4gIHZhciByb3V0ZSA9IHRoaXMubWF0Y2gobG9jYXRpb24sIGN1cnJlbnQpO1xuICB2YXIgZnVsbFBhdGggPSByb3V0ZS5yZWRpcmVjdGVkRnJvbSB8fCByb3V0ZS5mdWxsUGF0aDtcbiAgdmFyIGJhc2UgPSB0aGlzLmhpc3RvcnkuYmFzZTtcbiAgdmFyIGhyZWYgPSBjcmVhdGVIcmVmKGJhc2UsIGZ1bGxQYXRoLCB0aGlzLm1vZGUpO1xuICByZXR1cm4ge1xuICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICByb3V0ZTogcm91dGUsXG4gICAgaHJlZjogaHJlZixcbiAgICAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdFxuICAgIG5vcm1hbGl6ZWRUbzogbG9jYXRpb24sXG4gICAgcmVzb2x2ZWQ6IHJvdXRlXG4gIH1cbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuZ2V0Um91dGVzID0gZnVuY3Rpb24gZ2V0Um91dGVzICgpIHtcbiAgcmV0dXJuIHRoaXMubWF0Y2hlci5nZXRSb3V0ZXMoKVxufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5hZGRSb3V0ZSA9IGZ1bmN0aW9uIGFkZFJvdXRlIChwYXJlbnRPclJvdXRlLCByb3V0ZSkge1xuICB0aGlzLm1hdGNoZXIuYWRkUm91dGUocGFyZW50T3JSb3V0ZSwgcm91dGUpO1xuICBpZiAodGhpcy5oaXN0b3J5LmN1cnJlbnQgIT09IFNUQVJUKSB7XG4gICAgdGhpcy5oaXN0b3J5LnRyYW5zaXRpb25Ubyh0aGlzLmhpc3RvcnkuZ2V0Q3VycmVudExvY2F0aW9uKCkpO1xuICB9XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmFkZFJvdXRlcyA9IGZ1bmN0aW9uIGFkZFJvdXRlcyAocm91dGVzKSB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgd2FybihmYWxzZSwgJ3JvdXRlci5hZGRSb3V0ZXMoKSBpcyBkZXByZWNhdGVkIGFuZCBoYXMgYmVlbiByZW1vdmVkIGluIFZ1ZSBSb3V0ZXIgNC4gVXNlIHJvdXRlci5hZGRSb3V0ZSgpIGluc3RlYWQuJyk7XG4gIH1cbiAgdGhpcy5tYXRjaGVyLmFkZFJvdXRlcyhyb3V0ZXMpO1xuICBpZiAodGhpcy5oaXN0b3J5LmN1cnJlbnQgIT09IFNUQVJUKSB7XG4gICAgdGhpcy5oaXN0b3J5LnRyYW5zaXRpb25Ubyh0aGlzLmhpc3RvcnkuZ2V0Q3VycmVudExvY2F0aW9uKCkpO1xuICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggVnVlUm91dGVyLnByb3RvdHlwZSwgcHJvdG90eXBlQWNjZXNzb3JzICk7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVySG9vayAobGlzdCwgZm4pIHtcbiAgbGlzdC5wdXNoKGZuKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaSA9IGxpc3QuaW5kZXhPZihmbik7XG4gICAgaWYgKGkgPiAtMSkgeyBsaXN0LnNwbGljZShpLCAxKTsgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhyZWYgKGJhc2UsIGZ1bGxQYXRoLCBtb2RlKSB7XG4gIHZhciBwYXRoID0gbW9kZSA9PT0gJ2hhc2gnID8gJyMnICsgZnVsbFBhdGggOiBmdWxsUGF0aDtcbiAgcmV0dXJuIGJhc2UgPyBjbGVhblBhdGgoYmFzZSArICcvJyArIHBhdGgpIDogcGF0aFxufVxuXG5WdWVSb3V0ZXIuaW5zdGFsbCA9IGluc3RhbGw7XG5WdWVSb3V0ZXIudmVyc2lvbiA9ICczLjUuMSc7XG5WdWVSb3V0ZXIuaXNOYXZpZ2F0aW9uRmFpbHVyZSA9IGlzTmF2aWdhdGlvbkZhaWx1cmU7XG5WdWVSb3V0ZXIuTmF2aWdhdGlvbkZhaWx1cmVUeXBlID0gTmF2aWdhdGlvbkZhaWx1cmVUeXBlO1xuVnVlUm91dGVyLlNUQVJUX0xPQ0FUSU9OID0gU1RBUlQ7XG5cbmlmIChpbkJyb3dzZXIgJiYgd2luZG93LlZ1ZSkge1xuICB3aW5kb3cuVnVlLnVzZShWdWVSb3V0ZXIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBWdWVSb3V0ZXI7XG4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IG5ldyBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG59IGNhdGNoIChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKSBnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luIiwiaW1wb3J0IHsgcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnMgfSBmcm9tIFwiLi9EYXNoYm9hcmQudnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPWFmMDk0NGI0JnNjb3BlZD10cnVlJlwiXG5pbXBvcnQgc2NyaXB0IGZyb20gXCIuL0Rhc2hib2FyZC52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCJcbmV4cG9ydCAqIGZyb20gXCIuL0Rhc2hib2FyZC52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCJcblxuXG4vKiBub3JtYWxpemUgY29tcG9uZW50ICovXG5pbXBvcnQgbm9ybWFsaXplciBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9ydW50aW1lL2NvbXBvbmVudE5vcm1hbGl6ZXIuanNcIlxudmFyIGNvbXBvbmVudCA9IG5vcm1hbGl6ZXIoXG4gIHNjcmlwdCxcbiAgcmVuZGVyLFxuICBzdGF0aWNSZW5kZXJGbnMsXG4gIGZhbHNlLFxuICBudWxsLFxuICBcImFmMDk0NGI0XCIsXG4gIG51bGxcbiAgXG4pXG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7XG4gIHZhciBhcGkgPSByZXF1aXJlKFwiL1VzZXJzL21hYy9Qcm9qZWN0cy9taWtoYWlsb3Zza3kvbm9kZV9tb2R1bGVzL3Z1ZS1ob3QtcmVsb2FkLWFwaS9kaXN0L2luZGV4LmpzXCIpXG4gIGFwaS5pbnN0YWxsKHJlcXVpcmUoJ3Z1ZScpKVxuICBpZiAoYXBpLmNvbXBhdGlibGUpIHtcbiAgICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gICAgaWYgKCFhcGkuaXNSZWNvcmRlZCgnYWYwOTQ0YjQnKSkge1xuICAgICAgYXBpLmNyZWF0ZVJlY29yZCgnYWYwOTQ0YjQnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbG9hZCgnYWYwOTQ0YjQnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9XG4gICAgbW9kdWxlLmhvdC5hY2NlcHQoXCIuL0Rhc2hib2FyZC52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9YWYwOTQ0YjQmc2NvcGVkPXRydWUmXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGFwaS5yZXJlbmRlcignYWYwOTQ0YjQnLCB7XG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZuc1xuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5jb21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInJlc291cmNlcy9qcy9hZG1pbi9EYXNoYm9hcmQudnVlXCJcbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudC5leHBvcnRzIiwiaW1wb3J0IG1vZCBmcm9tIFwiLSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/cmVmLS00LTAhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9EYXNoYm9hcmQudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzJlwiOyBleHBvcnQgZGVmYXVsdCBtb2Q7IGV4cG9ydCAqIGZyb20gXCItIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9iYWJlbC1sb2FkZXIvbGliL2luZGV4LmpzPz9yZWYtLTQtMCEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL0Rhc2hib2FyZC52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCIiLCJleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvbG9hZGVycy90ZW1wbGF0ZUxvYWRlci5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9pbmRleC5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vRGFzaGJvYXJkLnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD1hZjA5NDRiNCZzY29wZWQ9dHJ1ZSZcIiIsInJlcXVpcmUoJy4vYm9vdHN0cmFwJyk7XG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSBcInZ1ZS1yb3V0ZXJcIlxuaW1wb3J0IHJvdXRlciBmcm9tIFwiLi9yb3V0ZXJcIlxuaW1wb3J0IFZ1ZU1xIGZyb20gJ3Z1ZS1tcSc7XG5cblZ1ZVxuICAgIC51c2UoVnVlUm91dGVyKVxuICAgIC51c2UoVnVlTXEsIHtcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcbiAgICAgICAgICAgIHRhYmxldDogOTkyLFxuICAgICAgICAgICAgbGFwdG9wOiAxMjgwLFxuICAgICAgICAgICAgZGVza3RvcDogSW5maW5pdHlcbiAgICAgICAgfVxuICAgIH0pXG5cbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xuICAgIGVsOiAnI2FwcCcsXG4gICAgcm91dGVyLFxuICAgIGNyZWF0ZWQoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZWQgZnJvbSBhcHAuanMnKVxuICAgIH1cbn0pXG4iLCJcbi8qKlxuICogV2UnbGwgbG9hZCB0aGUgYXhpb3MgSFRUUCBsaWJyYXJ5IHdoaWNoIGFsbG93cyB1cyB0byBlYXNpbHkgaXNzdWUgcmVxdWVzdHNcbiAqIHRvIG91ciBMYXJhdmVsIGJhY2stZW5kLiBUaGlzIGxpYnJhcnkgYXV0b21hdGljYWxseSBoYW5kbGVzIHNlbmRpbmcgdGhlXG4gKiBDU1JGIHRva2VuIGFzIGEgaGVhZGVyIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgXCJYU1JGXCIgdG9rZW4gY29va2llLlxuICovXG5cbndpbmRvdy5heGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbndpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuLyoqXG4gKiBFY2hvIGV4cG9zZXMgYW4gZXhwcmVzc2l2ZSBBUEkgZm9yIHN1YnNjcmliaW5nIHRvIGNoYW5uZWxzIGFuZCBsaXN0ZW5pbmdcbiAqIGZvciBldmVudHMgdGhhdCBhcmUgYnJvYWRjYXN0IGJ5IExhcmF2ZWwuIEVjaG8gYW5kIGV2ZW50IGJyb2FkY2FzdGluZ1xuICogYWxsb3dzIHlvdXIgdGVhbSB0byBlYXNpbHkgYnVpbGQgcm9idXN0IHJlYWwtdGltZSB3ZWIgYXBwbGljYXRpb25zLlxuICovXG5cbi8vIGltcG9ydCBFY2hvIGZyb20gJ2xhcmF2ZWwtZWNobyc7XG5cbi8vIHdpbmRvdy5QdXNoZXIgPSByZXF1aXJlKCdwdXNoZXItanMnKTtcblxuLy8gd2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG4vLyAgICAgYnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuLy8gICAgIGtleTogcHJvY2Vzcy5lbnYuTUlYX1BVU0hFUl9BUFBfS0VZLFxuLy8gICAgIGNsdXN0ZXI6IHByb2Nlc3MuZW52Lk1JWF9QVVNIRVJfQVBQX0NMVVNURVIsXG4vLyAgICAgZm9yY2VUTFM6IHRydWVcbi8vIH0pO1xuIiwiaW1wb3J0IHsgcmVuZGVyLCBzdGF0aWNSZW5kZXJGbnMgfSBmcm9tIFwiLi9BYm91dC52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9ZmIwNWU0OWMmc2NvcGVkPXRydWUmXCJcbmltcG9ydCBzY3JpcHQgZnJvbSBcIi4vQWJvdXQudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzJlwiXG5leHBvcnQgKiBmcm9tIFwiLi9BYm91dC52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCJcblxuXG4vKiBub3JtYWxpemUgY29tcG9uZW50ICovXG5pbXBvcnQgbm9ybWFsaXplciBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9ydW50aW1lL2NvbXBvbmVudE5vcm1hbGl6ZXIuanNcIlxudmFyIGNvbXBvbmVudCA9IG5vcm1hbGl6ZXIoXG4gIHNjcmlwdCxcbiAgcmVuZGVyLFxuICBzdGF0aWNSZW5kZXJGbnMsXG4gIGZhbHNlLFxuICBudWxsLFxuICBcImZiMDVlNDljXCIsXG4gIG51bGxcbiAgXG4pXG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7XG4gIHZhciBhcGkgPSByZXF1aXJlKFwiL1VzZXJzL21hYy9Qcm9qZWN0cy9taWtoYWlsb3Zza3kvbm9kZV9tb2R1bGVzL3Z1ZS1ob3QtcmVsb2FkLWFwaS9kaXN0L2luZGV4LmpzXCIpXG4gIGFwaS5pbnN0YWxsKHJlcXVpcmUoJ3Z1ZScpKVxuICBpZiAoYXBpLmNvbXBhdGlibGUpIHtcbiAgICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gICAgaWYgKCFhcGkuaXNSZWNvcmRlZCgnZmIwNWU0OWMnKSkge1xuICAgICAgYXBpLmNyZWF0ZVJlY29yZCgnZmIwNWU0OWMnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbG9hZCgnZmIwNWU0OWMnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9XG4gICAgbW9kdWxlLmhvdC5hY2NlcHQoXCIuL0Fib3V0LnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD1mYjA1ZTQ5YyZzY29wZWQ9dHJ1ZSZcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgYXBpLnJlcmVuZGVyKCdmYjA1ZTQ5YycsIHtcbiAgICAgICAgcmVuZGVyOiByZW5kZXIsXG4gICAgICAgIHN0YXRpY1JlbmRlckZuczogc3RhdGljUmVuZGVyRm5zXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cbmNvbXBvbmVudC5vcHRpb25zLl9fZmlsZSA9IFwicmVzb3VyY2VzL2pzL2NvbXBvbmVudHMvQWJvdXQudnVlXCJcbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudC5leHBvcnRzIiwiaW1wb3J0IG1vZCBmcm9tIFwiLSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/cmVmLS00LTAhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9BYm91dC52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCI7IGV4cG9ydCBkZWZhdWx0IG1vZDsgZXhwb3J0ICogZnJvbSBcIi0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLWxvYWRlci9saWIvaW5kZXguanM/P3JlZi0tNC0wIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9pbmRleC5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vQWJvdXQudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzJlwiIiwiZXhwb3J0ICogZnJvbSBcIi0hLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2xvYWRlcnMvdGVtcGxhdGVMb2FkZXIuanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL0Fib3V0LnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD1mYjA1ZTQ5YyZzY29wZWQ9dHJ1ZSZcIiIsImltcG9ydCB7IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zIH0gZnJvbSBcIi4vTGFuZGluZy52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9MTViZjAwMDgmXCJcbmltcG9ydCBzY3JpcHQgZnJvbSBcIi4vTGFuZGluZy52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmXCJcbmV4cG9ydCAqIGZyb20gXCIuL0xhbmRpbmcudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzJlwiXG5cblxuLyogbm9ybWFsaXplIGNvbXBvbmVudCAqL1xuaW1wb3J0IG5vcm1hbGl6ZXIgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvcnVudGltZS9jb21wb25lbnROb3JtYWxpemVyLmpzXCJcbnZhciBjb21wb25lbnQgPSBub3JtYWxpemVyKFxuICBzY3JpcHQsXG4gIHJlbmRlcixcbiAgc3RhdGljUmVuZGVyRm5zLFxuICBmYWxzZSxcbiAgbnVsbCxcbiAgbnVsbCxcbiAgbnVsbFxuICBcbilcblxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgdmFyIGFwaSA9IHJlcXVpcmUoXCIvVXNlcnMvbWFjL1Byb2plY3RzL21pa2hhaWxvdnNreS9ub2RlX21vZHVsZXMvdnVlLWhvdC1yZWxvYWQtYXBpL2Rpc3QvaW5kZXguanNcIilcbiAgYXBpLmluc3RhbGwocmVxdWlyZSgndnVlJykpXG4gIGlmIChhcGkuY29tcGF0aWJsZSkge1xuICAgIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgICBpZiAoIWFwaS5pc1JlY29yZGVkKCcxNWJmMDAwOCcpKSB7XG4gICAgICBhcGkuY3JlYXRlUmVjb3JkKCcxNWJmMDAwOCcsIGNvbXBvbmVudC5vcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVsb2FkKCcxNWJmMDAwOCcsIGNvbXBvbmVudC5vcHRpb25zKVxuICAgIH1cbiAgICBtb2R1bGUuaG90LmFjY2VwdChcIi4vTGFuZGluZy52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9MTViZjAwMDgmXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGFwaS5yZXJlbmRlcignMTViZjAwMDgnLCB7XG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICBzdGF0aWNSZW5kZXJGbnM6IHN0YXRpY1JlbmRlckZuc1xuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5jb21wb25lbnQub3B0aW9ucy5fX2ZpbGUgPSBcInJlc291cmNlcy9qcy9jb21wb25lbnRzL0xhbmRpbmcudnVlXCJcbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudC5leHBvcnRzIiwiaW1wb3J0IG1vZCBmcm9tIFwiLSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/cmVmLS00LTAhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9MYW5kaW5nLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qcyZcIjsgZXhwb3J0IGRlZmF1bHQgbW9kOyBleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/cmVmLS00LTAhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9MYW5kaW5nLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qcyZcIiIsImV4cG9ydCAqIGZyb20gXCItIS4uLy4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9sb2FkZXJzL3RlbXBsYXRlTG9hZGVyLmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9MYW5kaW5nLnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD0xNWJmMDAwOCZcIiIsImltcG9ydCBWdWVSb3V0ZXIgZnJvbSBcInZ1ZS1yb3V0ZXJcIlxuaW1wb3J0IExhbmRpbmcgZnJvbSBcIi4uL2NvbXBvbmVudHMvTGFuZGluZ1wiO1xuaW1wb3J0IEFib3V0IGZyb20gXCIuLi9jb21wb25lbnRzL0Fib3V0XCI7XG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gXCIuLi9hZG1pbi9EYXNoYm9hcmRcIjtcblxuXG5jb25zdCByb3V0ZXMgPSBbXG4gICAge1xuICAgICAgICBwYXRoOiAnLycsXG4gICAgICAgIGNvbXBvbmVudDogTGFuZGluZyxcbiAgICAgICAgbmFtZTogXCJsYW5kaW5nXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcGF0aDogJy9hYm91dCcsXG4gICAgICAgIGNvbXBvbmVudDogQWJvdXQsXG4gICAgICAgIG5hbWU6IFwiYWJvdXRcIlxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIHBhdGg6ICcvYWRtaW4nLFxuICAgICAgICBjb21wb25lbnQ6IERhc2hib2FyZCxcbiAgICAgICAgbmFtZTogXCJkYXNoYm9hcmRcIlxuICAgIH0sXG5dXG5cbmNvbnN0IHJvdXRlciA9IG5ldyBWdWVSb3V0ZXIoe1xuICAgIHJvdXRlcyxcbiAgICBtb2RlOiBcImhpc3RvcnlcIlxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyO1xuXG4iXSwic291cmNlUm9vdCI6IiJ9