export interface DecodedAttestation<TSchema extends { [key: string]: any }> {
  schema: string
  recipient: string | null
  data: TSchema
}

export interface EncodedAttestation {
  schema: string
  recipient: string | null
  data: string
}

export interface Attestation<TSchema> {
  schema: TSchema
}
