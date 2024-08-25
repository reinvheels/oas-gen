import type { OpenAPIV3_1 as oas } from 'openapi-types';

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

type DocumentProps = {
    spec: oas.Document;
};
export const Document = ({ spec }: DocumentProps) => /*html*/ `
<html>
<head>
    <title>${spec.info.title}</title>
</head>
<body>
    <h1>${spec.info.title}</h1>
    ${spec.paths ? Operations({ paths: spec.paths, spec }) : ''}
</body>
</html>
`;

type OperationsProps = {
    paths: oas.PathsObject;
    spec: oas.Document;
};
const Operations = ({ paths, spec }: OperationsProps) =>
    Object.entries(paths)
        .map(([path, pathObject]) =>
            pathObject
                ? Object.entries(pathObject)
                      .map(([method, operation]) =>
                          Operation({
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

type OperationProps = {
    method: HttpMethod;
    path: string;
    operation: oas.OperationObject;
    spec: oas.Document;
};
const Operation = ({ operation, method, path, spec }: OperationProps) => /*html*/ `
<div>
    <h2>${method.toUpperCase()} ${path}</h2>
    <h3>${operation.operationId}</h3>
    <p>${operation.description}</p>
    ${operation.requestBody && RequestBody({ requestBody: operation.requestBody, spec })}
    ${operation.responses && Responses({ responses: operation.responses, spec })}
</div>
`;

const getSchema = (schemaOrRef: oas.ReferenceObject | oas.SchemaObject | undefined, spec: oas.Document) => {
    const schemas = spec.components?.schemas || {};
    if (schemaOrRef && '$ref' in schemaOrRef) {
        const schemaName = schemaOrRef.$ref.split('#/components/schemas/')[1];
        return schemas[schemaName] || undefined;
    } else {
        return schemaOrRef;
    }
};

type RequestBodyProps = {
    requestBody: oas.ReferenceObject | oas.RequestBodyObject;
    spec: oas.Document;
};
const RequestBody = ({ requestBody, spec }: RequestBodyProps) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return schema
        ? /*html*/ `
    <h4>Request Body</h4>
    ${Schema({ schema, spec })}
`
        : '';
};

type ResponsesProps = {
    responses: oas.ResponsesObject;
    spec: oas.Document;
};
const Responses = ({ responses, spec }: ResponsesProps) => {
    return /*html*/ `
    <h4>Responses</h4>
    ${Object.entries(responses)
        .map(([status, response]) => Response({ status, response, spec }))
        .join('')}
`;
};

type ResponseProps = {
    status: string;
    response: oas.ReferenceObject | oas.ResponseObject;
    spec: oas.Document;
};
const Response = ({ status, response, spec }: ResponseProps) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return /*html*/ `
    <h5>${status}</h5>
    ${response.description ? /*html*/ `<p>${response.description}</p>` : ''}
    ${schema ? Schema({ schema, spec }) : ''}
`;
};

type SchemaProps = {
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Schema = ({ schema, spec }: SchemaProps) => /*html*/ `
<div>
${
    schema.properties &&
    Object.entries(schema.properties)
        .map(([name, schema]) => Property({ name, schema, spec }))
        .join('')
}
</div>`;

type PropertyProps = {
    name: string;
    schema: oas.SchemaObject;
    spec: oas.Document;
};
const Property = ({ name, schema }: PropertyProps) => /*html*/ `
<span>${name}:</span> <b>${schema.type}</b> <br />
`;
