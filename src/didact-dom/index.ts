import * as Didact from '../didact';

export function render(element: Didact.Element, container: HTMLElement) {
    const node = document.createElement(element.type);
    node.title = element.props.title;
    const text = document.createTextNode("");
    text.nodeValue = element.props.children;

    node.appendChild(text);
    container.appendChild(node);
}

export default {
    render
}