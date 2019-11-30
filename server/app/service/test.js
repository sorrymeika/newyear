/* eslint-disable new-cap */
const { Service } = require("egg");
const tencentcloud = require("tencentcloud-sdk-nodejs");

class TestService extends Service {
    test() {
    }

    async sendSms(mobile) {
        if (!/^1[0-9]{10}$/.test(mobile)) {
            return { success: false, message: '参数错误' };
        }

        const verifyCode = Math.round(Math.random() * 1000000);

        const SmsClient = tencentcloud.sms.v20190711.Client;
        const models = tencentcloud.sms.v20190711.Models;

        const Credential = tencentcloud.common.Credential;
        const ClientProfile = tencentcloud.common.ClientProfile;
        const HttpProfile = tencentcloud.common.HttpProfile;

        let cred = new Credential("", "");
        let httpProfile = new HttpProfile();
        httpProfile.endpoint = "sms.tencentcloudapi.com";
        let clientProfile = new ClientProfile();
        clientProfile.httpProfile = httpProfile;
        let client = new SmsClient(cred, "ap-shanghai", clientProfile);

        let req = new models.SendSmsRequest();

        let params = `{"PhoneNumberSet":["${mobile}"],"TemplateID":"485975","Sign":"big1024","TemplateParamSet":["${verifyCode}"],"SmsSdkAppid":"1400292241"}`;
        req.from_json_string(params);

        client.SendSms(req, function (errMsg, response) {
            if (errMsg) {
                console.log(errMsg);
                return;
            }

            console.log(response.to_json_string());
        });
    }
}

module.exports = TestService;
