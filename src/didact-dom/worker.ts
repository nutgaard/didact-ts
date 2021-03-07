import * as Didact from "../didact";
import {RequestIdleCallbackDeadline} from "../didact/types-polyfill";


export interface Fiber extends Didact.Element {
    dom: Node | null;
    parent: Fiber | null;
    child: Fiber | null;
    sibling: Fiber | null;
}

class Worker {
    private nextFiber: Fiber | null = null;
    private wipRoot: Fiber | null = null;

    constructor() {
        this.loop = this.loop.bind(this)
        window.requestIdleCallback(this.loop);
    }

    public setNextFiber(fiber: Fiber) {
        this.wipRoot = fiber;
        this.nextFiber = fiber;
    }

    private loop(deadline: RequestIdleCallbackDeadline) {
        let shouldYield = false;
        while (this.nextFiber !== null && !shouldYield) {
            this.nextFiber = Worker.performUnitOfWork(this.nextFiber);
            shouldYield = deadline.timeRemaining() < 1;
        }

        if (this.nextFiber === null && this.wipRoot !== null) {
            this.commitRoot();
        }

        window.requestIdleCallback(this.loop);
    }

    private commitRoot() {
        if (this.wipRoot !== null) {
            this.commitWork(this.wipRoot.child);
        }
        this.wipRoot = null;
    }

    private commitWork(fiber: Fiber | null) {
        if (fiber === null) {
            return;
        }
        const domParent = fiber.parent.dom;
        domParent.appendChild(fiber.dom);
        this.commitWork(fiber.child);
        this.commitWork(fiber.sibling);
    }

    private static performUnitOfWork(fiber: Fiber): Fiber | null {
        if (fiber.dom === null) {
            fiber.dom = Worker.createDom(fiber);
        }

        return Worker.findNextFiber(fiber);
    }

    private static findNextFiber(fiber): Fiber | null {
        Worker.buildNextLevelInFiberTree(fiber);

        if (fiber.child !== null) {
            return fiber.child;
        }
        let nextFiber = fiber;
        while (nextFiber !== null) {
            if (nextFiber.sibling !== null) {
                return nextFiber.sibling;
            }
            nextFiber = nextFiber.parent;
        }

        return null;
    }

    private static buildNextLevelInFiberTree(fiber: Fiber) {
        const elements = fiber.props.children;
        let prevSibling: Fiber | null = null;
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            const childFiber: Fiber = {
                type: element.type,
                props: element.props,
                parent: fiber,
                child: null,
                sibling: null,
                dom: null
            }
            if (index === 0) {
                fiber.child = childFiber;
            }
            if (prevSibling !== null) {
                prevSibling.sibling = childFiber;
            }
            prevSibling = childFiber;
        }
    }

    static createDom(Fiber: Fiber) {
        const isTextElement = Fiber.type === Didact.TEXT_ELEMENT;
        const node = isTextElement
            ? document.createTextNode('')
            : document.createElement(Fiber.type);

        Object.keys(Fiber.props)
            .filter((key) => key !== 'children')
            .forEach((name) => {
                node[name] = Fiber.props[name]
            });

        return node;
    }
}

export default Worker;