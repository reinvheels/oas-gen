export function html(strings: TemplateStringsArray, ...expressions: any[]): string {
    return strings.reduce(
        (result, string, i) => result + string + (expressions[i] !== undefined ? expressions[i] : ''),
        '',
    );
}
