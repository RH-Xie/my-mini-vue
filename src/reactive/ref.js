import { isObject } from "../../utils";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export function ref(value) {
    if (isRef(value)) return value;
    return new RefImpl(value);
}

export function isRef(value) {
    // 被RefImpl包装后__isRef得true
    // null 返回false
    return !!(value && value.__isRef);
}

// Ref的实现
class RefImpl {
    constructor(value) {
        this.__isRef = true;
        this._value = convert(value);
    }

    get value() {
        // 收集依赖
        track(this, "value");
        return this._value;
    }
    set value(newValue) {
        this._value = newValue;
        // 触发依赖
        // 注意是赋了新值再去触发
        trigger(this, "value");
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
