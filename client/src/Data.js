import React from 'react';

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {apiResponse: ""};
    }

    callAPI() {
        fetch("http://localhost:9000/users")
            .then(res => res.json()) /* get the JSON response */
            .then(data => this.setState({ apiResponse: data }));
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        const { apiResponse } = this.state;
        return(
            <p>{apiResponse.test}</p>
        );
    }
}

export default Data;