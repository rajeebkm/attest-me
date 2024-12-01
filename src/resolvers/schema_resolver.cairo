use starknet::{ContractAddress, contract_address_const, get_caller_address,};
use attestme::helpers::common::{Errors};
use attestme::SAS::Attestation;
use core::panic_with_felt252;


#[starknet::interface]
pub trait ISchemaResolver<TContractState> {
    fn isPayable(self: @TContractState) -> bool;
    fn attest(ref self: TContractState, attestation: Attestation) -> bool;
    fn revoke(ref self: TContractState, attestation: Attestation) -> bool;
    fn multiAttest(ref self: TContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool;
    fn multiRevoke(ref self: TContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool;
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
    impl SchemaResolverImpl of super::ISchemaResolver<ContractState> {
        fn isPayable(self: @ContractState) -> bool {
            return true;
        }
        fn attest(ref self: ContractState, attestation: Attestation) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            return self.onAttest(attestation, 0);
        }

        fn revoke(ref self: ContractState, attestation: Attestation) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            return self.onRevoke(attestation, 0);
        }

        fn multiAttest(ref self: ContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            let attestations_len = attestations.len();
            let values_len = values.len();
            if(attestations_len != values_len){
                panic_with_felt252(Errors::InvalidLength);
            }
            let mut remainingValue = 0; // msg.value
            let mut i: u32 = 0;
            loop {
                if(i == values_len){
                    break;
                }
                let value = *values.at(i);
                if(value > remainingValue){
                    panic_with_felt252(Errors::InsufficientValue);
                }
                // if(!self.onAttest(*attestations.at(i), value)){
                //     break; // return false
                // }
                remainingValue -= value;
                i += 1;
            };


            return true;
        }

        fn multiRevoke(ref self: ContractState, attestations: Array<Attestation>, values: Array<u256>) -> bool {
            assert(get_caller_address() == self.sas.read(), Errors::InvalidSAS);
            let attestations_len = attestations.len();
            let values_len = values.len();
            if(attestations_len != values_len){
                panic_with_felt252(Errors::InvalidLength);
            }
            let mut remainingValue = 0; // msg.value
            let mut i: u32 = 0;
            loop {
                if(i == values_len){
                    break;
                }
                let value = *values.at(i);
                if(value > remainingValue){
                    panic_with_felt252(Errors::InsufficientValue);
                }
                // if(!self.onRevoke(*attestations.at(i), value)){
                //     break; // return false
                // }
                remainingValue -= value;
                i += 1;
            };
            return true;
        }

    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {

        fn onAttest(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return true;
        }
        fn onRevoke(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return true;
        }

    }
}