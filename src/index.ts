import * as fs from 'fs';
import type { OpenAPIV3_1 as oas } from 'openapi-types';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

type OperationsProps = {
    paths: oas.PathsObject;
};
const Operations = ({ paths }: OperationsProps) => {
    return Object.entries(paths)
        .map(([path, pathObject]) => {
            return pathObject
                ? Object.entries(pathObject)
                      .map(([method, operation]) => {
                          return Operation({
                              operation: operation as oas.OperationObject,
                              method: method as HttpMethod,
                              path,
                          });
                      })
                      .join('')
                : '';
        })
        .join('');
};

type OperationProps = {
    method: HttpMethod;
    path: string;
    operation: oas.OperationObject;
};
const Operation = ({ operation, method, path }: OperationProps) => {
    return /*html*/ `<div>
    <h2>${method.toUpperCase()} ${path}</h2>
    <h3>${operation.operationId}</h3>
    <p>${operation.description}</p>
</div>
`;
};

spec.paths &&
    fs.writeFileSync(
        'examples/petstore.html',
        Operations({
            paths: spec.paths,
        }),
    );
