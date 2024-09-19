import * as fs from 'fs';
import { format, resolveConfig } from 'prettier';
import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { ComponentSlot } from './my-gen';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

spec.paths &&
    fs.writeFileSync(
        'examples/petstore.html',
        await format(ComponentSlot('Document', { spec }), {
            parser: 'html',
            ...(await resolveConfig('./.prettierrc.cjs')),
        }),
    );
