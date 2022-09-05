import { Init, Update } from "@fragment/types";
import fragmentShader from "./04.fs";

let uniforms = {
  uTime: { value: 0, type: "float" },
};

export let init: Init<"fragment"> = ({ frag }) => {
  frag.uniforms = uniforms;
  frag.shader = fragmentShader;
};

export let update: Update<"fragment"> = ({ frag, deltaTime }) => {
  uniforms.uTime.value += deltaTime;

  frag.render();
};

export let rendering = "fragment";
