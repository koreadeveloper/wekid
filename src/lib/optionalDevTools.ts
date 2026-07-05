export type OptionalDevToolLoader = () => Promise<unknown>;

export type OptionalDevToolLogger = {
  readonly warn: (message: string) => void;
};

type OptionalDevToolsConfig = {
  readonly enableReactGrab?: boolean;
  readonly enableReactScan?: boolean;
  readonly loadReactGrab?: OptionalDevToolLoader;
  readonly loadReactScan?: OptionalDevToolLoader;
  readonly logger?: OptionalDevToolLogger;
};

const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const getOptionalDevToolWarning = (toolName: string, error: unknown): string =>
  `Optional dev tool "${toolName}" could not be loaded: ${getErrorMessage(error)}`;

const loadOptionalDevTool = (toolName: string, load: OptionalDevToolLoader, logger: OptionalDevToolLogger): void => {
  void load().catch((error: unknown) => {
    logger.warn(getOptionalDevToolWarning(toolName, error));
  });
};

export function loadOptionalDevTools({
  enableReactGrab = false,
  enableReactScan = false,
  loadReactGrab = () => import('react-grab'),
  loadReactScan = () => import('react-scan').then(({ scan }) => scan({ enabled: true })),
  logger = console,
}: OptionalDevToolsConfig = {}): void {
  if (enableReactGrab) {
    loadOptionalDevTool('react-grab', loadReactGrab, logger);
  }
  if (enableReactScan) {
    loadOptionalDevTool('react-scan', loadReactScan, logger);
  }
}
