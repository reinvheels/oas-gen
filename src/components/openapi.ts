import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { html } from '../util';
import { createGenerator, type Component } from '../generator';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type DocumentProps = {
    spec: oas.Document;
};
const Document: Component<DocumentProps> = ({ spec }) =>
    spec.paths ? ComponentSlot('Operations', { paths: spec.paths, spec }) : '';

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
const Operation: Component<OperationProps> = ({ operation, spec }) => `
${operation.requestBody ? ComponentSlot('RequestBody', { requestBody: operation.requestBody, spec }) : ''}
${operation.responses ? ComponentSlot('Responses', { responses: operation.responses, spec }) : ''}
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
    return schema ? ComponentSlot('Schema', { schema, spec }) : '';
};

export type ResponsesProps = {
    responses: oas.ResponsesObject;
    spec: oas.Document;
};
const Responses: Component<ResponsesProps> = ({ responses, spec }) => {
    return Object.entries(responses)
        .map(([status, response]) => ComponentSlot('Response', { status, response, spec }))
        .join('');
};

export type ResponseProps = {
    status: string;
    response: oas.ReferenceObject | oas.ResponseObject;
    spec: oas.Document;
};
const Response: Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return schema ? ComponentSlot('Schema', { schema, spec }) : '';
};

export type SchemaProps = {
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Schema: Component<SchemaProps> = ({ schema, spec }) =>
    schema.properties
        ? Object.entries(schema.properties)
              .map(([name, schema]) => ComponentSlot('Property', { name, schema, spec }))
              .join('')
        : '';

export type PropertyProps = {
    name: string;
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Property: Component<PropertyProps> = () => 'Property Component Missing';

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
