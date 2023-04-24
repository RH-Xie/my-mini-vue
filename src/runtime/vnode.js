import { isArray, isNumber, isString } from "../../utils";

export const ShapeFlags = {
    ELEMENT: 1,
    TEXT: 1 << 1,
    FRAGMENT: 1 << 2,
    COMPONENT: 1 << 3,
    TEXT_CHILDREN: 1 << 4,
    ARRAY_CHILDREN: 1 << 5,
    CHILDREN: (1 << 4) | (1 << 5), // 这么做是拿来判断：一个虚拟dom是否有Children
};

export const Text = Symbol("text");
export const Fragment = Symbol("Fragment");

/**
 *
 * @param {string | Object | Text | Fragment} type
 * @param {Object | null} props
 * @param {string | number | Array | null} children
 * @returns VNode
 */
export function h(type, props, children) {
    let shapeFlag = 0;
    if (isString(type)) {
        shapeFlag = ShapeFlags.ELEMENT;
    } else if (type === Text) {
        shapeFlag = ShapeFlags.TEXT;
    } else if (type === Fragment) {
        shapeFlag = ShapeFlags.FRAGMENT;
    } else if (type === COMPONENT) {
        shapeFlag = ShapeFlags.COMPONENT;
    }

    // 判断children类型
    if (isString(children) || isNumber(children)) {
        shapeFlag |= ShapeFlags.TEXT_CHILDREN;
        children = children.toString();
    } else if (isArray(children)) {
        shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return {
        type,
        props,
        children,
        shapeFlag,
        el: null, // vnode本身的真实节点
    };
}
