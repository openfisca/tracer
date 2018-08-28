import JSONView from 'react-json-view'

const onChange = ({ existing_src, existing_value, name, new_value, updated_src }, onChange) => {

  console.log('ON CHANGE', { existing_src, existing_value, name, new_value, updated_src })

  if (new_value !== existing_value) {
    onChange(updated_src)
  }
  return true
}

export default (props) => {
  return (
    <JSONView { ...props }
      indentWidth={ 2 }
      collapsed={ 1 }
      enableClipboard={ false }
      name={ false }
      onAdd={ event => onChange(event, props.onChange) }
      onDelete={ event => onChange(event, props.onChange) }
      onEdit={ event => onChange(event, props.onChange) }
      theme="monokai" />
  )
}
