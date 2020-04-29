export function getBottomOffset(selfRect, windowSize, containerRect) {
  const bottom = selfRect.bottom;
  let bottomOffset = bottom - windowSize.height;

  if (containerRect) {
    const parentBottom = containerRect.bottom
    // Distance between bottom of list and its parent
    bottomOffset = bottom - parentBottom;
  }

  return bottomOffset;
}

export function getTopOffset(selfRect, windowSize, containerRect) {
  const top = selfRect.top;
  let topOffset = top - windowSize.height;

  if (containerRect) {
    const parentTop = containerRect.top
    // Distance between bottom of list and its parent
    topOffset = parentTop - top;
  }

  return topOffset;
}
