import Didact from './didact';
import DidactDOM from './didact-dom';

const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
);
console.log(element);

const container = document.getElementById('root');
DidactDOM.render(element, container);
