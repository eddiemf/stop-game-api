import { createHttpServer, createIocContainer } from './infrastructure';

const PORT = process.env.PORT || 3000;
const iocContainer = createIocContainer();
const app = createHttpServer(iocContainer);

app.listen(PORT, () => console.log(`Running server on port ${PORT}`));
