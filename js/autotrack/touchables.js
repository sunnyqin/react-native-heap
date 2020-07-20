import * as React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

import {
  getBaseComponentPropsFromComponent,
  getBaseComponentPropsFromFiber,
} from './common';
import { bailOnError } from '../util/bailer';
import { getComponentDisplayName } from '../util/hocUtil';

export const autotrackPress = track => (eventType, componentThis, event) => {
  const autotrackProps = getBaseComponentPropsFromComponent(componentThis);

  if (!autotrackProps) {
    // We're not capturing this interaction.
    return;
  }

  const touchState =
    componentThis &&
    componentThis.state &&
    componentThis.state.touchable &&
    componentThis.state.touchable.touchState;

  if (touchState === 'RESPONDER_ACTIVE_LONG_PRESS_IN') {
    // We already captured this touch when the 'touchableHandleLongPress' hook fired, so don't capture this event.
    return;
  }

  autotrackProps.touch_state = touchState;
  autotrackProps.is_long_press = eventType === 'touchableHandleLongPress';

  track('touch', autotrackProps);
};

const unsafePressHandler = (event, track, isLongPress) => {
  const autocaptureProps = getBaseComponentPropsFromFiber(event._targetInst);

  if (!autocaptureProps) {
    // We're not capturing this interaction.
    return;
  }

  autocaptureProps.is_long_press = isLongPress;

  track('touch', autocaptureProps);
};

const pressHandler = bailOnError(unsafePressHandler);

// Wrap the config passed to the 'Pressability' constructor by wrapping the 'onPress' and 'onLongPress' properties in the config, and
// keeping all other properties as-is.  See the config passed to the 'Pressability' constructor in
// https://github.com/facebook/react-native/blob/a5151c2b5f6f03896eb7d9df873c5f61a706f055/Libraries/Components/Touchable/TouchableOpacity.js#L143-L186.
export const wrapPressabilityConfig = track => pressabilityConfig => {
  const newConfig = {
    ...pressabilityConfig,
  };

  if (newConfig.onPress) {
    newConfig.onPress = event => {
      pressHandler(event, track, false);

      pressabilityConfig.onPress(event);
    };
  }

  if (newConfig.onLongPress) {
    newConfig.onLongPress = event => {
      pressHandler(event, track, true);

      pressabilityConfig.onLongPress(event);
    };
  }

  return newConfig;
};

export const withHeapTouchableAutocapture = track => (TouchableComponent) => {
  class HeapTouchableAutocapture extends React.Component {
    render() {
      const { forwardedRef, onPress, onLongPress, ...rest } = this.props;

      return (
        <TouchableComponent
          ref={forwardedRef}
          onPress={(e) => {
            autotrackPress(track)('touch', this, e);
            onPress && onPress(e);
          }}
          onLongPress={(e) => {
            autotrackPress(track)('touchableHandleLongPress', this, e);
            onLongPress && onLongPress(e);
          }}
          {...rest}
        >
          {this.props.children}
        </TouchableComponent>
      )
    }
  }

  HeapTouchableAutocapture.displayName = `withHeapTouchableAutocapture(${getComponentDisplayName(TouchableComponent)})`;

  const forwardRefHoc = React.forwardRef((props, ref) => {
    return <HeapTouchableAutocapture {...props} forwardedRef={ref} />;
  });

  hoistNonReactStatic(forwardRefHoc, TouchableComponent);

  return forwardRefHoc;
}
