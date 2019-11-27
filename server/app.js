module.exports = app => {
    // 使用 app 对象
    app.validator.addRule('jsonString', (rule, value) => {
        try {
            JSON.parse(value);
        } catch (err) {
            return 'must be json string';
        }
    });
};