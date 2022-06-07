// example
import React from "react";
// @ts-ignore types not defined
import { useDeck } from "mdx-deck";

export const DeckState = () => {
  const state = useDeck();

  return (
    <div>
      <div>
        Slide # {state.index + 1}/{state.length}
      </div>
    </div>
  );
};
