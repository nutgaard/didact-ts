import Dom from './../didact-dom';
export interface Props {
    children?: Element[];
    [key: string]: any;
}
export interface Element {
    type: null | string | ((props: any) => Element);
    props: Props;
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
                if (typeof child === 'string' || typeof child === 'number') {
                    return createTextElement(''+child)
                } else {
                    return child;
                }
            })
        }
    };
}

type Updater<T> = (newValue : T | ((current: T) => T)) => void;
export function useState<T>(initial: T | (() => T)): [T, Updater<T>] {
    return Dom.useState(initial);
}

export default {
    createElement,
    useState
}