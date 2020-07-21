import * as React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import * as _ from 'lodash';

import { getBaseComponentPropsFromComponent } from './common';
import { getComponentDisplayName } from '../util/hocUtil';

const DEBOUNCE_PERIOD_MS = 1000;

export const autocaptureTextInputChange = track => (
  eventType,
  componentThis,
  event
) => {
  // Attach a debounce function to the TextInput component instance if one's not already attached.
  if (!componentThis.__heap__debounceTextChange) {
    componentThis.__heap__debounceTextChange = _.debounce(
      debouncedAutocaptureTextInputChange(track),
      DEBOUNCE_PERIOD_MS
    );
  }

  componentThis.__heap__debounceTextChange(eventType, componentThis, event);
};

const debouncedAutocaptureTextInputChange = track => (
  eventType,
  componentThis,
  event
) => {
  const autotrackProps = getBaseComponentPropsFromComponent(componentThis);

  if (!autotrackProps) {
    // We're not capturing this interaction.
    return;
  }

  if (componentThis.props.placeholder) {
    autotrackProps.placeholder_text = componentThis.props.placeholder;
  }

  track(eventType, autotrackProps);
};

const NoopTextInput = (props) => {
  return props.children;
}

NoopTextInput.displayName = 'TextInput';

export const withHeapTextInputAutocapture = track => (TextInputComponent) => {
  class HeapTextInputAutocapture extends React.Component {
    autocaptureTextInputChangeWithDebounce = _.debounce(
      debouncedAutocaptureTextInputChange(track),
      DEBOUNCE_PERIOD_MS
    );

    render() {
      const { forwardedRef, onChange, ...rest } = this.props;

      return (
        <TextInputComponent
          ref={forwardedRef}
          onChange={(e) => {
            this.autocaptureTextInputChangeWithDebounce('text_edit', this, e);
            onChange && onChange(e);
          }}
          {...rest}
        >
          {this.props.children}
        </TextInputComponent>
      )
    }
  }

  HeapTextInputAutocapture.displayName = `withHeapTextInputAutocapture(${getComponentDisplayName(TextInputComponent)})`;

  const forwardRefHoc = React.forwardRef((props, ref) => {
    return (
      <NoopTextInput>
        <HeapTextInputAutocapture {...props} forwardedRef={ref} />
      </NoopTextInput>
    );
  });

  hoistNonReactStatic(forwardRefHoc, TextInputComponent);

  return forwardRefHoc;
}
