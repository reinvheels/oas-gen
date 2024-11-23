import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { createGenerator } from '../generator';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type DocumentProps = {
    spec: oas.Document;
};
const Document: Jizx.Component<DocumentProps> = ({ spec }) =>
    spec.paths && <ComponentSlot Component="Operations" paths={spec.paths} spec={spec} />;

export type OperationsProps = {
    paths: oas.PathsObject;
    spec: oas.Document;
};
const Operations: Jizx.Component<OperationsProps> = ({ paths, spec }) =>
    Object.entries(paths)
        .map(([path, pathObject]) =>
            pathObject
                ? Object.entries(pathObject)
                      .map(([method, operation]) => (
                          <ComponentSlot
                              Component="Operation"
                              operation={operation as oas.OperationObject}
                              method={method as HttpMethod}
                              path={path}
                              spec={spec}
                          />
                      ))
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
const Operation: Jizx.Component<OperationProps> = ({ operation, spec }) => (
    <>
        {operation.requestBody && (
            <ComponentSlot Component="RequestBody" requestBody={operation.requestBody} spec={spec} />
        )}
        {operation.responses && <ComponentSlot Component="Responses" responses={operation.responses} spec={spec} />}
    </>
);

export type CircularSchema = { CIRCULAR: string };
export const getSchema = (
    schemaOrRef: oas.ReferenceObject | oas.SchemaObject | undefined,
    spec: oas.Document,
    usedRefs: string[] = [],
): [CircularSchema | oas.SchemaObject | undefined, string[]] => {
    const schemas = spec.components?.schemas || {};
    if (schemaOrRef && '$ref' in schemaOrRef) {
        const schemaName = schemaOrRef.$ref.split('#/components/schemas/')[1];
        if (usedRefs.includes(schemaName)) {
            return [{ CIRCULAR: schemaName }, usedRefs];
        }
        return [schemas[schemaName] || undefined, [...usedRefs, schemaName]];
    } else {
        return [schemaOrRef, usedRefs];
    }
};

export type RequestBodyProps = {
    requestBody: oas.ReferenceObject | oas.RequestBodyObject;
    spec: oas.Document;
};
const RequestBody: Jizx.Component<RequestBodyProps> = ({ requestBody, spec }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return schema && <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} spec={spec} />;
};

export type ResponsesProps = {
    responses: oas.ResponsesObject;
    spec: oas.Document;
};
const Responses: Jizx.Component<ResponsesProps> = ({ responses, spec }) => {
    return Object.entries(responses)
        .map(([status, response]) => (
            <ComponentSlot Component="Response" status={status} response={response} spec={spec} />
        ))
        .join('');
};

export type ResponseProps = {
    status: string;
    response: oas.ReferenceObject | oas.ResponseObject;
    spec: oas.Document;
};
const Response: Jizx.Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return schema && <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} spec={spec} />;
};

export type SchemaProps = {
    schema: oas.SchemaObject | CircularSchema;
    spec: oas.Document;
    usedRefs: string[];
};
const Schema: Jizx.Component<SchemaProps> = ({ schema, spec, usedRefs }) => {
    if ('CIRCULAR' in schema) {
        return '';
    } else if (schema.properties) {
        return Object.entries(schema.properties)
            .map(([name, schema]) => (
                <ComponentSlot
                    Component="Property"
                    name={name}
                    required={'required' in schema ? (schema.required?.includes(name) ?? false) : false}
                    schema={schema}
                    usedRefs={usedRefs}
                    spec={spec}
                />
            ))
            .join('');
    } else {
        return '';
    }
};

export type PropertyProps = {
    name: string;
    required: boolean;
    schema: oas.SchemaObject;
    usedRefs: string[];
    spec: oas.Document;
};
const Property: Jizx.Component<PropertyProps> = () => 'Property Component Missing';

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
