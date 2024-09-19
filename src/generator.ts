export type Component<TProps = {}> = (props: TProps) => string;
type ComponentMap = Record<string, Component<any>>;

export const createGenerator = <TComponentMap extends ComponentMap>(Components: TComponentMap) => {
    let _Components = Components;

    type GetComponentPropType<TKey extends keyof TComponentMap> = TComponentMap[TKey] extends (
        props: infer TProps,
    ) => string
        ? TProps
        : never;

    const ComponentSlot = <TComponentKey extends keyof TComponentMap>(
        componentKey: TComponentKey,
        props: GetComponentPropType<TComponentKey>,
    ): string => _Components[componentKey](props);

    const setComponents = (NewComponents: Partial<TComponentMap>) => {
        _Components = { ...Components, ...NewComponents };
    };

    return { ComponentSlot, setComponents };
};
