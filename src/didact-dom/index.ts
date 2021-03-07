import * as Didact from '../didact';

export function render(element: Didact.Element, container: Node) {
    const isTextElement = element.type === Didact.TEXT_ELEMENT;
    const node = isTextElement
        ? document.createTextNode('')
        : document.createElement(element.type);

    Object.keys(element.props)
        .filter((key) => key !== 'children')
        .forEach((name) => {
            node[name] = element.props[name]
        });

    element.props.children.forEach((child) => render(child, node));

    container.appendChild(node);
}

export default {
    render
}