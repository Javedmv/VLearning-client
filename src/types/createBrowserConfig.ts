interface FutureFlags {
  v7_startTransition?: boolean;
    v7_relativeSplatPath?: boolean;
    v7_fetcherPersist?: boolean;
    v7_normalizeFormMethod?: boolean;
    v7_partialHydration?: boolean;
    v7_skipActionErrorRevalidation?: boolean;
  }

const future: FutureFlags = {
  v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  };

export default future;