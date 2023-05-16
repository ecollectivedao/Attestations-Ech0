#!/usr/bin/env ts-node
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { program } from 'commander'
import { ethers } from 'ethers'
import { version } from '../package.json'
import { encode } from '../src/components/encoder'
import { FACTORY, predict } from '../src/utils/factory'
import { pack } from '../src/utils/attestations'
import { abi as VerifiableAttesterFactoryABI } from '../artifacts/src/contracts/VerifiableAttesterFactory.sol/VerifiableAttesterFactory.json'
import { abi as VerifiableAttesterABI } from '../artifacts/src/contracts/VerifiableAttester.sol/VerifiableAttester.json'

program
  .name('atstdd')
  .description('A tool for duplicating data into the AttestationStation (ATST)')
  .version(version)

program
  .command('prepare')
  .description('Prepares a VerifiableAttester contract to make attestations through')
  .requiredOption('--eas <string>', 'address of the EAS contract')
  .requiredOption('--admin <string>', 'address of the admin for the VerifiableAttester contract')
  .requiredOption('--name <string>', 'name of the attestation collection')
  .requiredOption('--description <string>', 'description of the attestation collection')
  .requiredOption('--key <string>', 'private key to sign the transaction with')
  .requiredOption('--rpc <string>', 'rpc url for the network where the ATST is deployed')
  .action(async (args: {
    factory: string,
    eas: string,
    admin: string,
    name: string,
    description: string,
    key: string,
    rpc: string
  }) => {
    // Connect to the factory contract.
    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc)
    const wallet = new ethers.Wallet(args.key, provider)
    const factory = new ethers.Contract(FACTORY, VerifiableAttesterFactoryABI, wallet)

    // Send the transaction.
    console.log('sending VerifiableAttester deployment transaction...')
    const tx = await factory.create(args.eas, args.admin, args.name, args.description)
    console.log('transaction hash:', tx.hash)

    // Wait for the transaction to confirm.
    console.log('waiting for transaction receipt...')
    await tx.wait()
    console.log('transaction confirmed')

    // Log the address of the deployed contract.
    console.log('deployed VerifiableAttester at:', predict(args.eas, args.name))
  })

program
  .command('lock')
  .description('Locks a VerifiableAttester contract to prevent further attestations')
  .requiredOption('--attester <string>', 'address of the VerifiableAttester contract')
  .requiredOption('--key <string>', 'private key to sign the transaction with')
  .requiredOption('--rpc <string>', 'rpc url for the network where the ATST is deployed')
  .action(async (args: {
    attester: string,
    key: string,
    rpc: string
  }) => {
    // Connect to the attester contract.
    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc)
    const wallet = new ethers.Wallet(args.key, provider)
    const attester = new ethers.Contract(args.attester, VerifiableAttesterABI, wallet)

    // Send the transaction.
    console.log('sending VerifiableAttester lock transaction...')
    const tx = await attester.lock()
    console.log('transaction hash:', tx.hash)

    // Wait for the transaction to confirm.
    console.log('waiting for transaction receipt...')
    await tx.wait()
    console.log('transaction confirmed')
  })

program
  .command('generate')
  .description('Generates attestations to relay to the ATST')
  .requiredOption('--generator <string>', 'path to the generator script to use')
  .requiredOption('--config <string>', 'path to the configuration file to use')
  .requiredOption('--registry <string>', 'address of the SchemaRegistry contract')
  .requiredOption('--rpc <string>', 'rpc url for the network where the ATST is deployed')
  .requiredOption('--output <string>', 'path to the output file to write')
  .action(async (args: {
    generator: string,
    config: string,
    output: string,
    registry: string,
    rpc: string
  }) => {
    const generator = require(path.join(process.cwd(),args.generator)).default
    const config = require(path.join(process.cwd(), args.config))
    const attestations = await generator(config)
    const encoded = await encode(args.registry, args.rpc, attestations)
    fs.writeFileSync(args.output, JSON.stringify(encoded, null, 2))
  })

program
  .command('publish')
  .description('Publishes attestations to the ATST')
  .requiredOption('--attestations <string>', 'path to the attestations file to publish')
  .requiredOption('--attester <string>', 'address of the VerifiableAttester contract')
  .requiredOption('--key <string>', 'private key to sign the transaction with')
  .requiredOption('--rpc <string>', 'rpc url for the network where the ATST is deployed')
  .action(async (args: {
    attestations: string,
    attester: string,
    key: string,
    rpc: string
  }) => {
    // Connect to the attester contract.
    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc)
    const wallet = new ethers.Wallet(args.key, provider)
    const attester = new ethers.Contract(args.attester, VerifiableAttesterABI, wallet)

    // Pack the attestations into a MultiAttestationRequest.
    const packed = pack(JSON.parse(fs.readFileSync(args.attestations, 'utf8').toString()))

    // Send the transaction.
    console.log('sending VerifiableAttester publish transaction...')
    const tx = await attester.attest(packed)
    console.log('transaction hash:', tx.hash)

    // Wait for the transaction to confirm.
    console.log('waiting for transaction receipt...')
    await tx.wait()
    console.log('transaction confirmed')
  })

program
  .command('verify')
  .description('Verifies attestations relayed to the ATST')
  .requiredOption('--attestations <string>', 'path to the attestations file to verify')
  .requiredOption('--eas <string>', 'address of the EAS contract')
  .requiredOption('--name <string>', 'name of the VerifiableAttester contract collection')
  .requiredOption('--rpc <string>', 'rpc url for the network where the ATST is deployed')
  .action(async (args: {
    attestations: string,
    eas: string,
    name: string,
    rpc: string
  }) => {
    // Connect to the attester given the computed address.
    const addr = predict(args.eas, args.name)
    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc)
    const attester = new ethers.Contract(addr, VerifiableAttesterABI, provider)

    // Contract should be locked.
    assert.equal(await attester.$locked(), true, 'contract not locked')

    // Compute the verification hash.
    const packed = pack(JSON.parse(fs.readFileSync(args.attestations, 'utf8').toString()))
    let vhash = ethers.constants.HashZero
    for (const entry of packed) {
      for (const attestation of entry.data) {
        vhash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            [
              'bytes32',
              'bytes32',
              'tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value)'
            ],
            [
              vhash,
              entry.schema,
              attestation
            ]
          )
        )
      }
    }

    // Verification hashes should match.
    assert.equal(vhash, await attester.$vhash(), 'verification hash mismatch')

    // Everything checks out.
    console.log('verification successful')
  })

program.parse()
