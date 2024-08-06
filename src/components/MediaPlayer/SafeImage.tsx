import React, { forwardRef } from 'react';
import { Image, ImageProps } from 'react-native';

interface SafeImageProps extends ImageProps {
  width?: number;
  height?: number;
}

const SafeImage = forwardRef<Image, SafeImageProps>(({ width, height, style, ...props }, ref) => {
  const safeWidth = typeof width === 'number' && !isNaN(width) ? width : undefined;
  const safeHeight = typeof height === 'number' && !isNaN(height) ? height : undefined;

  return (
    <Image
      ref={ref}
      {...props}
      style={[
        style,
        {
          width: safeWidth,
          height: safeHeight,
        },
      ]}
    />
  );
});

export default SafeImage;