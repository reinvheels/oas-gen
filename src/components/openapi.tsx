import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { createGenerator } from '../generator';
import { createContext, useContext } from '@reinvheels/jizx';
import { emptySpec } from '../util';

export const SpecContext = createContext(emptySpec());

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type DocumentProps = {};
const Document: Jizx.Component<DocumentProps> = ({}) => {
    const spec = useContext(SpecContext);
    return spec.paths && <ComponentSlot Component="Operations" paths={spec.paths} />;
};

export type OperationsProps = {
    paths: oas.PathsObject;
};
const Operations: Jizx.Component<OperationsProps> = ({ paths }) => (
    <>
        {Object.entries(paths).map(
            ([path, pathObject]) =>
                pathObject &&
                Object.entries(pathObject).map(([method, operation]) => (
                    <ComponentSlot
                        Component="Operation"
                        operation={operation as oas.OperationObject}
                        method={method as HttpMethod}
                        path={path}
                    />
                )),
        )}
    </>
);
export type OperationProps = {
    method: HttpMethod;
    path: string;
    operation: oas.OperationObject;
};
const Operation: Jizx.Component<OperationProps> = ({ operation }) => (
    <>
        {operation.requestBody && <ComponentSlot Component="RequestBody" requestBody={operation.requestBody} />}
        {operation.responses && <ComponentSlot Component="Responses" responses={operation.responses} />}
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
};
const RequestBody: Jizx.Component<RequestBodyProps> = ({ requestBody }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const spec = useContext(SpecContext);
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return schema && <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} />;
};

export type ResponsesProps = {
    responses: oas.ResponsesObject;
};
const Responses: Jizx.Component<ResponsesProps> = ({ responses }) => {
    return (
        <>
            {Object.entries(responses).map(([status, response]) => (
                <ComponentSlot Component="Response" status={status} response={response} />
            ))}
        </>
    );
};

export type ResponseProps = {
    status: string;
    response: oas.ReferenceObject | oas.ResponseObject;
};
const Response: Jizx.Component<ResponseProps> = ({ status, response }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const spec = useContext(SpecContext);
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return schema && <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} />;
};

export type SchemaProps = {
    schema: oas.SchemaObject | CircularSchema;

    usedRefs: string[];
};
const Schema: Jizx.Component<SchemaProps> = ({ schema, usedRefs }) => {
    if ('CIRCULAR' in schema) {
        return '';
    } else if (schema.properties) {
        return (
            <>
                {Object.entries(schema.properties).map(([name, schema]) => (
                    <ComponentSlot
                        Component="Property"
                        name={name}
                        required={'required' in schema ? (schema.required?.includes(name) ?? false) : false}
                        schema={schema}
                        usedRefs={usedRefs}
                    />
                ))}
            </>
        );
    } else {
        return '';
    }
};

export type PropertyProps = {
    name: string;
    required: boolean;
    schema: oas.SchemaObject;
    usedRefs: string[];
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
