import * as fs from 'fs';
import { format, resolveConfig } from 'prettier';
import type { OpenAPIV3_1 as oas } from 'openapi-types';
import { ComponentSlot } from './components/openapi.docs';
import { renderJizx } from '@reinvheels/jizx';
import { SpecContext } from './components/openapi';

const spec = JSON.parse(fs.readFileSync('examples/petstore.json').toString()) as oas.Document;

spec.paths &&
    fs.writeFileSync(
        'examples/petstore.html',
        await format(
            renderJizx(
                <SpecContext.Provider value={spec}>
                    <ComponentSlot Component="Document" />
                </SpecContext.Provider>,
            ),
            {
                parser: 'html',
                ...(await resolveConfig('./.prettierrc.cjs')),
            },
        ),
    );
