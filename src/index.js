import { Fragment, render, h } from "./runtime";

// 测试patch
render(
    h("ul", null, [
        h("li", null, "first"),
        h(Fragment, null, []),
        h("li", null, "last"),
    ]),
    document.body
);
// 再次渲染
setTimeout(() => {
    render(
        h("ul", null, [
            h("li", null, "first"),
            h(Fragment, null, [h("li", null, "middle")]),
            h("li", null, "last"),
        ]),
        document.body
    );
}, 2000);
