import { Generator } from '../interfaces/generator'

const publish = async <TSchema, TConfig>(
  generator: Generator<TSchema, TConfig>,
  config: TConfig
) => {
  // Generate the attestations.
  const attestations = await generator(config)
}
