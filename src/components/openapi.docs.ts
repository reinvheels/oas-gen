import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { html } from '../util';
import { type Component } from '../generator';
import {
    getSchema,
    OpenApiGenerator,
    type DocumentProps,
    type OperationProps,
    type PropertyProps,
    type RequestBodyProps,
    type ResponseProps,
    type ResponsesProps,
    type SchemaProps,
} from './openapi';

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
        <span class="text-2xl font-bold uppercase">${method}</span>
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
              <h4>Request Body</h4>
              ${ComponentSlot('Schema', { schema, spec })}
          `
        : '';
};

const Responses: Component<ResponsesProps> = ({ responses, spec }) => {
    return html`
        <h4>Responses</h4>
        ${Object.entries(responses)
            .map(([status, response]) => ComponentSlot('Response', { status, response, spec }))
            .join('')}
    `;
};

const Response: Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return html`
        <h5>${status}</h5>
        ${response.description ? html`<p>${response.description}</p>` : ''}
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
