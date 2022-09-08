import { Init, Update, Resize, Rendering } from "@fragment/types";
import { typedProps } from "@fragment/types/helpers";

export let props = typedProps({});

export let init: Init<"2d"> = ({ context, width, height }) => {

};

export let update: Update<"2d"> = ({
  context,
  width,
  height,
  time,
  deltaTime,
}) => {
  context.clearRect(0, 0, width, height);
};

export let resize: Resize<"2d"> = ({ width, height }) => {

};

export let rendering: Rendering = "2d";
