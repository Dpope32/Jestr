declare module 'react-native-pin-input' {
    import { Component } from 'react';
    import { StyleProp, ViewStyle, TextStyle } from 'react-native';
  
    interface PinInputProps {
      onRef?: (ref: any) => void;
      onTextChange: (text: string) => void;
      numberOfPins: number;
      autoFocus?: boolean;
      pinViewStyle?: StyleProp<ViewStyle>;
      pinTextStyle?: StyleProp<TextStyle>;
    }
  
    export default class PinInput extends Component<PinInputProps> {}
  }
  