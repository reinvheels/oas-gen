export const html = (strings: TemplateStringsArray, ...expressions: any[]): string => {
    return strings.reduce(
        (result, string, i) => result + string + (expressions[i] !== undefined ? expressions[i] : ''),
        '',
    );
};

export const cls = (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ');
