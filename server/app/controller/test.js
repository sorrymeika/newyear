const { Controller } = require("egg");

class TestController extends Controller {
    home() {
        const { ctx } = this;
        ctx.body = 'Hello world!';
    }
}

module.exports = TestController;