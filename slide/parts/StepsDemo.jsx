import React from "react";
// @ts-ignore No Types given
import { useSteps } from "mdx-deck";

export const StepsDemo = () => {
  const length = 3;
  const step = useSteps(3);

  return (
    <div>
      <ul>
        {step > 0 ? <li>apple</li> : null}
        {step > 1 ? <li>bacon</li> : null}
        {step > 2 ? <li>cat</li> : null}
      </ul>
      <h2>
        {step}/{length}
      </h2>
    </div>
  );
};
