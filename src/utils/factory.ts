import { ethers } from 'ethers'
import { bytecode as VerifiableAttesterBytecode } from '../../artifacts/src/contracts/VerifiableAttester.sol/VerifiableAttester.json'

export const FACTORY = '0x90991F301b2e076dC6Bc6F4942f97b3c71Ba92b2'

/**
 * Predicts the address of a created VerifiableAttester contract.
 * 
 * @param eas  Address of the EAS contract.
 * @param name Name of the attestation collection.
 * 
 * @returns Address of the VerifiableAttester contract.
 */
export const predict = (eas: string, name: string) => {
  return ethers.utils.getCreate2Address(
    FACTORY,
    ethers.constants.HashZero,
    ethers.utils.keccak256(
      ethers.utils.hexConcat(
        [
          VerifiableAttesterBytecode,
          ethers.utils.defaultAbiCoder.encode(
            ['address', 'string'],
            [eas, name]
          )
        ]
      )
    )
  )
}
