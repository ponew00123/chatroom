import Login from "./public/src/component/login";
import Chat from "./public/src/component/chat";

export class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: "login"
        };
    }
    switch = (change) => {
        this.setState({ mode: change })
    }


    render() {
        if (this.state.mode == "login") {
            return (
                <Login changemode={this.switch} />
            );
        } else if (this.state.mode == "chat") {
            return (
                <Chat changemode={this.switch} />
            );
        }
    }
}

ReactDOM.render(<Root />, document.getElementById('root'));