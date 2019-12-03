module.exports = app => {
    const { router, controller } = app;

    router.all('/', controller.test.home);
    router.all('/test', controller.test.home);

    router.post('/login', controller.user.login);
    router.post('/getVerifyCode', controller.user.getVerifyCode);
    router.post('/setNickName', controller.user.setNickName);
    router.post('/getYear', controller.user.getUserYearRecord);
    router.post('/setYear', controller.user.setUserYearRecord);

    router.post('/getUserYear', controller.user.getUserYear);
};