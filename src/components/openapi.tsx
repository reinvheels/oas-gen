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

export type RequestBodyProps = {
    requestBody: oas.ReferenceObject | oas.RequestBodyObject;
};
const RequestBody: Jizx.Component<RequestBodyProps> = ({ requestBody }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    return schemaOrRef && <ComponentSlot Component="Schema" schemaOrRef={schemaOrRef} />;
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
    return schemaOrRef && <ComponentSlot Component="Schema" schemaOrRef={schemaOrRef} />;
};

export type SchemaProps = {
    schemaOrRef: oas.SchemaObject | oas.ReferenceObject;
};
const Schema: Jizx.Component<SchemaProps> = ({ schemaOrRef }) => {
    const { schema, circular, refNames } = useComponentRef(schemaOrRef);
    if (schema && !circular && schema.properties) {
        return (
            <RefNamesContext.Provider value={refNames}>
                {Object.entries(schema.properties).map(([name, schema]) => (
                    <ComponentSlot
                        Component="Property"
                        name={name}
                        required={'required' in schema ? (schema.required?.includes(name) ?? false) : false}
                        schema={schema}
                    />
                ))}
            </RefNamesContext.Provider>
        );
    }
};

export type PropertyProps = {
    name: string;
    required: boolean;
    schema: oas.SchemaObject;
};
const Property: Jizx.Component<PropertyProps> = () => 'Property Component Missing';

export const RefNamesContext = createContext<string[]>([]);
export const useComponentRef = (schemaOrRef: oas.ReferenceObject | oas.SchemaObject) => {
    const ref = (schemaOrRef as oas.ReferenceObject).$ref?.split('#/components/schemas/')?.[1] as string | undefined;
    const spec = useContext(SpecContext);
    const refNames = useContext(RefNamesContext);
    const circular = ref ? refNames.includes(ref) : false;
    return {
        ref,
        schema: ref ? spec.components?.schemas?.[ref] : (schemaOrRef as oas.SchemaObject),
        refNames: ref ? [...refNames, ref] : refNames,
        circular,
    };
};

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
