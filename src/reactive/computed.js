import { isFunction } from "../../utils";
import { effect, track, trigger } from "./effect";

export function computed(getterOrOption) {
    let getter, setter;
    if (isFunction(getterOrOption)) {
        // getterOrOption是个函数
        getter = getterOrOption;
        setter = () => {
            console.warn("computed is readonly");
        };
    } else {
        // getterOrOption是个对象
        getter = getterOrOption.get;
        setter = getterOrOption.set;
    }
    // getter，setter是函数
    return new ComputedImpl(getter, setter);
}

// 类似RefImpl
class ComputedImpl {
    constructor(getter, setter) {
        // 保存setter
        this._setter = setter;
        // 初始化undefined
        this._value = undefined;
        // 脏，即依赖是否已更新
        this._dirty = true;
        // 计算，但是computed初始化是不会执行的，而effect会，因此这里扩展个lazy
        this.effect = effect(getter, {
            lazy: true,
            // 调度计算，传入一个函数，依赖变化时，将_dirty置为true
            scheduler: () => {
                // 外部依赖变化
                if (!this._dirty) {
                    this._dirty = true;
                    // 这个trigger比较特殊
                    trigger(this, "value");
                }
            },
        });
    }
    get value() {
        if (this._dirty) {
            // 依赖已更新，开始计算，执行副作用函数
            this._value = this.effect();
            // 如果之后还是get，_dirty一直都会是false
            this._dirty = false;
            // 产生依赖
            track(this, "value");
        }
        return this._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
