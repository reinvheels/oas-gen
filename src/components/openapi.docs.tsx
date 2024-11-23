import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { cls } from '../util';
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

const Document: Jizx.Component<DocumentProps> = ({ spec }) => (
    <html>
        <head>
            <title>{spec.info.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div class="p-4 flex flex-col gap-2 container mx-auto">
                <h1 class="mt-16 text-5xl">
                    {spec.info.title}
                    <span class="text-lg italic opacity-50">{spec.info.version}</span>
                </h1>
                <p class="text-lg">{spec.info.description}</p>
                {spec.paths && <ComponentSlot Component="Operations" paths={spec.paths} spec={spec} />}
            </div>
        </body>
    </html>
);
const Operation: Jizx.Component<OperationProps> = ({ operation, method, path, spec }) => (
    <>
        <hr class="mt-8 border-[0.8pt] border-black/70" />
        <h2 class="font-mono text-4xl mt-4">
            <span class={cls('font-bold uppercase', HttpMethodColors[method])}>{method}</span>
            <span>{path}</span>
        </h2>
        <p>{operation.summary || operation.operationId}</p>
        <p class="text-black/50">{operation.description}</p>
        {operation.requestBody && (
            <ComponentSlot Component="RequestBody" requestBody={operation.requestBody} spec={spec} />
        )}
        {operation.responses && <ComponentSlot Component="Responses" responses={operation.responses} spec={spec} />}
    </>
);

const RequestBody: Jizx.Component<RequestBodyProps> = ({ requestBody, spec }) => {
    const schemaOrRef = (requestBody as oas.RequestBodyObject).content['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return (
        schema && (
            <>
                <h4 class="mt-4 text-2xl">Request Body</h4>
                {requestBody.description && <p>{requestBody.description}</p>}
                <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} spec={spec} />
            </>
        )
    );
};

const SchemaPanel: Jizx.Component<SchemaProps> = ({ schema, usedRefs, spec }) => (
    <div class="rounded-xl bg-slate-100 p-4 mb-4">
        <div class="flex flex-col gap-4 md:flex-row">
            <div class="flex flex-1">
                <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} spec={spec} />
            </div>
            <div class="flex flex-1 flex-col bg-white rounded-md p-4">
                <p>Example:</p>
                <pre>{JSON.stringify({ some: 'example', props: 42 }, null, 4)}</pre>
            </div>
        </div>
    </div>
);

const Responses: Jizx.Component<ResponsesProps> = ({ responses, spec }) => {
    return (
        <>
            <h4 class="mt-4 text-2xl">Responses</h4>
            {Object.entries(responses).map(([status, response]) => (
                <ComponentSlot Component="Response" status={status} response={response} spec={spec} />
            ))}
        </>
    );
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

const Response: Jizx.Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const [schema, usedRefs] = getSchema(schemaOrRef, spec);
    return (
        <>
            <h5>
                <span class={cls('font-mono font-bold', getStatusColor(status))}>{status}</span>{' '}
                {response.description && response.description}
            </h5>
            {schema && <SchemaPanel schema={schema} usedRefs={usedRefs} spec={spec} />}
        </>
    );
};

const Schema: Jizx.Component<SchemaProps> = ({ schema, usedRefs, spec }) => {
    if ('CIRCULAR' in schema) {
        return (
            <p>
                <span class="color-red-600">Circular</span> {schema.CIRCULAR}
            </p>
        );
    } else {
        return (
            <div>
                {schema.description && <p class="text-sm">{schema.description}</p>}
                <>
                    {schema.properties &&
                        Object.entries(schema.properties).map(([name, propSchema]) => (
                            <ComponentSlot
                                Component="Property"
                                name={name}
                                required={'required' in schema ? (schema.required?.includes(name) ?? false) : false}
                                schema={schema}
                                usedRefs={usedRefs}
                                spec={spec}
                            />
                        ))}
                </>
            </div>
        );
    }
};

const Property: Jizx.Component<PropertyProps> = ({
    name,
    schema: schemaOrRef,
    required,
    spec,
    usedRefs: _usedRefs,
}) => {
    const [schema, usedRefs] = getSchema(schemaOrRef, spec, _usedRefs);
    if (schema && 'CIRCULAR' in schema) {
        return (
            <p>
                <span>{name}:</span> <span class="text-red-600">Circular</span> {schema.CIRCULAR}
            </p>
        );
    } else {
        return (
            <>
                <p>
                    <span>{name}:</span>
                    {schema && schema.type && (
                        <span class="font-mono font-bold text-emerald-700/80">{schema.type}</span>
                    )}
                    {required && <span class="text-red-600">*</span>}
                </p>
                {schema && ('properties' in schema || 'CIRCULAR' in schema) && (
                    <div class="pl-4">
                        <ComponentSlot Component="Schema" schema={schema} usedRefs={usedRefs} spec={spec} />
                    </div>
                )}
            </>
        );
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
