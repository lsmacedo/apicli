#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listCollections } from '@src/handlers/listCollections';
import { listOperations } from '@src/handlers/listOperations';
import { performOperation } from '@src/handlers/performOperation';

yargs(hideBin(process.argv))
  .command(
    '$0 [collection] [operation] [params...]',
    'Make an HTTP request or list operations',
    (yargs) => {
      return yargs
        .positional('collection', {
          type: 'string',
        })
        .positional('operation', {
          type: 'string',
        })
        .positional('params', {
          type: 'string',
          array: true,
        });
    },
    async (argv) => {
      if (!argv.collection) {
        await listCollections();
        return;
      }

      if (!argv.operation) {
        await listOperations(argv.collection);
        return;
      }

      await performOperation(
        argv.collection,
        argv.operation,
        argv.params ?? []
      );
    }
  )
  .fail((msg, err) => {
    if (msg) {
      console.error(msg);
    } else if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  })
  .parseAsync()
  .catch(() => process.exit(1));
