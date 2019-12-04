/* eslint-disable new-cap */
const { Service } = require("egg");
const tencentcloud = require("tencentcloud-sdk-nodejs");

const md5 = require("../util/md5");


class UserService extends Service {
    async getVerifyCode(mobile) {
        if (!/^1[0-9]{10}$/.test(mobile)) {
            return { success: false, message: '参数错误' };
        }

        const res = await this.app.redis.get('ny:vc:' + mobile);
        if (res) {
            return { success: false, message: '获取验证码过于频繁，请三分钟后再试!' };
        }

        const verifyCode = mobile == '18721979478' || mobile == '12345678901'
            ? 666666
            : Math.round(Math.random() * 1000000);

        await this.app.redis.set('ny:vc:' + mobile, JSON.stringify([Date.now(), verifyCode, 0]), 'EX', 60 * 3);

        if (mobile == '18721979478' || mobile == '12345678901') {
            return { success: true, code: 0 };
        } else {
            return await this.sendSms(mobile, verifyCode);
        }
    }

    async login(mobile, verifyCode) {
        if (!/^1[0-9]{10}$/.test(mobile)) {
            return { success: false, message: '参数错误' };
        }

        const { ctx } = this;

        const res = await this.app.redis.get('ny:vc:' + mobile);
        if (res) {
            const [time, originVerifyCode, times] = JSON.parse(res);
            const sec = Math.round((time / 1000) + (60 * 3));
            const leftSec = sec - Math.round(Date.now() / 1000);
            if (leftSec <= 1) {
                return { success: false, code: 10, message: '验证码已失效，请重新获取' };
            }
            let originVerifyCodeStr = ('000000' + originVerifyCode).slice(-6);
            if (originVerifyCodeStr == verifyCode) {

                let user;
                const userRows = await this.app.mysql.query('select id,account,nickName from user where account=?', [mobile]);
                if (!userRows.length) {
                    const res = await this.app.mysql.insert('user', {
                        account: mobile,
                        registerDt: new Date(),
                        loginDt: new Date()
                    });
                    user = {
                        id: res.insertId,
                        account: mobile
                    };
                } else {
                    user = userRows[0];
                }
                await this.app.redis.del('ny:vc:' + mobile);

                const token = md5(user.id + '.' + userRows.account + '.' + Date.now()) + md5(Math.random()).slice(-16);
                await this.app.redis.set(`ny:utk:${user.id}`, token, 'EX', 30 * 24 * 60 * 60);

                const cookieOptions = {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    signed: false
                };

                if (!/^(\d+\.\d+\.\d+\.\d+|localhost)$/.test(ctx.request.hostname)) {
                    const parts = ctx.request.hostname.split('.');
                    cookieOptions.domain = parts.slice(ctx.request.hostname.endsWith('.com.cn') ? -3 : -2).join('.');
                }

                ctx.cookies.set('ny_tk', token, cookieOptions);
                ctx.cookies.set('ny_uid', user.id, cookieOptions);

                return { success: true, code: 0, data: user };
            } else {
                if (times >= 3) {
                    return { success: false, code: 10, message: '验证码已失效，请重新获取' };
                }
                await this.app.redis.set('ny:vc:' + mobile, JSON.stringify([time, verifyCode, times + 1]), 'EX', leftSec);
                return { success: false, code: 11, message: '验证码错误' };
            }
        } else {
            return { success: false, code: 10, message: '验证码已失效，请重新获取' };
        }
    }

    async setNickName(nickName) {
        const res = await this.verifyTk();
        if (!res.success) {
            return res;
        }

        const { userId } = res;
        const updateRes = await this.app.mysql.query('update user set nickName=? where id=?', [nickName, userId]);
        return {
            success: true,
            data: updateRes
        };
    }

    async addFeedback(feedback) {
        const res = await this.verifyTk();
        const userId = res.success ? res.userId : 0;
        const addRes = await this.app.mysql.query('insert into user_feedback (content,userId) values (?,?)', [feedback, userId]);
        return {
            success: true,
            data: addRes
        };
    }

    async getUserYear(userId) {
        const rows = await this.app.mysql.query('select nickName,content from user_year_2019 join user on user.id=user_year_2019.userId where userId=?', [userId]);

        return {
            success: true,
            data: rows[0]
        };
    }

    async getUserYearRecord() {
        const res = await this.verifyTk();
        if (!res.success) {
            return res;
        }

        const { userId } = res;
        const rows = await this.app.mysql.query('select nickName,content from user_year_2019 join user on user.id=user_year_2019.userId where userId=?', [userId]);

        return {
            success: true,
            userId,
            data: rows[0]
        };
    }

    async setUserYearRecord(content) {
        const res = await this.verifyTk();
        if (!res.success) {
            return res;
        }

        const { userId } = res;
        const rows = await this.app.mysql.query('select 1 from user_year_2019 where userId=?', [userId]);
        const setRes = !rows.length
            ? await this.app.mysql.query('insert into user_year_2019 (userId,content) values (?,?)', [userId, content])
            : await this.app.mysql.query('update user_year_2019 set content=? where userId=?', [content, userId]);

        return {
            success: true,
            data: setRes
        };
    }

    async verifyTk() {
        const { ctx } = this;
        const tk = ctx.cookies.get('ny_tk', {
            signed: false
        });
        const uid = ctx.cookies.get('ny_uid', {
            signed: false
        });
        return this._verifyTk(uid, tk);
    }

    async _verifyTk(userId, token) {
        const utk = await this.app.redis.get(`ny:utk:${userId}`);
        if (token === utk) {
            return { success: true, userId };
        } else {
            return { success: false, code: 11, message: 'tk错误' };
        }
    }

    async sendSms(mobile, verifyCode) {
        if (!/^1[0-9]{10}$/.test(mobile)) {
            return { success: false, message: '参数错误' };
        }

        let verifyCodeStr = ('000000' + verifyCode).slice(-6);

        const SmsClient = tencentcloud.sms.v20190711.Client;
        const models = tencentcloud.sms.v20190711.Models;

        const Credential = tencentcloud.common.Credential;
        const ClientProfile = tencentcloud.common.ClientProfile;
        const HttpProfile = tencentcloud.common.HttpProfile;

        let cred = new Credential(this.config.tencentcloud.SecretId, this.config.tencentcloud.SecretKey);
        let httpProfile = new HttpProfile();
        httpProfile.endpoint = "sms.tencentcloudapi.com";
        let clientProfile = new ClientProfile();
        clientProfile.httpProfile = httpProfile;
        let client = new SmsClient(cred, "ap-shanghai", clientProfile);

        let req = new models.SendSmsRequest();

        let params = `{"PhoneNumberSet":["86${mobile}"],"TemplateID":"485975","Sign":"big1024","TemplateParamSet":["${verifyCodeStr}"],"SmsSdkAppid":"1400292241"}`;
        req.from_json_string(params);

        return new Promise((resolve) => {
            client.SendSms(req, function (errMsg, response) {
                if (errMsg) {
                    console.log(errMsg);
                    resolve({ success: false, message: errMsg });
                    return;
                }

                const result = response.to_json_string();
                console.log(result);
                resolve({ success: true, data: result });
            });
        });
    }
}

module.exports = UserService;
