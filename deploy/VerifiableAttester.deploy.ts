import { ethers } from 'ethers'
import { DeployFunction } from 'hardhat-deploy/dist/types'

const deployFn: DeployFunction = async (hre) => {
  // Grab the deployer account.
  const { deployer } = await hre.getNamedAccounts()

  // Make sure the deployer is defined.
  if (deployer === undefined) {
    throw new Error('deployer account is undefined')
  }

  // Generate the deployment transaction.
  const { deploy } = await hre.deployments.deterministic(
    'VerifiableAttester',
    {
      contract: 'VerifiableAttester',
      salt: hre.ethers.utils.solidityKeccak256(
        ['string'],
        ['VerifiableAttester']
      ),
      args: [ethers.constants.AddressZero, 'VERIFICATION'],
      from: deployer,
      log: true,
    }
  )

  // Execute the deployment transaction.
  await deploy()
}

deployFn.tags = ['VerifiableAttester']
export default deployFn
