import type { Init, Update, Rendering } from "@fragment/types";
import { typedProps } from "@fragment/types/helpers";
import p5 from "p5";

export let props = typedProps({});

export let setup: Init<"p5"> = ({ p, width, height }) => {

};

export let draw: Update<"p5"> = ({ p }) => {
    p.background(255, 0, 0);
};

export let rendering: Rendering = "p5";
