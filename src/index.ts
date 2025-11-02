import { createHttpServer, createIocContainer, createWebSocketServer } from './infrastructure';

const PORT = process.env.PORT || 3000;
const iocContainer = createIocContainer();
const httpServer = createHttpServer(iocContainer);
createWebSocketServer(httpServer, iocContainer);

httpServer.listen(PORT, () => console.log(`Running server on port ${PORT}`));
