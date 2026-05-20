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
	number | string | undefined,
	{
		options?:
			| number[]
			| string[]
			| undefined[]
			| Array<{ label?: string; value: number }>
			| Array<{ label?: string; value: string | undefined }>;
	},
	'select'
>;
type NumberProp = BaseProp<
	number,
	({ min?: never; max?: never } | { min: number; max: number }) & {
		step?: number;
		suffix?: string;
	},
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
type TextProp = BaseProp<string, { label?: string }, 'text'>;
type TextareaProp = BaseProp<string, { height?: string }, 'textarea'>;
type ListProp = BaseProp<any[], never, 'list'>;
type ColorRepresentation =
	| string
	| THREE.Color
	| { r: number; g: number; b: string; a?: number };
type ColorProp = BaseProp<ColorRepresentation, never, 'color'>;
type PaletteProp = BaseProp<
	ColorRepresentation[],
	{ extensible?: boolean; editable?: boolean },
	'palette'
>;
type ButtonProp = BaseProp<() => void, { label?: string }, 'button'>;
type ImportProp = BaseProp<
	(event: ProgressEvent) => void,
	{ label?: string; accept?: string },
	'import'
>;
type DownloadProp = BaseProp<
	() => [any, string],
	{ label?: string },
	'download'
>;
type ImageProp = BaseProp<string, never, 'image'>;

type GradientStop = { color: ColorRepresentation; position: number };

type GradientProp = BaseProp<GradientStop[], never, 'gradient'>;

type Prop =
	| SelectProp
	| NumberProp
	| VecProp<VecObject>
	| VecProp<VecArray>
	| CheckboxProp
	| TextProp
	| TextareaProp
	| ListProp
	| ColorProp
	| PaletteProp
	| ImportProp
	| DownloadProp
	| ButtonProp
	| ImageProp
	| GradientProp;

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
