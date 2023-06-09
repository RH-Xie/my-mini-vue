export function isObject(target) {
    return typeof target === "object" && target !== null;
}

export function isArray(target) {
    return Array.isArray(target);
}

export function isString(target) {
    return typeof target === "string";
}

export function isNumber(target) {
    return typeof target === "number";
}

export function isBoolean(target) {
    return typeof target === "boolean";
}

export function isFunction(target) {
    return typeof target === "function";
}

export function hasChanged(oldValue, newValue) {
    // 特殊情况：如果变量值是NaN，而NaN === NaN结果为false，新旧值不能同时为NaN
    if (Number.isNaN(oldValue) && Number.isNaN(newValue)) return false;
    // 通常情况不等于则为已更新
    return oldValue !== newValue;
}
