import { useEffect, useRef, useState } from 'react';
import useWindowSize from './useWindowSize';
import useInterval from './useInterval';
import { getBottomOffset } from './offsetProviders';

const WINDOW = 'window';
const PARENT = 'parent';

function useInfiniteScroll({
  loading,
  hasNextPage,
  onLoadMore,
  offsetProviders = [getBottomOffset],
  threshold = 150,
  checkInterval = 200,
  scrollContainer = WINDOW,
}) {
  const ref = useRef(null);
  const windowSize = useWindowSize();
  // Normally we could use the "loading" prop, but when you set "checkInterval" to a very small
  // number (like 10 etc.), some request components can't set its loading state
  // immediately (I had this problem with react-apollo's Query component. In some cases, it runs
  // "updateQuery" twice). Thus we set our own "listen" state which immeadiately turns to "false" on
  // calling "onLoadMore".
  const [listen, setListen] = useState(true);

  useEffect(() => {
    if (!loading) {
      setListen(true);
    }
  }, [loading]);

  function getParentSizes() {
    const parentNode = ref.current.parentNode;
    const parentRect = parentNode.getBoundingClientRect();
    const { top, bottom, left, right } = parentRect;

    return { top, bottom, left, right };
  }

  function isParentInView(parentRect) {
    const parent = ref.current ? ref.current.parentNode : null;

    if (parent) {
      const { left, right, top, bottom } = parentRect;
      if (left > windowSize.width) {
        return false;
      } else if (right < 0) {
        return false;
      } else if (top > windowSize.height) {
        return false;
      } else if (bottom < 0) {
        return false;
      }
    }

    return true;
  }

  function listenBottomOffset() {
    if (typeof loading === 'undefined' || (listen && !loading && hasNextPage)) {
      if (ref.current) {
        let parentRect = null;
        if (scrollContainer === PARENT) {
          parentRect = getParentSizes();
          if (!isParentInView(parentRect)) {
            // Do nothing if the parent is out of screen
            return;
          }
        }

        // Check if the any distance from the offset providers is less than "threshold"
        const rect = ref.current.getBoundingClientRect();
        const provider = offsetProviders.find(offsetProivder => {
          return offsetProivder(rect, windowSize, parentRect) < threshold;
        });

        if (provider) {
          setListen(false);
          onLoadMore(provider);
        }
      }
    }
  }

  useInterval(
    () => {
      listenBottomOffset();
    },
    // Stop interval when there is no next page.
    hasNextPage ? checkInterval : 0,
  );

  return ref;
}

export default useInfiniteScroll;
