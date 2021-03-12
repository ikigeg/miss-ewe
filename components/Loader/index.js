import React, { memo } from 'react';
import { SpinnerDotted } from 'spinners-react';

const Loading = memo(({ total, fetched }) => {
  if (total === fetched) {
    return (
      <div>
        <SpinnerDotted />
      </div>
    );
  }

  return (
    <div>
      <SpinnerDotted />
      <p>Total: {total}</p>
      <p>Fetched: {fetched}</p>
    </div>
  );
});
Loading.displayName = 'Loading';

export default Loading;
