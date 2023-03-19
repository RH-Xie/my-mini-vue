import { track, trigger } from "./effect";
import { hasChanged, isArray, isObject } from "../../utils";

const proxyMap = new WeakMap();
export function reactive(target) {
    if (!isObject(target)) return target;
    // 处理reactive(reactive(obj))的情况，已经被响应式代理过的无需再次代理
    if (isReactive(target)) return target;
    if (proxyMap.has(target)) return proxyMap.get(target);
    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 已被代理，没有代理的————isReactive是undefined
            if (key === "__isReactive") return true;
            const res = Reflect.get(...arguments);
            track(target, key);
            // 这种情况下是不能多层代理的，只有一层
            // return res
            // 这种情况是不管有没有依赖，都代理
            // return reactive(res)
            return isObject(res) ? reactive(res) : res;
        },
        set(target, key, value, receiver) {
            // 对于数组，保存更新前的length，用于触发
            let oldLength = target.length;
            const oldValue = target[key];
            const res = Reflect.set(...arguments);
            if (hasChanged(oldValue, value)) {
                trigger(target, key);
                if (isArray(target) && hasChanged(oldLength, target.length)) {
                    trigger(target, "length");
                }
            }
            return res;
        },
    });
    proxyMap.set(target, proxy);

    return proxy;
}

// 判断是否是响应式对象
export function isReactive(target) {
    return !!(target && target.__isReactive);
}
