import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { html } from '../util';
import { createGenerator, type Component } from '../generator';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type DocumentProps = {
    spec: oas.Document;
};
const Document: Component<DocumentProps> = ({ spec }) => html`
    <html>
        <head>
            <title>${spec.info.title}</title>
        </head>
        <body>
            <h1>${spec.info.title}</h1>
            ${spec.paths ? ComponentSlot('Operations', { paths: spec.paths, spec }) : ''}
        </body>
    </html>
`;

export type OperationsProps = {
    paths: oas.PathsObject;
    spec: oas.Document;
};
const Operations: Component<OperationsProps> = ({ paths, spec }) =>
    Object.entries(paths)
        .map(([path, pathObject]) =>
            pathObject
                ? Object.entries(pathObject)
                      .map(([method, operation]) =>
                          ComponentSlot('Operation', {
                              operation: operation as oas.OperationObject,
                              method: method as HttpMethod,
                              path,
                              spec,
                          }),
                      )
                      .join('')
                : '',
        )
        .join('');

export type OperationProps = {
    method: HttpMethod;
    path: string;
    operation: oas.OperationObject;
    spec: oas.Document;
};
const Operation: Component<OperationProps> = ({ operation, method, path, spec }) => html`
    <div>
        <h2>${method.toUpperCase()} ${path}</h2>
        <h3>${operation.operationId}</h3>
        <p>${operation.description}</p>
        ${operation.requestBody && ComponentSlot('RequestBody', { requestBody: operation.requestBody, spec })}
        ${operation.responses && ComponentSlot('Responses', { responses: operation.responses, spec })}
    </div>
`;

export const getSchema = (schemaOrRef: oas.ReferenceObject | oas.SchemaObject | undefined, spec: oas.Document) => {
    const schemas = spec.components?.schemas || {};
    if (schemaOrRef && '$ref' in schemaOrRef) {
        const schemaName = schemaOrRef.$ref.split('#/components/schemas/')[1];
        return schemas[schemaName] || undefined;
    } else {
        return schemaOrRef;
    }
};

export type RequestBodyProps = {
    requestBody: oas.ReferenceObject | oas.RequestBodyObject;
    spec: oas.Document;
};
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

export type ResponsesProps = {
    responses: oas.ResponsesObject;
    spec: oas.Document;
};
const Responses: Component<ResponsesProps> = ({ responses, spec }) => {
    return html`
        <h4>Responses</h4>
        ${Object.entries(responses)
            .map(([status, response]) => ComponentSlot('Response', { status, response, spec }))
            .join('')}
    `;
};

export type ResponseProps = {
    status: string;
    response: oas.ReferenceObject | oas.ResponseObject;
    spec: oas.Document;
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

export type SchemaProps = {
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Schema: Component<SchemaProps> = ({ schema, spec }) =>
    html`<div>
        ${schema.properties &&
        Object.entries(schema.properties)
            .map(([name, schema]) => ComponentSlot('Property', { name, schema, spec }))
            .join('')}
    </div>`;

export type PropertyProps = {
    name: string;
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Property: Component<PropertyProps> = ({ name, schema }) => html`
    <span>${name}:</span> <b>${schema.type}</b> <br />
`;

export const OpenApi = {
    Document,
    Operations,
    Operation,
    RequestBody,
    Responses,
    Response,
    Schema,
    Property,
};

export const OpenApiGenerator = createGenerator(OpenApi);
const { ComponentSlot } = OpenApiGenerator;
