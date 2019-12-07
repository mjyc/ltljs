# LTL.js

[Linear temporal logic](https://en.wikipedia.org/wiki/Linear_temporal_logic) for javascript. For now, it only implements always and eventually temporal operators.

## Example

```
const { evalT } = require("ltljs");

let f = {
  type: "and",
  value: [
    "a",
    {
      type: "next",
      value: "b"
    }
  ]
};

f = evalT(f, literal => {
  const state = { a: true };
  return state[literal] ? state[literal] : false;
});
console.log("f after t0", f);
f = evalT(f, literal => {
  const state = { b: true };
  return state[literal] ? state[literal] : false;
});
console.log("f after t1", f);
```

## Acknowledgement

Thanks [Christian Fritz](https://github.com/chfritz) for introducing me to linear temporal logic.
