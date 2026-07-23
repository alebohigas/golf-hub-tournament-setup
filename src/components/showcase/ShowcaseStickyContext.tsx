/**
 * ShowcaseStickyContext
 * ----------------------------------------------------------------------------
 * Contexto mínimo para que cada slide del rotador publique su título contextual
 * dentro del bloque sticky superior (progress + patrocinadores + categoría).
 * Mantener esos elementos en el mismo contenedor sticky evita offsets frágiles
 * entre el ribbon y el título mientras corre el autoscroll de TV.
 */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/** Estado compartido del stack sticky del showcase. */
interface ShowcaseStickyContextValue {
  /** True cuando el slide está dentro de `/showcase/rotacion`. */
  enabled: boolean;
  /** Título contextual registrado por el slide activo. */
  stickyContent: ReactNode | null;
  /** Publica/limpia el título contextual del slide activo. */
  setStickyContent: (content: ReactNode | null) => void;
}

/** Valor deshabilitado usado fuera del rotador. */
const disabledContext: ShowcaseStickyContextValue = {
  enabled: false,
  stickyContent: null,
  setStickyContent: () => undefined,
};

const ShowcaseStickyContext = createContext<ShowcaseStickyContextValue>(disabledContext);

/** Provider usado por `/showcase/rotacion` para recibir títulos de slides. */
export const ShowcaseStickyProvider = ({ children }: { children: ReactNode }) => {
  const [stickyContent, setStickyContentState] = useState<ReactNode | null>(null);

  const setStickyContent = useCallback((content: ReactNode | null) => {
    setStickyContentState(content);
  }, []);

  const value = useMemo<ShowcaseStickyContextValue>(() => ({
    enabled: true,
    stickyContent,
    setStickyContent,
  }), [setStickyContent, stickyContent]);

  return (
    <ShowcaseStickyContext.Provider value={value}>
      {children}
    </ShowcaseStickyContext.Provider>
  );
};

/** Hook de consumo del stack sticky del showcase. */
export const useShowcaseStickyContext = () => useContext(ShowcaseStickyContext);