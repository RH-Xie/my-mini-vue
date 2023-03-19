import { effect } from "./reactive/effect";
import { reactive } from "./reactive/reactive";

const observed = (window.observed = reactive({
    count: 0,
}));
effect(() => {
    console.log("observed count is :", observed.count);
});
