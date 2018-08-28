import React from 'react'
import Layout from '../components/Layout'
import NodeView from '../components/NodeView'
import fetch from 'isomorphic-unfetch'
import input from '../input'

class Index extends React.Component {

  constructor(props) {
    super(props)

    this.fetchSource = this.fetchSource.bind(this);
    this.fetchTrace = this.fetchTrace.bind(this);
    this.handleHostChange = this.handleHostChange.bind(this);
    this.handleRootCalculationChange = this.handleRootCalculationChange.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.hasTrace = this.hasTrace.bind(this);

    this.state = {
      host: 'http://127.0.0.1:2000',
      source: 'http://localhost:9000/api/situations/58bd260d4aa60a680a741e68/openfisca-request',
      result: '',
      root: ''
    }
  }

  componentDidMount() {
    if (! window.document.location.search) {
      return
    }

    const query = window.document.location.search.substring(1)
    const params = query.split('&').reduce((params, tuple) => {
      const pair = tuple.split('=')

      params[pair[0]] = decodeURI(pair[1])
      return params
    }, {})

    this.setState({
      host: params.host,
      source: params.source,
    }, this.fetchSource)
  }

  componentDidUpdate(previousState, newState) {
    if (previousState.source != newState.source) {
      //this.fetchSource();
    }
  }

  fetchSource() {
    console.log(this.state.source)
    return fetch(this.state.source)
      .then(result => {
        return result.json()
      })
      .then(result => {
        result && this.setState({ situation: JSON.stringify(result, null, 2) }, this.fetchTrace)
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  fetchTrace() {
    console.log("fetchTrace")
    fetch(`${this.state.host}/trace`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.state.situation
      })
      .then(result => result.json())
      .then(result => {
        result.requestedCalculations.sort()
        return result
      })
      .then(result => result && this.setState({ result: result }))
      .then(() => {
        if (! this.hasTrace())
          return

        this.setState({ root: this.state.result.requestedCalculations[0] })
      })
  }

  hasTrace() {
    return this.state.result && this.state.result.requestedCalculations
  }

  handleHostChange(event) {
    this.setState({ host: event.target.value })
  }

  handleSourceChange(event) {
    this.setState({ source: event.target.value })
  }

  handleTextAreaChange(event) {
    this.setState({ situation: event.target.value })

     this.setState({ result: '', root: '' })

     this.fetchTrace();
  }

  handleRootCalculationChange(event) {
    this.setState({ root: event.target.value })
  }

  render() {
    return (
      <Layout>

        <style jsx>{`
          textarea {
            min-height: 20rem;
            resize: vertical;
          }

          .error {
            background-color: #ec7676;
          }
        `}</style>
        <section className={ this.state.error ? 'error' : ''}>
          <div className="container">
            <h2 className="section__title">OpenFisca Tracer</h2>
            <p className="section__subtitle">A tool to investigate OpenFisca computations</p>

            { (this.state.error) && (
              <h3>{ this.state.error.toString() }</h3>
            )}

            <div>
              <div className="form__group">
                <label htmlFor="host">OpenFisca base URL</label>
                <input id="host" value={this.state.host} onChange={this.handleHostChange}/>
              </div>
              <div className="form__group">
                <label htmlFor="source">OpenFisca request source URL</label>
                <input id="source" value={this.state.source} onChange={this.handleSourceChange}/>
              </div>
              <div className="form__group">
                <label htmlFor="request">Request content</label>
                <textarea
                  id="request"
                  onChange={this.handleTextAreaChange}
                  value={this.state.situation}/>
              </div>

              { (this.state.result && !this.state.result.requestedCalculations) && (
                <pre>{JSON.stringify(this.state.result, null, 2)}</pre>
              )}
              { this.hasTrace() && (
                <div>
                  <div className="form__group">
                    <label htmlFor="calculation">Computation to investigate</label>
                    <select
                      id="calculation"
                      onChange={this.handleRootCalculationChange}>
                      {this.state.result.requestedCalculations.map((variableName) => (
                        <option key={variableName} value={variableName}>{variableName + ' ' + JSON.stringify(this.state.result.trace[variableName].value)}</option>
                      ))}
                    </select>
                  </div>

                  <NodeView root={this.state.root} repo={this.state.result.trace} level={1}/>
                </div>
              )}
            </div>
          </div>
        </section>
      </Layout>
    )
  }
}

export default Index
