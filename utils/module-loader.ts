type ModuleLoader = () => any;
const modules: Map<string, ModuleLoader> = new Map<string, ModuleLoader>();

export function registerModule(name: string, loader: ModuleLoader): void {
    modules.set(name, loader);
}

export function load(name: string): any {
    const loader = modules.get(name);
    if (loader)
        return loader();
    else
        return require(name);
}
