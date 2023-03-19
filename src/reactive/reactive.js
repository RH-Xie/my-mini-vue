import { track, trigger } from "./effect";
import { hasChanged, isObject } from "../../utils";

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
            return res;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const res = Reflect.set(...arguments);
            if (hasChanged(oldValue, value)) {
                trigger(target, key);
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
