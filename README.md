# apicli

A simple, fast CLI tool to interact with APIs from the terminal.

<img src="https://github.com/user-attachments/assets/1c916264-2bb0-4be2-9978-45c403fd14fe" width="600">

## Quick Start

1. **Install the CLI**:

```bash
npm install -g @lsmacedo/apicli
```

2. **Create a collection config** (`~/.apicli/fakebank.json`):

```js
{
  "baseUrl": "https://api.sampleapis.com/fakebank",
  "operations": {
    "listAccounts": {
      "path": "/accounts",
      "method": "GET"
    },
    "getById": {
      "path": "/accounts/{id}",
      "method": "GET"
    }
  }
}
```

2. **Use it**:

```bash
apicli fakebank listAccounts
apicli fakebank getById id=1
```

## Config file

The CLI looks for collection config files inside the `~/.apicli` directory. The
file must follow the name pattern `<collectionName>.json`.
Documentation and examples will be added soon.
