type ComponentMap = Record<string, Jizx.Component<unknown>>;

export const createGenerator = <TComponentMap extends ComponentMap>(Components: TComponentMap) => {
    let _Components = Components;

    type GetComponentPropType<TComponentKey extends keyof TComponentMap> =
        TComponentMap[TComponentKey] extends Jizx.Component<infer TProps> ? TProps : never;

    type ComponentSlotProps<TComponentKey extends keyof TComponentMap> = {
        Component: TComponentKey;
    } & GetComponentPropType<TComponentKey>;

    const ComponentSlot = <TComponentKey extends keyof TComponentMap>({
        Component,
        ...props
    }: ComponentSlotProps<TComponentKey>): JSX.Element => {
        const RenderComponent = _Components[Component];
        return <RenderComponent {...(props as {} & GetComponentPropType<TComponentKey>)} />;
    };

    const setComponents = (NewComponents: Partial<TComponentMap>) => {
        _Components = { ...Components, ...NewComponents };
    };

    return { ComponentSlot, setComponents };
};
