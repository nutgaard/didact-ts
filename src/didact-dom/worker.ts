import * as Didact from "../didact";
import {RequestIdleCallbackDeadline} from "../didact/types-polyfill";
import {Props} from "../didact";
import * as PropUtils from './prop-utils'


export interface Fiber extends Didact.Element {
    dom: Node | null;
    parent: Fiber | null;
    child: Fiber | null;
    sibling: Fiber | null;
    alternate?: Fiber | null;
    effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION'
}

class Worker {
    private nextFiber: Fiber | null = null;
    private wipRoot: Fiber | null = null;
    private currentRoot: Fiber | null = null;
    private deletions: Fiber[] = [];

    constructor() {
        this.loop = this.loop.bind(this)
        window.requestIdleCallback(this.loop);
    }

    public setRootFiber(fiber: Fiber) {
        this.wipRoot = { ...fiber, alternate: this.currentRoot };
        this.deletions = [];
        this.nextFiber = this.wipRoot;
    }

    private loop(deadline: RequestIdleCallbackDeadline) {
        let shouldYield = false;
        while (this.nextFiber !== null && !shouldYield) {
            this.nextFiber = this.performUnitOfWork(this.nextFiber);
            shouldYield = deadline.timeRemaining() < 1;
        }

        if (this.nextFiber === null && this.wipRoot !== null) {
            this.commitRoot();
        }

        window.requestIdleCallback(this.loop);
    }

    private commitRoot() {
        this.deletions.forEach(this.commitWork);
        if (this.wipRoot !== null) {
            this.commitWork(this.wipRoot.child);
            this.currentRoot = this.wipRoot;
        }
        this.wipRoot = null;
    }

    private commitWork(fiber: Fiber | null) {
        if (fiber === null) {
            return;
        }
        const domParent = fiber.parent.dom;
        if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
            domParent.appendChild(fiber.dom);
        } else if (fiber.effectTag === 'DELETION') {
            domParent.removeChild(fiber.dom);
        } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
            Worker.updateDom(fiber.dom, fiber.alternate.props, fiber.props)
        }
        this.commitWork(fiber.child);
        this.commitWork(fiber.sibling);
    }

    private static updateDom(dom: Node, prevProps: Props, nextProps: Props) {
        // Remove properties that are gone
        Object.keys(prevProps)
            .filter(PropUtils.isProperty)
            .filter(PropUtils.isGone(prevProps, nextProps))
            .forEach((key) => {
                dom[key] = "";
            });

        // Set new or update props
        Object.keys(nextProps)
            .filter(PropUtils.isProperty)
            .filter(PropUtils.isNew(prevProps, nextProps))
            .forEach((key) => {
                dom[key] = nextProps[key];
            });

        // Remove old og changed eventlisteners
        Object.keys(prevProps)
            .filter(PropUtils.isEventListener)
            .filter((key) => {
                return PropUtils.isGone(prevProps, nextProps)(key) ||
                    PropUtils.isNew(prevProps, nextProps)(key);
            })
            .forEach((key) => {
                const eventType = key.substring(2).toLowerCase();
                dom.removeEventListener(eventType, prevProps[key]);
            });

        // Add new eventlisteners
        Object.keys(nextProps)
            .filter(PropUtils.isEventListener)
            .filter(PropUtils.isNew(prevProps, nextProps))
            .forEach((key) => {
                const eventType = key.substring(2).toLowerCase();
                dom.addEventListener(eventType, nextProps[key]);
            });
    }

    private performUnitOfWork(fiber: Fiber): Fiber | null {
        if (fiber.dom === null) {
            fiber.dom = Worker.createDom(fiber);
        }

        return this.findNextFiber(fiber);
    }

    private findNextFiber(fiber): Fiber | null {
        const elements: Didact.Element[] = fiber.props.children;
        this.reconcileChildren(fiber, elements);

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

    private reconcileChildren(fiber: Fiber, elements: Didact.Element[]) {
        let prevSibling: Fiber | null = null;
        let oldFiber: Fiber | null = fiber.alternate?.child

        let index = 0;
        while (index < elements.length && oldFiber !== null) {
            const element: Didact.Element = elements[index];
            let newFiber: Fiber | null = null;

            const isSameType = oldFiber?.type === element.type
            if (isSameType) {
                newFiber = {
                    type: oldFiber.type,
                    props: element.props,
                    dom: oldFiber.dom,
                    parent: fiber,
                    alternate: oldFiber,
                    effectTag: 'UPDATE',
                    child: null,
                    sibling: null
                };
            }
            if (element && !isSameType) {
                newFiber = {
                    type: element.type,
                    props: element.props,
                    dom: null,
                    parent: fiber,
                    alternate: null,
                    effectTag: 'PLACEMENT',
                    child: null,
                    sibling: null
                };
            }
            if (oldFiber && !isSameType) {
                oldFiber.effectTag = 'DELETION';
                this.deletions.push(oldFiber);
            }
            if (index === 0) {
                fiber.child = newFiber;
            }
            if (prevSibling !== null) {
                prevSibling.sibling = newFiber;
            }
            prevSibling = newFiber;
            index++;
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