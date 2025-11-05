# apicli

A simple, fast CLI tool to interact with APIs from the terminal.

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
file must follow the name pattern `<collectionName>.json` and have the following
schema:

```js
{
  "baseUrl": "<string>",
  "shared": {
    "reusableItem1": {
      "headers": ["<string>"]
      "query": ["<string>"]
    },
    "reusableItem2": {...}
  },
  "operations": {
    "operation1": {
      "path": "<string>",
      "method": "<string>",
      "use": ["<string>"],
      "headers": ["<string>"]
      "query": ["<string>"]
    },
    "operation2": {...}
  }
}
```
