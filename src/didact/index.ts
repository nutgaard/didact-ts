export interface Element {
    type: string;
    props: any;
}

export function createElement(type: string, props: any, ...children: any[]): Element {
    return {
        type,
        props: {
            ...props,
            children
        }
    };
}

export default {
    createElement
}