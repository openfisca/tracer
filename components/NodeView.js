import React from 'react'

class NodeView extends React.Component {

  constructor(props) {
    super(props)

    this.handleDependencyClick = this.handleDependencyClick.bind(this);

    this.state = {}
  }

  handleDependencyClick(name) {
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

          ul {
            padding: 0em 0em 0em 1em;
          }
        `}</style>
        {this.props.root && this.props.repo[this.props.root].dependencies.map((value) => (
          <ul key={value}>
            <li>
              <div className={'details ' + (this.props.repo[value]) } onClick={() => this.handleDependencyClick(value)}>
                <div>{value} - {this.props.level}</div>
                <div>{JSON.stringify(this.props.repo[value].value)}</div>
              </div>  
              {
                this.state[value] && (
                  <NodeView root={value} repo={this.props.repo} level={this.props.level+1}/>
                )
              }
            </li>
          </ul>
        ))}
      </div>
    )
  }
}
/*
NodeView.getInitialProps = async function() {

  return {
    shows: [],
    adresses: [],
    specs: specs
  }
}//*/

export default NodeView
