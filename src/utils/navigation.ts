import type { createBrowserRouter } from "react-router-dom";

let routerInstance: ReturnType<typeof createBrowserRouter>;

export const setRouter = (router: typeof routerInstance) => {
  routerInstance = router;
};

export const navigateTo = (path: string) => {
  if (!routerInstance) {
    throw new Error("Router not set");
  }
  routerInstance.navigate(path);
};
