import React, { Component } from 'react'
import { Treebeard, decorators } from 'react-treebeard';

decorators.Header = ({ node, style }) => {
  return (
    <div style={ style.base }>
      <div style={ style.title }>
          {node.name}
      </div>
      <div style={{ position: 'absolute', right: 5, top: 0 }}>
        { JSON.stringify(node.value) }
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
