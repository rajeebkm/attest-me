use starknet::{ContractAddress, contract_address_const, get_caller_address,};
use attestme::helpers::common::{Errors};
use attestme::SAS::Attestation;
use core::panic_with_felt252;


#[starknet::interface]
pub trait IRevocationResolver<TContractState> {
    fn setRevocation(ref self: TContractState, status: bool) -> bool;
    fn attest(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
    fn revoke(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
}

#[starknet::contract]
mod RevocationResolver {
    use core::result::ResultTrait;
    use core::array::ArrayTrait;
    use super::{ContractAddress, get_caller_address, contract_address_const, Errors, Attestation, panic_with_felt252};
    #[storage]
    struct Storage {
        sas: ContractAddress,
        revocation: bool,
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
    impl RevocationResolverImpl of super::IRevocationResolver<ContractState> {

        fn setRevocation(ref self: ContractState, status: bool) -> bool {
            self.revocation.write(status);
            return true;
        }

      
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
            return true;
        }
        fn onRevoke(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return self.revocation.read();
        }

    }
}