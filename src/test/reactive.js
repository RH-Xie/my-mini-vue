import { computed } from "../reactive/computed";
import { effect } from "../reactive/effect";
import { reactive } from "../reactive/reactive";
import { ref } from "../reactive/ref";

// computed
const num = (window.num = ref(0));
// const c = (window.c = computed(() => {
//     console.log("calculate c.value");
//     return num.value * 2;
// }));
// Object Mode
const c = (window.c = computed({
    get() {
        console.log("calculate c.value");
        return num.value * 2;
    },
    set(newValue) {
        num.value = newValue;
    },
}));

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
// const observed = (window.observed = ref(1));
// effect(() => {
//     console.log("observed, ", observed.value);
// });
