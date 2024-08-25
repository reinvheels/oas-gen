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
    ${spec.paths ? Operations({ paths: spec.paths }) : ''}
</body>
</html>
`;

type OperationsProps = {
    paths: oas.PathsObject;
};
export const Operations = ({ paths }: OperationsProps) =>
    Object.entries(paths)
        .map(([path, pathObject]) =>
            pathObject
                ? Object.entries(pathObject)
                      .map(([method, operation]) =>
                          Operation({
                              operation: operation as oas.OperationObject,
                              method: method as HttpMethod,
                              path,
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
};
export const Operation = ({ operation, method, path }: OperationProps) => /*html*/ `
<div>
    <h2>${method.toUpperCase()} ${path}</h2>
    <h3>${operation.operationId}</h3>
    <p>${operation.description}</p>
</div>
`;
