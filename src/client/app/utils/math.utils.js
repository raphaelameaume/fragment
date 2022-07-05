export function map(value, min, max, nmin, nmax) {
    return ((value - min) / (max - min)) * (nmax - nmin) + nmin;
}
