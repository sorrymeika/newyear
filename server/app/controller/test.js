const { Controller } = require("egg");

class TestController extends Controller {
    home() {
        const { ctx } = this;
        ctx.body = 'Hello world!';
    }

    async info() {
        const { ctx } = this;
        await ctx.service.test.test('asdf', [1, 2]);
        ctx.body = {
            name: `hello test`,
        };
    }
}

module.exports = TestController;