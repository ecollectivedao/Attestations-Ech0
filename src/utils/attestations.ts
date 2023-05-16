import { ethers } from 'ethers'
import { MultiAttestationRequest } from '@ethereum-attestation-service/eas-sdk'
import { EncodedAttestation } from '../interfaces/attestation'

/**
 * Packs an array of encoded attestations into a MultiAttestationRequest.
 * 
 * @param attestations Array of encoded attestations.
 * 
 * @returns Packed MultiAttestationRequest.
 */
export const pack = (
  attestations: EncodedAttestation[]
): MultiAttestationRequest[] => {
  return attestations
    .reduce((acc: any, attestation: EncodedAttestation) => {
      // Find the entry for the schema.
      let entry = acc.find((entry: any) => {
        return entry.schema === attestation.schema
      })

      // If none exists, create a new entry.
      if (!entry) {
        entry = { schema: attestation.schema, data: [] }
        acc.push(entry)
      }

      // Add the attestation to the entry.
      entry.data.push({
        recipient: attestation.recipient || ethers.constants.AddressZero,
        expirationTime: 0,
        revocable: false,
        refUID: ethers.constants.HashZero,
        data: attestation.data,
        value: 0
      })

      // Return the accumulator.
      return acc
    }, [])
}
