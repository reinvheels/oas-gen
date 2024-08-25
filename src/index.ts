import * as fs from 'fs';
import type { OpenAPIV3_1 as oas } from 'openapi-types';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

console.log(spec.info);
