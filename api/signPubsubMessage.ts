import { VercelRequest, VercelResponse } from '@vercel/node'
import { getSignature, privateKeyToHex, publicKeyToHex, signPubsubMessage } from '../src/python/surfaceview3/gui/labbox/kachery-js/types/crypto_util'
import { isKacheryHubPubsubMessageBody } from '../src/python/surfaceview3/gui/labbox/kachery-js/types/pubsubMessages'
import getKeyPair from './common/getKeyPair'
import crypto from 'crypto'
import * as ed from 'noble-ed25519'
import { isSignature, JSONStringifyDeterministic, JSONValue, KeyPair, sha1OfString, Signature } from '../src/python/surfaceview3/gui/labbox/kachery-js/types/kacheryTypes'
import { sign } from 'mathjs'

const keyPair = getKeyPair()

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: messageBody} = req
    if (!isKacheryHubPubsubMessageBody(messageBody)) {
        console.warn('Invalid message body', messageBody)
        res.status(400).send(`Invalid message body: ${JSON.stringify(messageBody)}`)
        return
    }

    ;(async () => {
        let okay = false
        if (messageBody.type === 'requestSubfeed') {
            okay = true
        }
        else if (messageBody.type === 'requestTask') {
            okay = true
        }
        if (!okay) {
            throw Error(`Illegal kachery pubsub message: ${messageBody["type"]}`)
        }
        const signature = await signPubsubMessage(messageBody as any as JSONValue, keyPair)
        return {signature}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}

