import { isBoolean } from "../../utils";
import { ShapeFlags } from "./vnode";
import { patchProps } from "./patchProps";

export function render(vnode, container) {
    const prevVNode = container._vnode;
    if (!vnode) {
        if (prevVNode) {
            // unmount，n2不存在但n1存在，说明删除了
            unmount(prevVNode);
        }
    } else {
        console.log("render", prevVNode, vnode, container);
        patch(prevVNode, vnode, container);
    }
    // console.log(prevVNode, vnode, container);
    container._vnode = vnode;
}

function unmount(vnode) {
    const { shapeFlag, el } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
        unmountComponent(vnode);
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        unmountFragment(vnode);
    } else {
        // Text、Element，使用之前更新的el
        el.parentNode.removeChild(el);
    }
}

function patch(n1, n2, container) {
    console.log("patch", n1, n2, container);
    // 判断n1 n2的类型
    if (n1 && !isSameVNode(n1, n2)) {
        // n1存在且n1 n2 标签类型不同，需要卸载n1，挂载n2（类型不同没有可复用的部分）
        unmount(n1);
        n1 = null;
    }
    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.TEXT) {
        processText(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        processFragment(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container);
    }
}
function unmountComponent(vnode) {}

function unmountChildren(children, container) {
    children.forEach((child) => {
        unmount(child);
    });
}

function processComponent(n1, n2, container) {}

function processText(n1, n2, container) {
    if (n1) {
        // 更新文本
        n2.el = n1.el; // 真实DOM
        n1.el.textContent = n2.children; //
    } else {
        mountTextNode(n2, container);
    }
}

function processElement(n1, n2, container) {
    if (n1) {
        // n1存在，复用节点
        // 前面patch已经处理：n1要么为null要么为同类节点
        // 故不为null则是同类型，patchElement里面可见直接复用n1.el了
        patchElement(n1, n2);
    } else {
        // console.log(n1, n2, container);
        mountElement(n2, container);
    }
}

function processFragment(n1, n2, container) {
    console.log("processFragment", n1, n2, container);
    if (n1) {
        patchChildren(n1, n2, container);
    } else {
        mountChildren(n2.children, container);
    }
}

function unmountFragment(vnode) {}

// 挂载

function mountTextNode(vnode, container) {
    const textNode = document.createTextNode(vnode.children);
    container.appendChild(textNode);
    // 备份真实node节点，以便卸载
    vnode.el = textNode;
}

function mountElement(vnode, container) {
    const { type, props, shapeFlag, children } = vnode;
    const el = document.createElement(type);
    // mountProps(props, el); // 由于patchProps里的patchDomProp与mountProps逻辑一样，故使用patchProps代替
    patchProps(null, props, el); // 挂载一个新的，那自然oldProps是null
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 挂载到真实dom下
        mountTextNode(vnode, el);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    container.appendChild(el);
    // 备份真实node节点，以便卸载
    vnode.el = el;
}

function mountChildren(children, container) {
    children.forEach((child) => {
        patch(null, child, container);
    });
}

function isSameVNode(n1, n2) {
    return n1.type === n2.type;
}

// 分包Patch

function patchElement(n1, n2) {
    n2.el = n1.el;
    patchProps(n1.props, n2.props, n2.el);
    patchChildren(n1, n2, n2.el);
}

// 由n2判断类型，根据n1做出不同操作
function patchChildren(n1, n2, container) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(c1);
        }
        // 同一个对象（数组）不用进行更新
        if (c1 !== c2) {
            // c是字符串
            container.textContent = c2;
        }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 类型不同
            container.textContent = ""; // 清空“原文”
            mountChildren(c2, container); // 挂载数组
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            patchArrayChildren(c1, c2, container);
        } else {
            mountChildren(c2, container);
        }
    } else {
        // shapeFlag不属于以上任意一种，即新的children为null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            container.textContent = "";
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(c1);
        } else {
        }
    }
}

function patchArrayChildren(c1, c2, container) {
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    console.log("patchArrayChildren", c1, c2);
    console.log("commonLength", commonLength);
    for (let i = 0; i < commonLength; i++) {
        patch(c1[i], c2[i], container); // 公共最短长度内，直接patch更新
    }
    // 新的数组更短，要进行remove
    if (oldLength > newLength) {
        unmountChildren(c1.splice(commonLength), container);
    } else if (oldLength < newLength) {
        // 新数组更长，要mount
        mountChildren(c2.splice(commonLength), container);
    }
}
