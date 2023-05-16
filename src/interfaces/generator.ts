import { Attestation } from './attestation'

export interface Generator<TSchema, TConfig> {
  (options: TConfig): Attestation<TSchema>[] | Promise<Attestation<TSchema>[]>
}
