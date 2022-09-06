import { fragment } from "../lib/gl";
import type { Props } from "./props";
import type p5 from "p5";
import type { WebGLRenderer, Scene } from "three";

type RenderingParams = {
  "2d": { context: CanvasRenderingContext2D };
  fragment: {
    frag: ReturnType<typeof fragment>;
  };
  p5: { p: p5 };
  three: { renderer: WebGLRenderer; scene: Scene };
};
type Renderings = keyof RenderingParams;

type SharedOptions = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio: number;
};

export type Init<Rendering extends Renderings> = (
  opts: SharedOptions & RenderingParams[Rendering]
) => void;

export type Update<Rendering extends Renderings> = (
  opts: {
    time: number;
    deltaTime: number;
    playhead?: number;
    playcount?: number;
  } & SharedOptions &
    RenderingParams[Rendering]
) => void;

export type Resize<Rendering extends Renderings> = (
  opts: SharedOptions & RenderingParams[Rendering]
) => void;

export type Rendering = Renderings;
export type Duration = number;
export type Fps = number;
export type Name = string;
export type FilenamePattern = (opts: {
  filename: string;
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
  timestamp: string;
  props: Props;
}) => string;
