import * as Didact from '../didact';
import Worker from './worker';

const worker = new Worker()
export function render(element: Didact.Element, container: Node) {
    worker.setRootFiber({
        dom: container,
        type: null,
        parent: null,
        child: null,
        sibling: null,
        props: {
            children: [element]
        }
    });
}

export function useState<T>(initial: T | (() => T)) {
    return worker.useState(initial)
}

export default {
    render,
    useState
}