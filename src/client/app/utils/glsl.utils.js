const regex = /<filepath:\/\/(.*)>/;

export function getShaderPath(shader) {
	const match = shader.match(/<filepath:\/\/(.*)>/);
	return match && match[1];
};

export function removeShaderPath(shader, filepath = getShaderPath(shader)) {
	if (filepath) {
		return shader.replace(`// <filepath://${filepath}>`, "");
	}

	return shader;
}
