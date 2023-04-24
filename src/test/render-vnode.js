import { render, h, Text, Fragment } from "../runtime";

const vnode = h(
    "div",
    {
        class: "a b",
        style: {
            border: "1px solid",
            fontSize: "14px",
        },
        onClick: () => console.log("点点点"),
        id: "foo",
        checked: "",
        custom: false,
    },
    [
        h("ul", null, [
            h("li", { style: { color: "red" } }, 1),
            h("li", null, 2),
            h("li", { style: { color: "blue" } }, 3),
            h(Fragment, null, [h("li", null, "4"), h("li")]),
            h("li", null, [h(Text, null, "hello world")]),
        ]),
    ]
);
console.log(vnode, document.body);
render(vnode, document.body);
