import React from 'react';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80';

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
