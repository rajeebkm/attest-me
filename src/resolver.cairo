use starknet::{ContractAddress, contract_address_const, get_caller_address,};
use attestme::helpers::common::{Errors};
use attestme::SAS::Attestation;
use core::panic_with_felt252;


#[starknet::interface]
pub trait ISchemaResolver<TContractState> {
    fn isPayable(self: @TContractState) -> bool;
    // fn attest(ref self: TContractState, attestation: Attestation) -> bool;
    // fn multiAttest(ref self: TContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool;
    // fn revoke(ref self: TContractState, attestation: Attestation) -> bool;
    // fn multiRevoke(ref self: TContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool;
    // fn onAttest(ref self: TContractState, attestation: Attestation, values: u256) -> bool;
    // fn onRevoke(ref self: TContractState, attestation: Attestation, values: u256) -> bool;

}

#[starknet::contract]
mod SchemaResolver {
    use core::result::ResultTrait;
    use core::array::ArrayTrait;
    use super::{ContractAddress, get_caller_address, contract_address_const, Errors, Attestation, panic_with_felt252};
    #[storage]
    struct Storage {
        sas: ContractAddress, // The SAS contract address

    }
   
    /// @dev Creates a new Resolver instance.
    /// @param registry The address global SAS contract.
    #[constructor]
    fn constructor(ref self: ContractState, _sas: ContractAddress) {
        if (_sas == contract_address_const::<0>()) {
            panic_with_felt252(Errors::InvalidSAS);
        }

        self.sas.write(_sas);
    }

    /// @notice Emitted when a new schema has been registered
    /// @param uid The schema UID.
    /// @param registerer The address of the account used to register the schema.
    /// @param schema The schema data.
    // event Registered(bytes32 indexed uid, address indexed registerer, SchemaRecord schema);
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[abi(embed_v0)]
    impl SchemaRegistryImpl of super::ISchemaResolver<ContractState> {
        fn isPayable(self: @ContractState) -> bool {
            return true;
        }
        // fn attest(ref self: ContractState, _attestation: Attestation) -> bool {
        //     assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
        //     // return self._onAttest(_attestation, 0);
        //     return true;
        // }

        // fn revoke(ref self: ContractState, _attestations: Array<Attestation>, _values: Array<u256>) -> bool {
        //     assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
        //     // return self._onARevoke(_attestation, 0);
        //     return true;
        // }

        //  fn multiAttest(ref self: ContractState, _attestations: Array<Attestation>, _values: Array<u256>) -> bool {
        //     assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
        //     // return self._onAttest(_attestation, 0);
        //     return true;
        // }
    }
}


//     /// @inheritdoc ISchemaResolver
//     function multiAttest(
//         Attestation[] calldata attestations,
//         uint256[] calldata values
//     ) external payable onlyEAS returns (bool) {
//         uint256 length = attestations.length;
//         if (length != values.length) {
//             revert InvalidLength();
//         }

//         // We are keeping track of the remaining native token amount that can be sent to resolvers and will keep deducting
//         // from it to verify that there isn't any attempt to send too much native token to resolvers. Please note that unless
//         // some native token was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
//         // possible to send too much native token anyway.
//         uint256 remainingValue = msg.value;

//         for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
//             // Ensure that the attester/revoker doesn't try to spend more than available.
//             uint256 value = values[i];
//             if (value > remainingValue) {
//                 revert InsufficientValue();
//             }

//             // Forward the attestation to the underlying resolver and return false in case it isn't approved.
//             if (!onAttest(attestations[i], value)) {
//                 return false;
//             }

//             unchecked {
//                 // Subtract the native token amount, that was provided to this attestation, from the global remaining native token amount.
//                 remainingValue -= value;
//             }
//         }

//         return true;
//     }



//     /// @inheritdoc ISchemaResolver
//     function multiRevoke(
//         Attestation[] calldata attestations,
//         uint256[] calldata values
//     ) external payable onlyEAS returns (bool) {
//         uint256 length = attestations.length;
//         if (length != values.length) {
//             revert InvalidLength();
//         }

//         // We are keeping track of the remaining native token amount that can be sent to resolvers and will keep deducting
//         // from it to verify that there isn't any attempt to send too much native token to resolvers. Please note that unless
//         // some native token was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
//         // possible to send too much native token anyway.
//         uint256 remainingValue = msg.value;

//         for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
//             // Ensure that the attester/revoker doesn't try to spend more than available.
//             uint256 value = values[i];
//             if (value > remainingValue) {
//                 revert InsufficientValue();
//             }

//             // Forward the revocation to the underlying resolver and return false in case it isn't approved.
//             if (!onRevoke(attestations[i], value)) {
//                 return false;
//             }

//             unchecked {
//                 // Subtract the native token amount, that was provided to this attestation, from the global remaining native token amount.
//                 remainingValue -= value;
//             }
//         }

//         return true;
//     }


// }


