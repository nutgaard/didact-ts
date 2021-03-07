import {RequestIdleCallbackDeadline} from "../didact/types-polyfill";

let nextUnitOfWork: any | null = null;

function workloop(deadline: RequestIdleCallbackDeadline) {
    let shouldYield = false;
    while (nextUnitOfWork !== null && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    window.requestIdleCallback(workloop);
}

function performUnitOfWork(work: any): any {
    return {};
}
