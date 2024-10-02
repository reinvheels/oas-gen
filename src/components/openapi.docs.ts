import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { cls, html } from '../util';
import { type Component } from '../generator';
import {
    getSchema,
    OpenApiGenerator,
    type DocumentProps,
    type HttpMethod,
    type OperationProps,
    type PropertyProps,
    type RequestBodyProps,
    type ResponseProps,
    type ResponsesProps,
    type SchemaProps,
} from './openapi';

const HttpMethodColors: Record<HttpMethod, string> = {
    get: 'text-green-500',
    post: 'text-blue-500',
    put: 'text-yellow-500',
    delete: 'text-red-500',
    head: 'text-gray-500',
    options: 'text-purple-500',
    patch: 'text-teal-500',
    trace: 'text-indigo-500',
};

const Document: Component<DocumentProps> = ({ spec }) => html`
    <html>
        <head>
            <title>${spec.info.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div class="p-4 flex flex-col gap-2 container mx-auto">
                <h1 class="mt-16 text-5xl">
                    ${spec.info.title}<span class="text-lg italic opacity-50">${spec.info.version}</span>
                </h1>
                <p class="text-lg">${spec.info.description}</p>
                ${spec.paths ? ComponentSlot('Operations', { paths: spec.paths, spec }) : ''}
            </div>
        </body>
    </html>
`;

const Operation: Component<OperationProps> = ({ operation, method, path, spec }) => html`
    <hr class="mt-8 border-[0.8pt] border-black/70" />
    <h2 class="font-mono text-4xl mt-4">
        <span class="${cls('font-bold uppercase', HttpMethodColors[method])}">${method}</span>
        <span>${path}</span>
    </h2>
    <p>${operation.summary || operation.operationId}</p>
    <p class="text-black/50">${operation.description}</p>
    ${operation.requestBody && ComponentSlot('RequestBody', { requestBody: operation.requestBody, spec })}
    ${operation.responses && ComponentSlot('Responses', { responses: operation.responses, spec })}
`;

const RequestBody: Component<RequestBodyProps> = ({ requestBody, spec }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return schema
        ? html`
              <h4 class="mt-4 text-2xl">Request Body</h4>
              ${requestBody.description ? html`<p>${requestBody.description}</p>` : ''}
              ${SchemaPanel({ schema, usedRefs, spec })}
          `
        : '';
};

const SchemaPanel: Component<SchemaProps> = ({ schema, usedRefs, spec }) =>
    html`<div class="rounded-xl bg-slate-100 p-4 mb-4">
        <div class="flex flex-row gap-4">
            <div class="flex flex-1">${ComponentSlot('Schema', { schema, usedRefs, spec })}</div>
            <div class="flex flex-1 bg-white rounded-md p-4">
                <pre>${JSON.stringify({ some: 'example', props: 42 }, null, 4)}</pre>
            </div>
        </div>
    </div>`;

const Responses: Component<ResponsesProps> = ({ responses, spec }) => {
    return html`
        <h4 class="mt-4 text-2xl">Responses</h4>
        ${Object.entries(responses)
            .map(([status, response]) => ComponentSlot('Response', { status, response, spec }))
            .join('')}
    `;
};

const getStatusColor = (status: string) => {
    if (status >= '200' && status < '300') {
        return 'text-green-600';
    } else if (status >= '300' && status < '400') {
        return 'text-blue-300';
    } else if (status >= '400' && status < '600') {
        return 'text-red-500';
    } else {
        return 'text-gray-500';
    }
};

const Response: Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return html`
        <h5>
            <span class="${cls('font-mono font-bold', getStatusColor(status))}">${status}</span> ${response.description
                ? response.description
                : ''}
        </h5>
        ${schema ? SchemaPanel({ schema, usedRefs, spec }) : ''}
    `;
};

const Schema: Component<SchemaProps> = ({ schema, usedRefs, spec }) => {
    if ('CIRCULAR' in schema) {
        return html`<p><span class="color-red-600">Circular</span> ${schema.CIRCULAR}</p>`;
    } else {
        return html`<div>
            ${schema.description ? html`<p class="text-sm">${schema.description}</p>` : ''}
            ${schema.properties &&
            Object.entries(schema.properties)
                .map(([name, propSchema]) =>
                    ComponentSlot('Property', {
                        name,
                        required: 'required' in schema ? (schema.required?.includes(name) ?? false) : false,
                        schema: propSchema,
                        usedRefs,
                        spec,
                    }),
                )
                .join('')}
        </div>`;
    }
};

const Property: Component<PropertyProps> = ({ name, schema: schemaOrRef, required, spec, usedRefs: _usedRefs }) => {
    const [schema, usedRefs] = getSchema(schemaOrRef, spec, _usedRefs);
    if (schema && 'CIRCULAR' in schema) {
        return html`<p><span>${name}:</span> <span class="text-red-600">Circular</span> ${schema.CIRCULAR}</p>`;
    } else {
        return html`
            <p>
                <span>${name}:</span>${' '}
                ${schema && schema.type
                    ? html`<span class="font-mono font-bold text-emerald-700/80">${schema.type}</span>`
                    : ''}
                ${required ? html`<span class="text-red-600">*</span>` : ''}
            </p>
            ${schema && ('properties' in schema || 'CIRCULAR' in schema)
                ? html` <div class="pl-4">${ComponentSlot('Schema', { schema, usedRefs, spec })}</div> `
                : ''}
        `;
    }
};

export const OpenApiDocs = {
    Document,
    Operation,
    RequestBody,
    Responses,
    Response,
    Schema,
    Property,
};

OpenApiGenerator.setComponents(OpenApiDocs);

export const { ComponentSlot } = OpenApiGenerator;
export const OpenApiDocsGenerator = OpenApiGenerator;
