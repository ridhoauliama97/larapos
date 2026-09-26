export function permissionModule(name) {
    const index = name.lastIndexOf('-');

    return index === -1 ? name : name.slice(0, index);
}

export function prettifyModule(module) {
    return module.replace(/-/g, ' ');
}
