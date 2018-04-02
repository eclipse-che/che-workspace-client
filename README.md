# Workspace client

This is a client for workspace REST API and workspace master JSON-RPC API interactions.

## Examples

### REST API client

```typescript
import { Rest } from 'workspace-client';

const restApiClient = Rest.getRestApi();
// get list of workspaces
const promise = restApiClient.getAll();
promise.then((workspaces) => {
    // process workspaces here
});
```

### JSON-RPC API client

```typescript
import { JsonRpc } from 'workspace-client';

const entryPoint = '/api/workspace';
const masterApiClient = JsonRpc.getMasterApiClient(entryPoint);
const connectionPromise = masterApiClient.connect(entryPoint);
// get session ID
connectionPromise.then(() => {
    const clientId = masterApiClient.getClientId();
});
const statusChangeHandler = message => {
    const status = message.status;
};
// subscribe to workspace status changes
masterApiClient.subscribeWorkspaceStatus('workspace-id', statusChangeHandler);
```
## License

EPL-2
