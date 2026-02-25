import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const LottieAnimation = ({ animationData, className, loop = true, autoplay = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: loop,
        autoplay: autoplay,
        animationData: animationData
      });

      return () => anim.destroy();
    }
  }, [animationData, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
};

export default LottieAnimation;
