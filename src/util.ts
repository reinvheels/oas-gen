import type { OpenAPIV3_1 as oas } from 'openapi-types';

export const html = (strings: TemplateStringsArray, ...expressions: any[]): string => {
    return strings.reduce(
        (result, string, i) => result + string + (expressions[i] !== undefined ? expressions[i] : ''),
        '',
    );
};

export const cls = (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ');

export const emptySpec = (): oas.Document => ({
    openapi: '3.0.1',
    info: {
        title: '',
        version: '',
    },
    paths: {},
});
