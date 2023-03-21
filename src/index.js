import { effect } from "./reactive/effect";
import { reactive } from "./reactive/reactive";
import { ref } from "./reactive/ref";

// reactive
// const observed = (window.observed = reactive({
//     count1: 0,
//     count2: 10,
// }));
// effect(() => {
//     effect(() => {
//         console.log("count2 is :", observed.count2);
//     });
//     console.log("count1 is :", observed.count1);
// });

// ref
const observed = (window.observed = ref(1));
effect(() => {
    console.log("observed, ", observed.value);
});
