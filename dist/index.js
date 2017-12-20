'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (options = {}) {
    options = Object.assign({}, {
        max: 100,
        dir: './service'
    }, options);

    let cache = (0, _lruCache2.default)(options.max);

    return async function _service(ctx, next) {
        let context = ctx.app.context;

        if (!context.service) {
            context.service = function (name = '') {
                let Service, service, path;

                path = toAbsolutePath((0, _path.join)(options.dir, `${name}.js`));

                if (cache.has(path)) {
                    return cache.get(path);
                }

                try {
                    Service = required(path);
                } catch (e) {
                    throw e.message;
                }

                service = new Service();
                cache.set(path, service);

                return service;
            };
        }

        await next();
    };
};

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function required(path) {
    let obj = require(path);

    return obj && obj.__esModule ? obj.default : obj;
}

function toAbsolutePath(path) {
    return (0, _path.isAbsolute)(path) ? path : (0, _path.resolve)((0, _path.join)(process.cwd(), path));
}