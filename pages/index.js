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

    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleRootCalculation = this.handleRootCalculation.bind(this);

    this.state = {
      situation: JSON.stringify(input, null, 2),
      resultat: '',
      root: ''
    }
  }

  handleTextAreaChange(value) {
    this.setState({ situation: value.target.value })

    fetch('http://127.0.0.1:2000/trace',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: value.target.value
      })
      .then(result => result.text())
      .then(result => result && this.setState({ resultat: result }))
  }

  handleRootCalculation(value) {
    this.setState({ root: value.target.value })
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
          <textarea
            onChange={this.handleTextAreaChange}
            value={this.state.situation} />

          <textarea
            onChange={this.handleTextAreaChange}
            value={this.state.resultat} />

          <div>
            <select
              onChange={this.handleRootCalculation}>
              {fixture.requestedCalculations.map((variableName) => (
                <option key={variableName} value={variableName}>{variableName + ' ' + JSON.stringify(fixture.trace[variableName].value)}</option>
              ))}
            </select>
          </div>
          <NodeView root={this.state.root} repo={fixture.trace} level={1}/>
        </div>
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
