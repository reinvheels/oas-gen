import type { OpenAPIV3_1 as oas } from 'openapi-types';
import type { Component } from './generator';
import { Generator, getSchema, type ResponseProps, type SchemaProps } from './openapi';
import { html } from './util';

const MyResponse: Component<ResponseProps> = ({ status, response, spec }) => {
    const schemaOrRef = (response as oas.ResponseObject).content?.['application/json']?.schema;
    const schema = getSchema(schemaOrRef, spec);
    return html`
        <h5>${status}</h5>
        ${response.description ? html`<p>Awesome ${response.description}</p>` : ''}
        ${schema ? ComponentSlot('Schema', { schema, spec }) : ''}
    `;
};

Generator.setComponents({
    Response: MyResponse,
});

export const { ComponentSlot } = Generator;

//  spec
//   |
//   V
// index => MyGen (customized toolkit) => OpenApi (base toolkit) => createGenerator(OpenApi)
