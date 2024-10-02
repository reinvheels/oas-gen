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
    <h2 class="font-mono">
        <span class="${cls('text-2xl font-bold uppercase', HttpMethodColors[method])}">${method}</span>
        <span class="text-xl">${path}</span>
    </h2>
    <h3 class="text-3xl">${operation.summary || operation.operationId}</h3>
    <p>${operation.description}</p>
    ${operation.requestBody && ComponentSlot('RequestBody', { requestBody: operation.requestBody, spec })}
    ${operation.responses && ComponentSlot('Responses', { responses: operation.responses, spec })}
`;

const RequestBody: Component<RequestBodyProps> = ({ requestBody, spec }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return schema
        ? html`
              <h4 class="mt-4 text-2xl">Request Body</h4>
              ${requestBody.description ? html`<p>${requestBody.description}</p>` : ''}
              ${ComponentSlot('Schema', { schema, spec })}
          `
        : '';
};

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
    const schema = getSchema(schemaOrRef, spec);
    return html`
        <h5>
            <span class="${cls('font-mono font-bold', getStatusColor(status))}">${status}</span> ${response.description
                ? response.description
                : ''}
        </h5>
        ${schema ? ComponentSlot('Schema', { schema, spec }) : ''}
    `;
};

const Schema: Component<SchemaProps> = ({ schema, spec }) =>
    html`<div>
        ${schema.properties &&
        Object.entries(schema.properties)
            .map(([name, schema]) => ComponentSlot('Property', { name, schema, spec }))
            .join('')}
    </div>`;

const Property: Component<PropertyProps> = ({ name, schema }) =>
    html` <span>${name}:</span> <b>${schema.type}</b> <br />`;

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
