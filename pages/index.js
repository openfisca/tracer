import React from 'react'
import Layout from '../components/Layout'
import NodeView from '../components/NodeView'
import fetch from 'isomorphic-unfetch'
import input from '../input'

class Index extends React.Component {

  constructor(props) {
    super(props)

    this.handleHostChange = this.handleHostChange.bind(this);
    this.handleRootCalculationChange = this.handleRootCalculationChange.bind(this);
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.hasTrace = this.hasTrace.bind(this);

    this.state = {
      host: 'https://fr.openfisca.org/api/v21',//'http://127.0.0.1:2000',
      situation: JSON.stringify(input, null, 2),
      result: '',
      root: ''
    }
  }

  hasTrace() {
    return this.state.result && this.state.result.requestedCalculations
  }

  handleHostChange(event) {
    this.setState({ host: event.target.value })
  }


  handleTextAreaChange(event) {
    this.setState({ situation: event.target.value })

     this.setState({ result: '', root: '' })

    fetch(`${this.state.host}/trace`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: event.target.value
      })
      .then(result => result.json())
      .then(result => result && this.setState({ result: result }))
      .then(() => {
        if (! this.hasTrace())
          return

        this.setState({ root: this.state.result.requestedCalculations[0] })
      })
  }

  handleRootCalculationChange(event) {
    this.setState({ root: event.target.value })
  }

  render() {
    return (
      <Layout>
        <section>
          <div className="container">
            <h2 className="section__title">OpenFisca Tracer</h2>
            <p className="section__subtitle">A tool to investigate OpenFisca computations</p>

            <style jsx>{`
              textarea {
                min-height: 20rem;
                resize: vertical;
              }
            `}</style>
            <div style={styleIndex}>
              <div className="form__group">
                <label htmlFor="host">OpenFisca base URL</label>
                <input id="host" value={this.state.host} onChange={this.handleHostChange}/>
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
