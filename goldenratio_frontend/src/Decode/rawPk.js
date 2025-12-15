
export const fromGlobalId = (globalId) => {
    const decoded = atob(globalId);
    const [type, id] = decoded.split(':');
    return { type, id };
  };
  