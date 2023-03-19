import { activeEffect, effect } from "./reactive/effect";
import { reactive } from "./reactive/reactive";

const observed = (window.observed = reactive({
    count1: 0,
    count2: 10,
}));
effect(() => {
    effect(() => {
        console.log("count2 activeEffect <", activeEffect);
        console.log("count2 is :", observed.count2);
        console.log("count2 activeEffect >", activeEffect);
    });
    console.log("count1 activeEffect <", activeEffect);
    console.log("count1 is :", observed.count1);
    console.log("count1 activeEffect >", activeEffect);
});
