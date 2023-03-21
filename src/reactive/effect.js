const effectStack = [];
let activeEffect;
export function effect(fn, options = {}) {
    const effectFn = () => {
        // 处理用户代码的错误
        try {
            activeEffect = effectFn;
            effectStack.push(activeEffect);
            return fn();
        } finally {
            // 执行完后需要弹栈，更新当前的activeEffect
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1];
        }
    };
    if (!options.lazy) {
        // computed是lazy的，而一般effect不lazy
        effectFn();
    }
    effectFn.scheduler = options.scheduler;
    return effectFn;
}
const targetMap = new WeakMap();
export function track(target, key) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target);
    // 没有被副作用所依赖，不处理
    if (!depsMap) return;
    const deps = depsMap.get(key);
    if (!deps) return;
    deps.forEach((effectFn) => {
        // 如果有scheduler，大约就是computed了吧，执行调度程序
        if (effectFn.scheduler) effectFn.scheduler(effectFn);
        // 否则才去执行副作用函数
        else effectFn();
    });
}
