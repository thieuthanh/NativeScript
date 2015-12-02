declare module "utils/module-loader" {
    export type ModuleLoader = () => any;

    export function registerModule(name: string, loader: ModuleLoader): void;
    export function load(name: string): any;
}
