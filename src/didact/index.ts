export interface Element {
    type: string;
    props: {
        children: Element[];
        [key: string]: any;
    };
}
export const TEXT_ELEMENT = 'TEXT_ELEMENT';
export interface TextElement extends Element {
    type: 'TEXT_ELEMENT'
}

function createTextElement(text: string): TextElement {
    return {
        type: TEXT_ELEMENT,
        props: {
            nodeValue: text,
            children: []
        }
    }
}

export function createElement(type: string, props: any, ...children: any[]): Element {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                if (typeof child === 'string') {
                    return createTextElement(child)
                } else {
                    return child;
                }
            })
        }
    };
}

export default {
    createElement
}