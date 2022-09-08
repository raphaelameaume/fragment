export type PropOnChangeOptions<Value, Params> = {
  value: Value;
  _initialValue: Value;
  params: Params;
  onChange: PropOnChange<Value, Params>;
};
export type PropOnChange<Value, Params> = (
  opts: PropOnChangeOptions<Value, Params>
) => void;

type BaseProp<Value, Params, Type> = {
  value: Value;
  params?: Params;
  type?: Type;
  hidden?: boolean;
  onChange?: PropOnChange<Value, Params>;
};

type SelectProp = BaseProp<
  number | string,
  {
    options?:
      | number[]
      | string[]
      | Array<{ label?: string; value: number }>
      | Array<{ label?: string; value: string }>;
  },
  "select"
>;
type NumberProp = BaseProp<
  number,
  { disabled?: boolean; step?: number } | { min: number; max: number },
  "number"
>;
type VecProp = BaseProp<
  | [number, number]
  | [number, number, number]
  | [number, number, number, number],
  { locked?: boolean },
  "vec"
>;
type CheckboxProp = BaseProp<boolean, never, "checkbox">;
type TextProp = BaseProp<string, { disabled?: boolean }, "text">;
type ListProp = BaseProp<any[], { disabled?: boolean }, "list">;
type ColorProp = BaseProp<
  string | THREE.Color | { r: number; g: number; b: string; a?: number },
  never,
  "color"
>;
type ButtonProp = BaseProp<
  () => void,
  { disabled?: boolean; label?: string },
  "button" | "download"
>;
type ImageProp = BaseProp<string, never, "image">;

type Prop =
  | SelectProp
  | NumberProp
  | VecProp
  | CheckboxProp
  | TextProp
  | ListProp
  | ColorProp
  | ButtonProp
  | ImageProp;

export type Props = Record<string, Prop>;
