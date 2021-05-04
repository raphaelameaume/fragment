import sirv from "sirv";

export default function staticMiddleware(dir) {
    return sirv(dir, {
        dev: true
    });
}
