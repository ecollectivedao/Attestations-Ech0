// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IEAS } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { VerifiableAttester } from "./VerifiableAttester.sol";

/**
 * @title  VerifiableAttesterFactory
 * @notice The VerifiableAttesterFactory is a factory contract for VerifiableAttester contracts.
 *         VerifiableAttester contracts are created via CREATE2 and must have a collection name
 *         that must be unique per EAS contract. Using CREATE2 allows offchain actors to verify
 *         that a VerifiableAttester contract deployed through this factory.
 */
contract VerifiableAttesterFactory {
    /**
     * @notice Creates a new VerifiableAttester contract.
     *
     * @param eas         Address of the EAS contract to make attestations to.
     * @param admin       Address of the admin of the VerifiableAttester contract.
     * @param name        Name of the collection of attestations in the contract.
     * @param description Description of the collection of attestations in the contract.
     *
     * @return Address of the created VerifiableAttester contract.
     */
    function create(
        IEAS eas,
        address admin,
        string memory name,
        string memory description
    )
        public
        returns (
            VerifiableAttester
        )
    {
        VerifiableAttester attester = new VerifiableAttester{salt: bytes32(0)}(eas, name);
        attester.initialize(admin, description);
        return attester;
    }
}
