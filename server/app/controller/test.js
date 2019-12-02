const { Controller } = require("egg");

class TestController extends Controller {
    async home() {
        const { ctx } = this;
        // ctx.body = await this.ctx.service.user.sendSms('18721979478', 666666);
        ctx.body = 'Hello world!';
    }
}

module.exports = TestController;