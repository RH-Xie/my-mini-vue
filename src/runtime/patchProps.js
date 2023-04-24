// 为什么是这些属性？checked、disable好理解，但是value、innerHTML、textContent
// GPT：value用setAttribute有可能有些input在有焦点时不好使，DOM Prop就好使

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
export function patchProps(oldProps, newProps, el) {
    if (oldProps === newProps) {
        // 同一引用（同一对象）不用处理
        return;
    }
    oldProps = oldProps || {};
    newProps = newProps || {};

    for (const key in newProps) {
        const next = newProps[key];
        const prev = oldProps[key];
        if (prev !== next) {
            // patch单个属性
            patchDomProp(prev, next, key, el);
        }
    }
    // 移除没有的属性
    for (const key in oldProps) {
        if (newProps[key] == null) {
            patchDomProp(oldProps[key], null, key, el);
        }
    }
}

export function patchDomProp(prev, next, key, el) {
    // prev next军可能为null
    switch (key) {
        case "class":
            el.className = next || "";
            break;
        case "style":
            for (const styleName in next) {
                el.style[styleName] = next[styleName];
            }
            if (prev) {
                for (const styleName in prev) {
                    // TODO: 为什么是 ==null 而不是 === undefined？
                    if (next[styleName] == null) {
                        // next中不存在的话，移除
                        el.style[styleName] = "";
                    }
                }
            }
            break;
        default:
            // 事件（简化过，只识别on+大写开头）
            // 正则注意：[]外的^是“开头”，[]内的^是“除外”
            if (/^on[^a-z]/.test(key)) {
                // 截掉on
                const eventName = key.slice(2).toLowerCase();
                // 若prev存在，还需要移除该事件
                if (prev) {
                    el.removeEventListener(eventName, prev);
                }
                if (next) {
                    el.addEventListener(eventName, next);
                }
            }
            // DOM props，DOM属性
            else if (domPropsRE.test(key)) {
                // 形如<input type="checkbox" checked>
                // 编译后会得到{'checked': ''}
                // 当然在dom中el[key]类型是boolean
                if (next === "" && isBoolean(el[key])) {
                    next = true; // 因为''转boolean是false
                }
                el[key] = next;
            } else {
                // value是null、undefined均得true
                if (next == null || next === false) {
                    el.removeAttribute(key); // setAttribute设置为false不会起效果，而是永远为true，因为被转成字符串了
                } else {
                    el.setAttribute(key, next);
                }
            }
            break;
    }
}
