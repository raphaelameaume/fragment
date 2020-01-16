function getFilename(filepath) {
    let parts = filepath.split('/');

    return parts[parts.length - 1];
}

export default getFilename;