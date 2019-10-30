import { Request, ResponseToolkit, ResponseObject } from 'hapi'
import { PartiesTypeIDPutResponse } from 'types/mojaloop'

export async function update (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    request.server.app.logger.info('Received PUT parties. headers: ' + JSON.stringify(request.headers) + ' payload: ' + JSON.stringify(request.payload))
    const transactionRequestId = request.headers.id
    const fspId = (request.payload as PartiesTypeIDPutResponse).party.partyIdInfo.fspId
    const transactionRequest = await request.server.app.transactionRequestService.update(transactionRequestId, { payer: { fspId } })

    await request.server.app.transactionRequestService.sendToMojaHub(transactionRequest)

    return h.response().code(200)
  } catch (error) {
    return h.response().code(500)
  }
}