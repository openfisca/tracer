import React from 'react'
import Layout from '../components/Layout'
import NodeView from '../components/NodeView'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

import fixture from '../trace'
import input from '../input'


const styleIndex = {/*
  display: 'flex',
  height: '100%',//*/
  minHeight: '20px',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  justifyContent: 'space-between'
}

class Index extends React.Component {

  constructor(props) {
    super(props)

    this.handleHostChange = this.handleHostChange.bind(this);
    this.handleRootCalculationChange = this.handleRootCalculationChange.bind(this);
    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);

    this.state = {
      host: 'http://127.0.0.1:2000',
      situation: JSON.stringify(input, null, 2),
      resultat: '',
      root: ''
    }
  }

  handleHostChange(event) {
    this.setState({ host: event.target.value })
  }

  handleTextAreaChange(event) {
    this.setState({ situation: event.target.value })

    fetch(`${this.state.host}/trace`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: event.target.value
      })
      .then(result => result.text())
      .then(result => result && this.setState({ resultat: result }))
  }

  handleRootCalculationChange(event) {
    this.setState({ root: event.target.value })
  }

  render() {
    return (
      <Layout>
        <style jsx>{`
          textarea {
            width: 48%
          }
        `}</style>
        <div style={styleIndex}>
          <div>
            <label for="host">OpenFisca base URL</label>
            <input id="host" value={this.state.host} onChange={this.handleHostChange} />
          </div>
          <textarea
            onChange={this.handleTextAreaChange}
            value={this.state.situation} />

          <textarea
            onChange={this.handleTextAreaChange}
            value={this.state.resultat} />

          <div>
            <select
              onChange={this.handleRootCalculationChange}>
              {fixture.requestedCalculations.map((variableName) => (
                <option key={variableName} value={variableName}>{variableName + ' ' + JSON.stringify(fixture.trace[variableName].value)}</option>
              ))}
            </select>
          </div>
        </div>
        <NodeView root={this.state.root} repo={fixture.trace} level={1}/>
      </Layout>
    )
  }
}

Index.getInitialProps = async function() {

  const specs = [];//await (await fetch('https://fr.openfisca.org/api/v20/spec')).json()

  return {
    shows: [],
    adresses: [],
    specs: specs
  }
}

export default Index
