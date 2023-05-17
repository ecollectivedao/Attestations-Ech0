import { ethers } from 'ethers'
import { bytecode as VerifiableAttesterFactoryBytecode } from '../../artifacts/src/contracts/VerifiableAttesterFactory.sol/VerifiableAttesterFactory.json'
import { bytecode as VerifiableAttesterBytecode } from '../../artifacts/src/contracts/VerifiableAttester.sol/VerifiableAttester.json'

/**
 * Predicts the address of the VerifiableAttesterFactory contract.
 * 
 * @returns Address of the VerifiableAttesterFactory contract.
 */
export const pfactory = () => {
  return ethers.utils.getCreate2Address(
    '0x4e59b44847b379578588920ca78fbf26c0b4956c',
    ethers.utils.solidityKeccak256(
      ['string'],
      ['VerifiableAttesterFactory']
    ),
    ethers.utils.keccak256(
      VerifiableAttesterFactoryBytecode
    )
  )
}

/**
 * Predicts the address of a created VerifiableAttester contract.
 * 
 * @param eas  Address of the EAS contract.
 * @param name Name of the attestation collection.
 * 
 * @returns Address of the VerifiableAttester contract.
 */
export const pattester = (eas: string, name: string) => {
  return ethers.utils.getCreate2Address(
    pfactory(),
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
