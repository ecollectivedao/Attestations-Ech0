import { ethers } from 'ethers'
import { SchemaRegistry, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { DecodedAttestation, EncodedAttestation } from '../interfaces/attestation'

/**
 * Encodes an array of attestations.
 * 
 * @param registry Address of the SchemaRegistry contract.
 * @param rpc Chain RPC URL where the SchemaRegistry is deployed.
 * @param attestations Array of attestations to encode.
 * 
 * @returns Array of encoded attestations.
 */
export const encode = async <TSchema extends { [key: string]: any }>(
  registry: string,
  rpc: string,
  attestations: DecodedAttestation<TSchema>[]
): Promise<EncodedAttestation[]> => {
  // Set up the schema registry connection.
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc)
  const schemareg = new SchemaRegistry(registry)
  schemareg.connect(provider)

  // Translate all of the attestations.
  const encoded: EncodedAttestation[] = []
  const encoders: { [key: string]: SchemaEncoder } = {}
  for (const attestation of attestations) {
    // Grab an encoder if we don't have it already.
    if (!encoders[attestation.schema]) {
      const record = await schemareg.getSchema({ uid: attestation.schema })
      encoders[attestation.schema] = new SchemaEncoder(record.schema)
    }

    // Make sure we were able to successfully able to grab the encoder.
    const encoder = encoders[attestation.schema]
    if (encoder === undefined) {
      throw new Error('unable to retrieve schema encoder')
    }

    // Generate the encoded attestation.
    encoded.push({
      schema: attestation.schema,
      recipient: attestation.recipient,
      data: encoder.encodeData(
        encoder.schema.map((item) => {
          const value = attestation.data[item.name]
          if (value === undefined) {
            throw new Error(`required key "${item.name}" not supplied`)
          }

          return {
            name: item.name,
            type: item.type,
            value,
          }
        })
      )
    })
  }

  // Return the encoded attestations.
  return encoded
}
