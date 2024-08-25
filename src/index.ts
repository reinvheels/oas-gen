import * as fs from 'fs';
import type { OpenAPIV3_1 as oas } from 'openapi-types';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

fs.writeFileSync('examples/petstore.html', '');

spec.paths &&
    Object.entries(spec.paths).forEach(([path, pathObject]) => {
        pathObject &&
            Object.entries(pathObject).forEach(([method, _operation]) => {
                const operation = _operation as oas.OperationObject;
                fs.appendFileSync(
                    'examples/petstore.html',
                    /*html*/ `<div>
                <h2>${operation.operationId}</h2>
                <p>${operation.description}</p>
            </div>`,
                );
            });
    });
