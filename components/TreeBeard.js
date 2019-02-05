import React, { Component } from 'react'
import { Treebeard, decorators } from 'react-treebeard';

decorators.Header = ({ node, style }) => {

  let nodeName = node.label || node.name
  if (node.type === 'parameter') {
    nodeName = `[P] ${node.name}`
  }

  let prefix = node.name != nodeName ? node.name : ''

  return (
    <div style={ style.base }>
      <div style={ style.title }>
        <span className={ `node__name--${node.type}` }>{ prefix } { nodeName }</span>
      </div>
      <div style={{ position: 'absolute', right: 5, top: 0 }}>
        <span className={ `node__value--${node.type}` }>
          { JSON.stringify(node.value) }
        </span>
      </div>
    </div>
  )
}

class TreeBeardComponent extends Component {
  constructor(props) {
    super(props);
  }

  onToggle(node, toggled) {

    if (Array.isArray(node.children) && node.children.length === 0) {
      node.children = this.props.loadChildren(node.name)
    }

    node.active = true;
    node.toggled = toggled

    this.setState({ cursor: node });
  }

  render() {
    return (
      <Treebeard
        data={ this.props.data }
        onToggle={ this.onToggle.bind(this) }
        decorators={ decorators } />
    );
  }
}

export default (props) => {
  return (
    <TreeBeardComponent { ...props } />
  )
}
