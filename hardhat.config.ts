import { HardhatUserConfig } from 'hardhat/types'
import { getenv } from '@eth-optimism/core-utils'
import dotenv from 'dotenv'

// Plugins
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

// Environment
dotenv.config()

// Accounts
const deployer = getenv('DEPLOYER_PRIVATE_KEY')
const accounts = deployer ? [deployer] : []

// Configuration
const config: HardhatUserConfig = {
  solidity: '0.8.19',
  paths: {
    deploy: './deploy',
    sources: './src/contracts'
  },
  networks: {
    opgoerli: {
      url: 'https://goerli.optimism.io',
      accounts,
    }
  },
  namedAccounts: {
    deployer: 0,
  }
}

export default config
