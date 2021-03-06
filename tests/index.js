import fs from 'fs'
import koa from 'koa'
import test from 'ava'
import request from 'request'
import mount from 'koa-mount'
import service from '../src'

const req = request.defaults({
    json: true,
    baseUrl: 'http://localhost:3000'
})

test.before.cb((t) => {
    let app = new koa()
    
    app.use(async function (ctx, next) {
        try {
            await next()
        } catch(err) {
            if (err.message === 'error test') {
                ctx.body = 'error'
            }
        }
    })
    app.use(service({ dir: './tests' }))
    app.use(mount('/service', async function(ctx, next) {
        ctx.body = await ctx.service('service').findDataById(ctx, { foo: 'bar' })
    }))
    app.use(mount('/service_notfound', async function(ctx, next) {
        ctx.body = await ctx.service('foo')
    }))
    app.use(mount('/service_cache', async function(ctx, next) {
        ctx.body = await ctx.service('service').findDataById(ctx, { foo: 'bar' })
    }))
    app.use(mount('/service_error', async function(ctx, next) {
        await ctx.service('service').error(ctx, { foo: 'bar' })
    }))
    app.listen(3000, t.end)
})

test.cb('service', (t) => {
    req.get('/service', (err, res, body) => {
        t.deepEqual(body, { foo: 'bar' })
        t.end()
    })
})

test.cb('service not found', (t) => {
    req.get('/service_notfound', (err, res, body) => {
        t.deepEqual(body, 'Not Found')
        t.end()
    })
})

test.cb('service cache', (t) => {
    req.get('/service_cache', (err, res, body) => {
        t.deepEqual(body, { foo: 'bar' })
        t.end()
    })
})

test.cb('service throw error', (t) => {
    req.get('/service_error', (err, res, body) => {
        t.deepEqual(body, 'error')
        t.end()
    })
})