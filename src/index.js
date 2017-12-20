import LRU from 'lru-cache'
import { join, isAbsolute, resolve } from 'path'

export default function (options = {}) {
    options = Object.assign({}, {
        max: 100,
        dir: './service'
    }, options)

    let cache = LRU(options.max)

    return async function _service(ctx, next) {
        let context = ctx.app.context

        if (!context.service) {
            context.service = function (name = '') {
                let Service, service, path

                path = toAbsolutePath(join(options.dir, `${name}.js`))

                if (cache.has(path)) {
                    return cache.get(path)
                }

                try {
                    Service = required(path)
                } catch(e) { throw e.message }
                
                service = new Service()
                cache.set(path, service)
                
                return service
            }
        }

        await next()
    }
}

function required(path) {
    let obj = require(path)

    return obj && obj.__esModule ? obj.default : obj
}

function toAbsolutePath(path) {
    return isAbsolute(path) ? path : resolve(join(process.cwd(), path))
}