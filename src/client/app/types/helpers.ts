import { Props } from "./props";

export function typedProps<P extends Props>(props: P) {
  return props;
}
