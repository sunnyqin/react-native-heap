// Libraries
import React from 'react';
import { NativeModules } from 'react-native';

import {
  HeapIgnore,
  HeapIgnoreTargetText,
  withHeapIgnore,
} from './autotrack/heapIgnore';
import {
  withHeapTouchableAutocapture,
} from './autotrack/touchables';
import { withHeapPressableAutocapture } from './autotrack/pressable';
import { autotrackSwitchChange } from './autotrack/switches';
import { autotrackScrollView } from './autotrack/scrollViews';
import {
  autocaptureTextInputChange,
  withHeapTextInputAutocapture,
} from './autotrack/textInput';
import { withReactNavigationAutotrack } from './autotrack/reactNavigation';
import { bailOnError } from './util/bailer';

const RNHeap = NativeModules.RNHeap;

export { HeapIgnore, HeapIgnoreTargetText, RNHeap };

export default {
  bailOnError,
  withHeapTouchableAutocapture,
  withHeapPressableAutocapture,
  withHeapTextInputAutocapture,
  withReactNavigationAutotrack,
  Ignore: HeapIgnore,
  IgnoreTargetText: HeapIgnoreTargetText,
  withHeapIgnore,
};
