import { createHttpServer, createModulesRegistry, createWebSocketServer } from './infrastructure';

const PORT = process.env.PORT || 3000;
const modulesRegistry = createModulesRegistry();
const httpServer = createHttpServer(modulesRegistry);
createWebSocketServer(httpServer, modulesRegistry);

httpServer.listen(PORT, () => console.log(`Running server on port ${PORT}`));
