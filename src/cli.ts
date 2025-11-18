#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listCollections } from '@src/handlers/listCollections';
import { listOperations } from '@src/handlers/listOperations';
import { performOperation } from '@src/handlers/performOperation';
import { listEnvironments } from './handlers/listEnvironments';

yargs(hideBin(process.argv))
  .command(
    '$0 [collection] [operation] [params...]',
    'Make an HTTP request',
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
        })
        .option('env', {
          type: 'string',
          alias: 'e',
        });
    },
    async (argv) => {
      if (!argv.collection) {
        await listCollections();
        return;
      }

      if (!argv.env) {
        await listEnvironments(argv.collection);
        return;
      }

      if (!argv.operation) {
        await listOperations(argv.collection, argv.env);
        return;
      }

      await performOperation(
        argv.collection,
        argv.operation,
        argv.params ?? [],
        argv.env
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
