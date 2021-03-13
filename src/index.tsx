import Didact, { Element, useState } from './didact';
import DidactDOM from './didact-dom';

function Title(props: { name: string }) {
    return <h1>Welcome to {props.name}</h1>;
}

function App() {
    return (
        <div id="foo">
            <p>foo<b>bar</b></p>
            <Title name="Didact" />
            <Counter />
        </div>
    );
}

function Counter() {
    const [state, setState] = useState(0);
    console.log('state', state);
    return (
        <div className="counter">
            <h1>Counter</h1>
            <p>Current value: {state}</p>
            <div className="buttons">
                <button onClick={() => { console.log('inc'); setState(s => s + 1); }}>+</button>
                <button onClick={() => setState(s => s - 1)}>-</button>
            </div>
        </div>
    );
}

const container = document.getElementById('root');
DidactDOM.render(<App /> as Element, container);
