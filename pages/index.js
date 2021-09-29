import React from 'react'
import Layout from '../components/Layout'
import fetch from 'isomorphic-unfetch'
import input from '../input'
import Modal from 'react-modal'

import dynamic from 'next/dynamic'
const JSONView = dynamic(
  import('../components/JSONView'),
  { ssr: false }
)
const TreeBeard = dynamic(
  import('../components/TreeBeard'),
  { ssr: false }
)

const modalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    minWidth              : '50%'
  }
};

class Index extends React.Component {

  constructor(props) {
    super(props)

    const defaultSituation = {}

    this.state = {
      loading: false,
      host: 'https://openfisca.mes-aides.org',
      source: '',
      result: {},
      root: '',
      treeData: [],
      situation: defaultSituation,
      modalIsOpen: false,
      textareaValue: JSON.stringify(defaultSituation, null, 4)
    }

    this.fetchSource = this.fetchSource.bind(this);
    this.fetchTrace = this.fetchTrace.bind(this);
    this.fetchVariableDictionary = this.fetchVariableDictionary.bind(this);
    this.handleHostChange = this.handleHostChange.bind(this);
    this.handleRootCalculationChange = this.handleRootCalculationChange.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.hasTrace = this.hasTrace.bind(this);

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onTextAreaChange = this.onTextAreaChange.bind(this);
    this.updateJSON = this.updateJSON.bind(this);
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

    this.fetchVariableDictionary()
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

    if (!this.state.source) {
      return
    }

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
      .then(response => {
        if (response.ok) {
          return response.text().then(text => {
            return JSON.parse(text.replace(/-?Infinity/g, '{}      ').replace(/NaN/g, '{} ')) })
        }
        return response.text().then(text => {
          return Promise.reject(text)
        })
      })
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

  fetchVariableDictionary() {
    if (this.state.variables) {
      return this.state.variables
    }
    return fetch(`${this.state.host}/variables`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        return response.text().then(text => {
          return Promise.reject(text)
        })
      })
      .then(result => {
        this.setState({
          variables: result
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

  _getLabel(dependency) {
    let label = dependency
    if (this.state.variables) {
      var name = dependency.split("<")[0]
      label = (this.state.variables[name] && this.state.variables[name].description) || dependency
    }
    return label
  }

  _computeTreeData(result, dependency) {
    return result.trace[dependency].dependencies.map(dependency => {
      return {
        name: dependency,
        label: this._getLabel(dependency),
        type: 'variable',
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

    const children = result.trace[dependency].dependencies.map(dependency => {
      return {
        name: dependency,
        label: this._getLabel(dependency),
        type: 'variable',
        toggle: false,
        children: result.trace[dependency].dependencies.length > 0 ? [] : null,
        value: result.trace[dependency].value
      }
    })

    if (Object.keys(result.trace[dependency].parameters).length > 0) {
      for (let parameterName in result.trace[dependency].parameters) {
        children.push({
          name: parameterName,
          label: this._getLabel(dependency),
          type: 'parameter',
          toggle: false,
          children: null,
          value: result.trace[dependency].parameters[parameterName]
        })
      }
    }

    return children
  }

  handleRootCalculationChange(event) {
    const dependency = event.target.value
    this.setState({
      root: dependency,
      treeData: this._computeTreeData(this.state.result, dependency)
    })
  }

  openModal() {
    this.setState({
      modalIsOpen: true,
      textareaValue: JSON.stringify(this.state.situation, null, 4)
    });
  }

  afterOpenModal() {
    this.textarea.focus()
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  onTextAreaChange(e) {
    this.setState({ textareaValue: e.target.value })
  }

  updateJSON() {
    const { textareaValue } = this.state

    this.setState({
      situation: JSON.parse(textareaValue),
      textareaValue: '',
      modalIsOpen: false
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
          .container {
            max-width: calc(100% - 50px);
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
                <span className="help">The base URL of the OpenFisca server</span>
              </div>
              <div className="form__group">
                <label htmlFor="source">OpenFisca request source URL (optional)</label>
                <input id="source" value={this.state.source} onChange={this.handleSourceChange}/>
                <span className="help">An optional URL retrieving a OpenFisca request</span>
              </div>
              <div className="form__group">
                <label htmlFor="request">Request content</label>
                <div className="jsonview-wrapper">
                  <JSONView src={ this.state.situation } onChange={ situation => this.setState({ situation }) } />
                </div>
                <button className="button small" onClick={ this.openModal }>Edit raw JSON</button>
              </div>
              {
                this.state.result && this.state.result.entitiesDescription && (
                  <div>
                    <p>Entity structure</p>
                    <div>
                          <ul>
                            {
                              Object.keys(this.state.result.entitiesDescription).map((entity) => (
                                  <li>
                                    {entity}
                                    <ul>
                                      {this.state.result.entitiesDescription[entity].map((member) => (
                                          <li>{member}</li>
                                      ))}
                                    </ul>
                                  </li>
                              ))
                            }
                          </ul>
                    </div>
                  </div>
                )
              }
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
        <Modal
          isOpen={ this.state.modalIsOpen }
          onAfterOpen={ this.afterOpenModal }
          onRequestClose={ this.closeModal }
          style={ modalStyles }
          contentLabel="Paste"
          ariaHideApp={ false }>
          <div className="form__group">
            <label htmlFor="past">Paste JSON below</label>
            <textarea id="paste" value={ this.state.textareaValue } onChange={ this.onTextAreaChange } ref={ textarea => this.textarea = textarea }></textarea>
          </div>
          <div className="form__group">
            <button className="button" onClick={ this.updateJSON }>GO!</button>
          </div>
        </Modal>
      </Layout>
    )
  }
}

export default Index
