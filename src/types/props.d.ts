type BaseProp<Value, Params, Type> = {
	value: Value;
	params?: Params;
	type?: Type;
	disabled?: boolean;
	hidden?: boolean;
	displayName?: string | null;
	folder?: string;
	group?: string;
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
	'select'
>;
type NumberProp = BaseProp<
	number,
	(
		| { min?: never; max?: never }
		| { min: number; max: number }
	) & { step?: number; suffix?: string },
	'number'
>;

type VecArray =
	| [number, number]
	| [number, number, number]
	| [number, number, number, number];

type VecObject = Record<string, number> & { [key: number]: never };

type VecValue = VecArray | VecObject;

type VecArrayParams<V extends VecArray> = {
	min: { [K in keyof V]: number };
	max: { [K in keyof V]: number };
	step?: { [K in keyof V]: number };
};

type VecObjectParams<V extends VecObject> = {
	min: { [K in keyof V]: number };
	max: { [K in keyof V]: number };
	step?: { [K in keyof V]: number };
};

type VecParams<V extends VecValue> = V extends readonly number[]
	? VecArrayParams<V>
	: V extends Record<string, number>
		? VecObjectParams<V>
		: never;

type VecProp<V extends VecValue = VecValue> = BaseProp<
	V,
	{ locked?: boolean; suffix?: string } & VecParams<V>,
	'vec'
>;
type CheckboxProp = BaseProp<boolean, never, 'checkbox'>;
type TextProp = BaseProp<string, never, 'text'>;
type ListProp = BaseProp<any[], never, 'list'>;
type ColorProp = BaseProp<
	string | THREE.Color | { r: number; g: number; b: string; a?: number },
	never,
	'color'
>;
type ButtonProp = BaseProp<
	() => void,
	{ label?: string },
	'button' | 'download'
>;
type ImageProp = BaseProp<string, never, 'image'>;

type Prop =
	| SelectProp
	| NumberProp
	| VecProp<VecObject>
	| VecProp<VecArray>
	| CheckboxProp
	| TextProp
	| ListProp
	| ColorProp
	| ButtonProp
	| ImageProp;

export type Props = Record<string, Prop>;

export type PropOnChangeOptions<Value, Params> = {
	value: Value;
	_initialValue: Value;
	params: Params;
	onChange: PropOnChange<Value, Params>;
};

export type PropOnChange<Value, Params> = (
	options: PropOnChangeOptions<Value, Params>,
) => void;
