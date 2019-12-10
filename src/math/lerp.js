export function lerp(start, end, ease) {
    return (1 - ease) * start + ease * end;
}