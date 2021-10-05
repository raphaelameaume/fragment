export function proxyProps(props = {}) {
    const proxy = new Proxy(props, {
        get: (obj, prop) => {
            return prop in obj ? obj[prop].value : undefined
        }
    });

    return proxy;
}
