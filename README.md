# hmsys_connector

```ts
import {
  EventTypes,
  HmSYSConnector,
} from "https://deno.land/x/hmsys_connector/mod.ts";

const conn = new HmSYSConnector("hmsys.de");
conn.rawOn(EventTypes.CredentialsRequired, () => {
  conn.authorize("joe.doe@mail.com", "password");
});
conn.rawOn(EventTypes.LoginSuccessful, () => {
  console.log("Logged In!");
});
conn.ready();
```
