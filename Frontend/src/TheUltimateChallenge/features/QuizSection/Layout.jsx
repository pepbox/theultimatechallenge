import React, { useState } from 'react'
import Header from './Header'
import Overlay from './Overlay'
import Card from './Card';

function Layout() {
  const [overlayToggle, setOverlayToggle] = useState(false);

  return (
    <div
      className="relative flex justify-center font-mono"
      style={{ minHeight: `${window.innerHeight}px` }}
    >
      {overlayToggle && <Overlay />}
      <Header />
      <Card/>
      
    </div>
  );
}

export default Layout;
