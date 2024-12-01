use starknet::{ContractAddress, contract_address_const, get_caller_address, get_contract_address};
use attestme::helpers::common::{Errors};
use attestme::SAS::Attestation;
use core::panic_with_felt252;
use openzeppelin::{
    token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait}
};


#[starknet::interface]
pub trait IRecipientResolver<TContractState> {
    fn attest(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
    fn revoke(ref self: TContractState, attestation: Attestation, value: u256) -> bool;
}

#[starknet::contract]
mod RecipientResolver {
    use core::result::ResultTrait;
    use core::array::ArrayTrait;
    use super::{ContractAddress, get_contract_address, get_caller_address, contract_address_const, Errors, Attestation, panic_with_felt252, IERC20Dispatcher, IERC20DispatcherTrait};
    #[storage]
    struct Storage {
        sas: ContractAddress,
        target_token: ContractAddress, // The target token
        target_amount: u256, // The target amount
    }
   
    /// @dev Creates a new Resolver instance.
    /// @param registry The address global SAS contract.
    #[constructor]
    fn constructor(ref self: ContractState, _sas: ContractAddress, _target_token: ContractAddress, _target_amount: u256) {
        if (_sas == contract_address_const::<0>()) {
            panic_with_felt252(Errors::InvalidSAS);
        }
        if (_target_token == contract_address_const::<0>()) {
            panic_with_felt252('InvalidToken');
        }

        self.sas.write(_sas);
        self.target_token.write(_target_token);
        self.target_amount.write(_target_amount);
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
    impl RecipientResolverImpl of super::IRecipientResolver<ContractState> {
      
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
            let allowance = IERC20Dispatcher { contract_address: self.target_token.read()}.allowance(attestation.attester, get_contract_address());
            if (allowance < self.target_amount.read()) {
                panic_with_felt252('InvalidAllowance');
            }
            return true;
        }
        fn onRevoke(ref self: ContractState, attestation: Attestation, value: u256) -> bool {
            return true;
        }

    }
}