import * as Didact from '../didact';
import Worker from './worker';

const worker = new Worker()
export function render(element: Didact.Element, container: Node) {
    worker.setRootFiber({
        dom: container,
        type: element.type,
        parent: null,
        child: null,
        sibling: null,
        props: {
            children: [element]
        }
    });
}

export default {
    render
}