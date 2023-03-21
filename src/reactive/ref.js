import { hasChanged, isObject } from "../../utils";
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
        // 可能为对象，然而用户要.value才获得reactive，要多写，所以应该是不推荐的
        // 但作为开发者还是要转换
        this._value = convert(value);
    }

    get value() {
        // 收集依赖
        track(this, "value");
        return this._value;
    }
    set value(newValue) {
        // 判断是否有变化，无变化则不trigger
        if (hasChanged(this._value, newValue)) {
            // 用户可能会将一个对象丢进来，要考虑，这时候value变为一个reactive
            this._value = convert(newValue);
            // 触发依赖
            // 注意是赋了新值再去触发
            trigger(this, "value");
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
