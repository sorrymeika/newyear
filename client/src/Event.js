function returnFalse() {
    return false;
}

function returnTrue() {
    return true;
}

export default function Event(type, props) {
    props && Object.assign(this, props);
    this.type = type;

    return this;
}

Event.prototype = {
    isDefaultPrevented: returnFalse,

    isPropagationStopped: returnFalse,

    preventDefault: function () {
        this.isDefaultPrevented = returnTrue;
    },

    stopPropagation: function () {
        this.isPropagationStopped = returnTrue;
    }
};

Event.createEmitter = createEmitter;
Event.createAsyncEmitter = createAsyncEmitter;

function createEmitter() {
    let funcs = [];
    let middlewares = [];

    const emitter = (fn) => {
        funcs.push(fn);
        return () => {
            const index = funcs.indexOf(fn);
            if (index !== -1) {
                funcs.splice(index, 1);
            }
        };
    };

    emitter.$$typeof = 'EventEmitter';

    emitter.emit = (state) => {
        const event = new Event('emit');

        if (middlewares.length == 0) {
            funcs.every(nextFunc => {
                nextFunc(state, event);
                return !event.isPropagationStopped();
            });
        } else {
            let i = middlewares.length - 1;

            const next = (newState) => {
                if (i >= 0 && !event.isDefaultPrevented()) {
                    let fn = middlewares[i];
                    let called = false;
                    i--;

                    fn(newState, event, (nextState = newState) => {
                        if (called) throw new Error('next方法不可重复调用！');
                        called = true;
                        next(nextState);
                    });

                    if (!called) {
                        throw new Error('必须调用next方法!');
                    }
                } else {
                    funcs.every(nextFunc => {
                        nextFunc(newState, event);
                        return !event.isPropagationStopped();
                    });
                }
            };
            next(state);
        }

        return event;
    };

    emitter.middleware = (fn) => {
        middlewares.push(fn);
        return () => {
            const index = middlewares.indexOf(fn);
            if (index !== -1) {
                middlewares.splice(index, 1);
            }
        };
    };

    emitter.once = (fn) => {
        const once = (state) => {
            dispose();
            fn(state);
        };
        const dispose = emitter(once);
        return dispose;
    };

    emitter.destroy = () => {
        middlewares = funcs = null;
    };

    return emitter;
}

function createAsyncEmitter() {
    let middlewares = [];
    let funcs = [];

    const emitter = (fn) => {
        funcs.push(fn);
        return () => {
            const index = funcs.indexOf(fn);
            if (index !== -1) {
                funcs.splice(index, 1);
            }
        };
    };

    emitter.$$typeof = 'EventEmitter';

    emitter.emit = async (state) => {
        const event = new Event('emit');

        if (middlewares.length == 0) {
            for (let i = 0; i < funcs.length; i++) {
                await funcs[i](state, event);
                if (event.isPropagationStopped()) {
                    break;
                }
            }
        } else {
            let i = middlewares.length - 1;

            const next = async (newState) => {
                if (i >= 0 && !event.isDefaultPrevented()) {
                    let fn = middlewares[i];
                    let called = 0;
                    i--;

                    await fn(newState, event, async (nextState = newState) => {
                        if (called) throw new Error('next方法不可重复调用！');
                        called = 1;
                        await next(nextState);
                        called = 2;
                    });

                    if (!called) {
                        throw new Error('必须调用`next`方法!');
                    } else if (called == 1) {
                        throw new Error('必须使用`await next();`调用`next`方法!');
                    }
                } else {
                    for (let j = 0; j < funcs.length; j++) {
                        await funcs[j](state, event);
                        if (event.isPropagationStopped()) {
                            break;
                        }
                    }
                }
            };
            await next(state);
        }

        return event;
    };

    emitter.middleware = (fn) => {
        middlewares.push(fn);
        return () => {
            const index = middlewares.indexOf(fn);
            if (index !== -1) {
                middlewares.splice(index, 1);
            }
        };
    };

    emitter.destroy = () => {
        middlewares = funcs = null;
    };

    return emitter;
}