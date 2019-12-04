const { Controller } = require("egg");

class UserController extends Controller {
    async getVerifyCode() {
        const { ctx } = this;
        const payloadRule = {
            mobile: { type: 'string', required: true },
        };
        // 校验参数
        ctx.validate(payloadRule);

        const { mobile } = ctx.request.body;

        ctx.body = await ctx.service.user.getVerifyCode(mobile);
    }

    async login() {
        const { ctx } = this;

        const payloadRule = {
            mobile: { type: 'string', required: true },
            verifyCode: { type: 'string', required: true },
        };
        // 校验参数
        ctx.validate(payloadRule);

        const { mobile, verifyCode } = ctx.request.body;

        const res = await ctx.service.user.login(mobile, verifyCode);
        ctx.body = res;
    }

    async setNickName() {
        const { ctx } = this;
        const payloadRule = {
            nickName: { type: 'string', required: true },
        };
        ctx.validate(payloadRule);

        const res = await ctx.service.user.setNickName(ctx.request.body.nickName);
        ctx.body = res;
    }

    async addFeedback() {
        const { ctx } = this;
        const payloadRule = {
            feedback: { type: 'string', required: true },
        };
        ctx.validate(payloadRule);

        const res = await ctx.service.user.addFeedback(ctx.request.body.feedback);
        ctx.body = res;
    }

    async getUserYearRecord() {
        const { ctx } = this;
        const res = await ctx.service.user.getUserYearRecord();
        ctx.body = res;
    }

    async setUserYearRecord() {
        const { ctx } = this;
        const payloadRule = {
            content: { type: 'string', required: true },
        };
        ctx.validate(payloadRule);

        const res = await ctx.service.user.setUserYearRecord(ctx.request.body.content);
        ctx.body = res;
    }

    async getUserYear() {
        const { ctx } = this;
        const payloadRule = {
            userId: { type: 'number', required: true },
        };
        ctx.validate(payloadRule);

        const res = await ctx.service.user.getUserYear(ctx.request.body.userId);
        ctx.body = res;
    }
}

module.exports = UserController;