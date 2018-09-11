import React from 'react'
import Layout from '../components/Layout'
import fetch from 'isomorphic-unfetch'
import input from '../input'

import dynamic from 'next/dynamic'
const JSONView = dynamic(
  import('../components/JSONView'),
  { ssr: false }
)
const TreeBeard = dynamic(
  import('../components/TreeBeard'),
  { ssr: false }
)

class Index extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      host: 'https://openfisca.mes-aides.gouv.fr',
      source: '',
      result: {},
      root: '',
      treeData: [],
      situation: {},
    }

    this.fetchSource = this.fetchSource.bind(this);
    this.fetchTrace = this.fetchTrace.bind(this);
    this.handleHostChange = this.handleHostChange.bind(this);
    this.handleRootCalculationChange = this.handleRootCalculationChange.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.hasTrace = this.hasTrace.bind(this);
  }

  componentDidMount() {

    const queryString = window.document.location.search.replace('?', '') || ''

    const params = queryString.split('&').reduce((params, tuple) => {
      const pair = tuple.split('=')

      params[pair[0]] = decodeURI(pair[1])
      return params
    }, {})

    let newState = {}
    if (params.host) {
      newState = Object.assign(newState, { host: params.host })
    }
    if (params.source) {
      newState = Object.assign(newState, { source: params.source })
    }

    if (newState.hasOwnProperty('host') || newState.hasOwnProperty('source')) {
      this.setState(newState)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.host !== prevState.host || this.state.source !== prevState.source) {
      this.fetchSource()
    }

    if (this.state.situation !== prevState.situation) {
      this.fetchTrace()
    }
  }

  fetchSource() {

    this.setState({
      error: false
    })

    return fetch(this.state.source)
      .then(result => {
        return result.json()
      })
      .then(result => {
        setTimeout(() => {
          this.setState({
            situation: Object.assign({}, result)
          })
        }, 1000)
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  fetchTrace() {

    this.setState({
      loading: true,
      error: false,
    })

    fetch(`${this.state.host}/trace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state.situation)
      })
      .then(result => result.json())
      .then(result => {
        result.requestedCalculations.sort()
        return result
      })
      .then(result => {
        this.setState({
          loading: false,
          result,
          root: result.requestedCalculations[0],
          treeData: this._computeTreeData(result, result.requestedCalculations[0])
        })
      })
      .catch(error => {
        this.setState({
          loading: false,
          error
        })
      })
  }

  hasTrace() {
    return !this.state.loading && this.state.result && this.state.result.requestedCalculations
  }

  handleHostChange(event) {
    this.setState({ host: event.target.value })
  }

  handleSourceChange(event) {
    this.setState({ source: event.target.value })
  }

  _computeTreeData(result, dependency) {
    return result.trace[dependency].dependencies.map(dependency => {
      return {
        name: dependency,
        toggled: false,
        children: [],
        value: result.trace[dependency].value
      }
    })
  }

  _loadChildren(dependency) {

    const { result } = this.state

    if (result.trace[dependency].dependencies.length === 0) {
      return []
    }

    return result.trace[dependency].dependencies.map(dependency => {
      return {
        name: dependency,
        toggle: false,
        children: result.trace[dependency].dependencies.length > 0 ? [] : null,
        value: result.trace[dependency].value
      }
    })
  }

  handleRootCalculationChange(event) {
    const dependency = event.target.value
    this.setState({
      root: dependency,
      treeData: this._computeTreeData(this.state.result, dependency)
    })
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
                <JSONView src={ this.state.situation } onChange={ situation => this.setState({ situation }) } />
              </div>
              { this.state.loading && (
                <div className="form__group">Loading…</div>
              )}
              { this.hasTrace() && (
                <div className="form__group">
                  <div className="form__group">
                    <label htmlFor="calculation">Computation to investigate</label>
                    <select
                      id="calculation"
                      onChange={this.handleRootCalculationChange}>
                      { this.state.result.requestedCalculations.map((variableName) => (
                        <option key={ variableName } value={ variableName }>
                          { `${variableName} ${JSON.stringify(this.state.result.trace[variableName].value)}` }
                        </option>
                      )) }
                    </select>
                  </div>
                  <div className="form__group">
                    <TreeBeard data={ this.state.treeData } loadChildren={ this._loadChildren.bind(this) } />
                  </div>
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
