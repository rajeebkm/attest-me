use starknet::{ContractAddress, contract_address_const, get_caller_address,};
use attestme::helpers::common::{Errors};
use attestme::SAS::Attestation;
use core::panic_with_felt252;


#[starknet::interface]
pub trait IExpirationTimeResolver<TContractState> {
    fn attest(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
    fn revoke(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
}

#[starknet::contract]
mod ExpirationTimeResolver {
    use core::result::ResultTrait;
    use core::array::ArrayTrait;
    use super::{ContractAddress, get_caller_address, contract_address_const, Errors, Attestation, panic_with_felt252};
    #[storage]
    struct Storage {
        sas: ContractAddress,
        validAfter: u64, // The target value

    }
   
    /// @dev Creates a new Resolver instance.
    /// @param registry The address global SAS contract.
    #[constructor]
    fn constructor(ref self: ContractState, _sas: ContractAddress, _validAfter: u64) {
        if (_sas == contract_address_const::<0>()) {
            panic_with_felt252(Errors::InvalidSAS);
        }

        self.sas.write(_sas);
        self.validAfter.write(_validAfter);
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
    impl ExpirationTimeResolverImpl of super::IExpirationTimeResolver<ContractState> {
      
        fn attest(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            return self.onAttest(attestation, 0);
        }

        fn revoke(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            return self.onRevoke(attestation, 0);
        }

    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {

        fn onAttest(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return attestation.expirationTime >= self.validAfter.read();
        }
        fn onRevoke(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return true;
        }

    }
}