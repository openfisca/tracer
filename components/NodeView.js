import React from 'react'

class NodeView extends React.Component {

  constructor(props) {
    super(props)

    this.handleDependencyClick = this.handleDependencyClick.bind(this);

    this.state = {}
  }

  handleDependencyClick(name) {
    if (!this.props.repo[name].dependencies.length)
      return
    this.setState({ [name]: !this.state[name] })
  }

  render() {
    return (
      <div>
        <style jsx>{`
          .details {
            display: flex;
            justify-content: space-between;
          }

          p, ul {
            margin: 0;
          }

          .details:hover {
            background-color: lightgrey;
          }

          .withDependency {
            cursor: pointer;
            text-decoration: underline;
          }

          ul {
            padding: 0em 0em 0em 1em;
          }
        `}</style>
        {this.props.root && this.props.repo[this.props.root].dependencies.map((variableName) => (
          <ul key={variableName}>
            <li>
              <div className={'details ' + (this.props.repo[variableName].dependencies.length ? 'withDependency' : '') } onClick={() => this.handleDependencyClick(variableName)}>
                <div>{variableName}</div>
                <div className="value">{JSON.stringify(this.props.repo[variableName].value)}</div>
              </div>  
              {
                this.state[variableName] && (
                  <NodeView root={variableName} repo={this.props.repo} level={this.props.level+1}/>
                )
              }
            </li>
          </ul>
        ))}
      </div>
    )
  }
}

export default NodeView
