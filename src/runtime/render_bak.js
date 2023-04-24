import { isBoolean } from "../../utils";
import { ShapeFlags } from "./vnode";

export function render(vnode, container) {
    mount(vnode, container);
}

function mount(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        mountElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.TEXT) {
        mountTextNode(vnode, container);
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        mountFragment(vnode, container);
    }
}
function mountElement(vnode, container) {
    const { type, props } = vnode;
    const el = document.createElement(type);
    mountProps(props, el);
    mountChildren(vnode, el);
    container.appendChild(el);
    // 备份真实node节点，以便卸载
    vnode.el = el;
}
function mountTextNode(vnode, container) {
    const textNode = document.createTextNode(vnode.children);
    container.appendChild(textNode);
    // 备份真实node节点，以便卸载
    vnode.el = textNode;
}
function mountFragment(vnode, container) {
    // 比如template，直接把子节点挂载到Fragment的父元素即可
    mountChildren(vnode, container);
}

function mountComponent(vnode, container) {}

function mountChildren(vnode, container) {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, container);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        children.forEach((child) => {
            mount(child, container);
        });
    }
}
// {
//     class: 'a b',
//     style: {
//         color: 'red',
//         fontSize: '14px'
//     },
//     onClick: () => {console.log('click')},
//     checked: '',
//     custom: false
// }

// 为什么是这些属性？checked、disable好理解，但是value、innerHTML、textContent
// GPT：value用setAttribute有可能有些input在有焦点时不好使，DOM Prop就好使
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
function mountProps(props, el) {
    for (const key in props) {
        const value = props[key];
        switch (key) {
            case "class":
                el.className = value;
                break;
            case "style":
                for (const styleName in value) {
                    el.style[styleName] = value[styleName];
                }
                break;
            default:
                // 事件（简化过，只识别on+大写开头）
                // 正则注意：[]外的^是“开头”，[]内的^是“除外”
                if (/^on[^a-z]/.test(key)) {
                    // 截掉on
                    const eventName = key.slice(2).toLowerCase();
                    el.addEventListener(eventName, value);
                }
                // DOM props，DOM属性
                else if (domPropsRE.test(key)) {
                    // 形如<input type="checkbox" checked>
                    // 编译后会得到{'checked': ''}
                    // 当然在dom中el[key]类型是boolean
                    if (value === "" && isBoolean(el[key])) {
                        value = true; // 因为''转boolean是false
                    }
                    el[key] = value;
                } else {
                    // value是null、undefined均得true
                    if (value == null || value === false) {
                        el.removeAttribute(key); // setAttribute设置为false不会起效果，而是永远为true，因为被转成字符串了
                    } else {
                        el.setAttribute(key, value);
                    }
                }
                break;
        }
    }
}
