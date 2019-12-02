import { post } from '../util';
import toast from './toast';

export default class LoginModal {
    constructor() {
        this.props = {};

        this.$el = $(
            `<div class="app-modal app-login" style="display:none">
                <div class="app-modal-con">
                    <button class="J_HideModal app-modal-close iconfont icon-close"></button>
                    <div class="app-modal-scroll ofy_s">
                        <div class="app-modal-title pb_m">用户登录</div>
                        <div class="app-login-form-item flex">
                            <input class="J_Mobile fx_1" placeholder="手机号" value="" />
                        </div>
                        <div class="app-login-form-item flex">
                            <input class="J_VerifyCode fx_1" type="text" placeholder="验证码" style="width: 100px" />
                            <button class="J_VerifyCodeBtn btn_send" disabled>获取验证码</button>
                        </div>
                        <div class="ta_c pt_m">
                            <button class="J_Confirm btn_confirm">登录</button>
                        </div>
                    </div>
                </div>
            </div>`
        );
        this.$mobile = this.$el.find('.J_Mobile');
        this.$verifyCode = this.$el.find('.J_VerifyCode');
        this.$verifyCodeBtn = this.$el.find('.J_VerifyCodeBtn');

        this.$el.appendTo(document.body);
        this._registerListeners();

        setTimeout(() => {
            this.$verifyCodeBtn[0].disabled = !/^1[0-9]{10}$/.test(this.$mobile.val());
        }, 100);
    }

    _registerListeners() {
        let gettingVerifyCode = false;

        this.$el
            .on('input', '.J_Mobile', (e) => {
                this.$verifyCodeBtn[0].disabled = gettingVerifyCode || !/^1[0-9]{10}$/.test(e.currentTarget.value);
            })
            .on('click', '.J_VerifyCodeBtn', async () => {
                this.$verifyCodeBtn.attr('disabled', 'disabled');

                gettingVerifyCode = true;

                try {
                    await post('/getVerifyCode', {
                        mobile: this.$mobile.val()
                    });
                    this.$verifyCodeBtn.html('90秒后重试');

                    let count = 90;
                    let interval = setInterval(() => {
                        count--;
                        if (count <= 0) {
                            this.$verifyCodeBtn.html('获取验证码');
                            this.$verifyCodeBtn[0].disabled = false;
                            clearInterval(interval);
                            gettingVerifyCode = false;
                        } else {
                            this.$verifyCodeBtn.html(count + '秒后重试');
                        }
                    }, 1000);
                } catch (e) {
                    gettingVerifyCode = false;
                    toast.showToast(e.message);
                }
            })
            .on('click', '.J_HideModal', () => {
                this.hide();
            })
            .on('click', '.J_Confirm', async () => {
                const $confirm = this.$el.find('.J_Confirm');
                try {
                    $confirm.attr('disabled', 'disabled');
                    const res = await post('/login', {
                        verifyCode: this.$verifyCode.val(),
                        mobile: this.$mobile.val()
                    });
                    this.props.onConfirm && await this.props.onConfirm(res.data);
                    this.hide();

                    toast.showToast('登录成功!');
                } catch (e) {
                    toast.showToast(e.message);
                }
                $confirm.removeAttr('disabled');
            });
    }

    show({
        onConfirm
    }) {
        this.props.onConfirm = onConfirm;
        this.$el.show();
    }

    hide() {
        this.$el.hide();
    }
}