import { isColor } from "./color.utils";


function isImageURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
}

function isImage(value) {
    return typeof value === HTMLImageElement || isImageURL(value);
}

export function inferFromParams(params) {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

	if (params.type === "folder") {
		return "folder";
	}

    return null;
}

export function inferFromValue(value) {
    if (value === undefined || value === null) return undefined;

    if (value.isColor) {
        return "color";
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "function") {
        return "button";
    } else if (typeof value === "boolean") {
        return "checkbox";
    } else if (typeof value === "string") {
        if (isColor(value)) {
            return "color";
        } else if (isImage(value)) {
            return "image";
        }

        return "text";
    } else {
        const isArray = Array.isArray(value);
        const isObject = !isArray && typeof value === "object";
        
        const values = isObject ? Object.values(value) : value;

        if ((isArray || isObject) && values.every(v => typeof v === "number") && values.length <= 4) {
            return "vec";
        }
    }
}
