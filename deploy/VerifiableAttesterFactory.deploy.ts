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
    'VerifiableAttesterFactory',
    {
      contract: 'VerifiableAttesterFactory',
      salt: hre.ethers.utils.solidityKeccak256(
        ['string'],
        ['VerifiableAttesterFactory']
      ),
      from: deployer,
      log: true,
    }
  )

  // Execute the deployment transaction.
  await deploy()
}

deployFn.tags = ['VerifiableAttesterFactory']
export default deployFn
