import Knex from 'knex'
// import { Party, PartyIdInfo, Money, TransactionType } from '../types/mojaloop'
import { Money } from '../types/mojaloop'
import { AxiosInstance } from 'axios'
const logger = require('@mojaloop/central-services-logger')

export enum TransferState {
  'RECEIVED',
  'RESERVED',
  'COMMITTED',
  'ABORTED'
}

export type DBTransfer = {
  transferId: string;
  quoteId: string;
  transactionRequestId: string;
  fulfilment: string;
  transferState: TransferState;
  amount: string;
  currency: string;
}

export type Transfer = {
  transferId: string;
  quoteId: string;
  transactionRequestId: string;
  fulfilment: string;
  transferState: TransferState;
  amount: Money;
}

export interface TransfersService {
  get(id: string): Promise<Transfer>;
  create(request: Transfer): Promise<Transfer>;
  // updateTransferState(data: Transfer): Promise<Transfer>; // field suspended, remove if depricated
}

export class KnexTransfersService implements TransfersService {
  constructor (private _knex: Knex, private _client: AxiosInstance) {
  }

  async get (id: string): Promise<Transfer> {
    const dbTransfer: DBTransfer | undefined = await this._knex<DBTransfer>('transfers').where('transferId', id).first()
    // console.log(dbTransfer)
    if (!dbTransfer) {
      throw new Error('Error fetching transfer from database')
    }

    const transfer: Transfer = {
      transferId: dbTransfer.transferId,
      transactionRequestId: dbTransfer.transactionRequestId,
      amount: {
        amount: dbTransfer.amount,
        currency: dbTransfer.currency
      },
      quoteId: dbTransfer.quoteId,
      fulfilment: dbTransfer.fulfilment,
      transferState: dbTransfer.transferState
    }

    return transfer
  }

  async create (request: Transfer): Promise<Transfer> {
    logger.debug('Transfers Service: Creating transfer ' + request.transferId)
    await this._knex<DBTransfer>('transfers').insert({
      transferId: request.transferId,
      quoteId: request.quoteId,
      transactionRequestId: request.transactionRequestId,
      fulfilment: request.fulfilment,
      // transferState: request.transferState, // field suspended, remove if depricated
      amount: request.amount.amount,
      currency: request.amount.currency
    }).then(result => result[0])

    return this.get(request.transferId)
  }

  // async updateTransferState(data: Transfer) { // field suspended, remove if depricated
  //   logger.debug('Transfer Service: Updating state of transfer ' + data.id)
  //   await this._knex<DBTransfer>('transfers')
  //     .update('transferState', data.transferState)
  //     .where('id', data.id)
  //     .then(result => result)

  //   return this.get(data.id)
  // }
}
