export default class {
    async action(ctx) {
        return 'ok'
    }
    async findDataById(ctx, params) {
        return params
    }
    async error(ctx, params) {
        throw new Error(`error test`)
    }
}