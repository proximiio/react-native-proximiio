import React, { PropsWithChildren, useEffect, useState } from 'react';
import Proximiio, { ProximiioEvents } from './index';
import { ProximiioContextType } from './types';

interface Props {}

export const ProximiioContext = React.createContext(Proximiio.getContext());

export const ProximiioContextProvider = ({
  children,
}: PropsWithChildren<Props>) => {
  const [context, setContext] = useState({} as ProximiioContextType);

  useEffect(() => {
    const contextSetter = () => {
      setContext(Proximiio.getContext());
    };
    Proximiio.subscribe(ProximiioEvents.PositionUpdated, contextSetter);
    Proximiio.subscribe(ProximiioEvents.FloorChanged, contextSetter);

    return () => {
      Proximiio.unsubscribe(ProximiioEvents.PositionUpdated, contextSetter);
      Proximiio.unsubscribe(ProximiioEvents.FloorChanged, contextSetter);
    };
  }, []);

  return (
    <ProximiioContext.Provider value={context}>
      {children}
    </ProximiioContext.Provider>
  );
};

export default ProximiioContext;
