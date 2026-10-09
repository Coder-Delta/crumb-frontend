import React from 'react';
const FALLBACK_IMAGE = '/images/food/photo-1547592180-85f173990554.jpg';

export default function Image({ src, ...props }) {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      onError={(event) => {
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
      {...props}
    />
  );
}
