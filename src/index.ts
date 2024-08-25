import * as fs from 'fs';
import { format, resolveConfig } from 'prettier';
import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { Document } from './openapi';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

const documentHtml = Document({ spec });
spec.paths &&
    fs.writeFileSync(
        'examples/petstore.html',
        await format(documentHtml, {
            parser: 'html',
            ...(await resolveConfig('./.prettierrc.cjs')),
        }),
    );
