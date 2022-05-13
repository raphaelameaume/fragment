#### <sup>[fragment](../README.md) → [Documentation](./README.md) → Guide</sup>

---

- [Keeping things in sync](#keeping-things-in-sync)

## Keep things in sync
If you want to make sure your sketch stays in sync across tabs or even different devices, you have to make sure your code don't depend on internal logic that is not dependent from `time`.

Don't
```js
let object;
let time;
export let init = () => {
	object = new Mesh();
};

export let update = () => {
	time += 0.1;
	object.rotation.x = Math.sin(time);
};
```
But instead
```js
let object;
export let init = () => {
	object = new Mesh();
};

export let update = ({ time }) => {
	object.rotation.x = Math.sin(time);
};
```

If you are using random number generations, you should use a seed and provide the variable `__SEED__` available globally.

- [Hot Shader Reloading](#hot-shader-reloading)
