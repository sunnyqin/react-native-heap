class TouchableOpacity extends React.Component<Props, State> {}

module.exports = (React.forwardRef((props, hostRef) => (
  <TouchableOpacity {...props} hostRef={hostRef} />
)): React.ComponentType<$ReadOnly<$Diff<Props, {|hostRef: mixed|}>>>);
