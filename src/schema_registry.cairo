use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use attestme::helpers::common::{Errors, EMPTY_UID};
use core::panic_with_felt252;
use core::keccak::keccak_u256s_be_inputs;
use alexandria_storage::{List, ListTrait};

/// @notice A struct representing a record for a submitted schema.
/// @param uid The unique identifier of the schema.
/// @param resolver The address of the schema resolver (optional).
/// @param revocable Indicates if the schema can be explicitly revoked.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct SchemaRecord {
    pub uid: u256,
    pub resolver: ContractAddress, // ISchemaResolver
    pub revocable: bool,
}

#[starknet::interface]
pub trait ISchemaRegistry<TContractState> {
    /// @notice Registers a new schema.
    /// @param schema The schema data.
    /// @param resolver The address of the schema resolver.
    /// @param revocable Whether the schema allows explicit revocations.
    /// @return The UID of the registered schema.
    fn register(
        ref self: TContractState, schema: ByteArray, resolver: ContractAddress, revocable: bool
    ) -> u256;

    /// @notice Retrieves the details of a schema by its UID.
    /// @param uid The unique identifier of the schema.
    /// @return A tuple containing the schema record and schema data.
    fn get_schema(self: @TContractState, uid: u256) -> (SchemaRecord, ByteArray);

    /// @notice Fetches all registered schema UIDs.
    /// @return An array of all schema UIDs.
    fn get_all_uids(self: @TContractState) -> Array<u256>;

    /// @notice Retrieves all registered schema records.
    /// @return An array of all schema records.
    fn get_all_schemas_records(self: @TContractState) -> Array<SchemaRecord>;
}

#[starknet::contract]
mod SchemaRegistry {
    use core::result::ResultTrait;
    use core::array::ArrayTrait;
    use super::{
        ContractAddress, SchemaRecord, Errors, EMPTY_UID, get_caller_address,
        contract_address_const, panic_with_felt252, keccak_u256s_be_inputs, List, ListTrait,
        get_block_timestamp
    };

    #[storage]
    struct Storage {
        /// @dev A mapping of schema UIDs to their records.
        _registry: LegacyMap::<u256, SchemaRecord>,
        /// @dev A mapping of schema UIDs to their data.
        _schema: LegacyMap::<u256, ByteArray>,
        /// @dev A list of all registered schema UIDs.
        _uids: List<u256>,
        /// @dev A list of all schema records.
        _schemaRecords: List<SchemaRecord>,
    }

    #[constructor]
    /// @notice Initializes the SchemaRegistry contract.
    fn constructor(ref self: ContractState) {}

    /// @notice Emitted when a new schema is registered.
    /// @param uid The UID of the registered schema.
    /// @param registerer The address of the account that registered the schema.
    /// @param schemaRecord The record of the registered schema.
    /// @param schema The data of the registered schema.
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Registered: Registered,
    }

    #[derive(Drop, starknet::Event)]
    struct Registered {
        timestamp: u64,
        uid: u256,
        registerer: ContractAddress,
        schemaRecord: SchemaRecord,
        schema: ByteArray,
    }

    #[abi(embed_v0)]
    impl SchemaRegistryImpl of super::ISchemaRegistry<ContractState> {
        /// @notice Registers a new schema.
        /// @param schema The schema data.
        /// @param resolver The address of the schema resolver.
        /// @param revocable Indicates if the schema allows explicit revocations.
        /// @return The UID of the registered schema.
        fn register(
            ref self: ContractState, schema: ByteArray, resolver: ContractAddress, revocable: bool
        ) -> u256 {
            // Implementation here
        }

        /// @notice Retrieves the details of a schema by its UID.
        /// @param uid The unique identifier of the schema.
        /// @return A tuple containing the schema record and schema data.
        fn get_schema(self: @ContractState, uid: u256) -> (SchemaRecord, ByteArray) {
            return (self._registry.read(uid), self._schema.read(uid));
        }

        /// @notice Fetches all registered schema UIDs.
        /// @return An array of all schema UIDs.
        fn get_all_uids(self: @ContractState) -> Array<u256> {
            let uids: List<u256> = self._uids.read();
            return uids.array().unwrap();
        }

        /// @notice Retrieves all registered schema records.
        /// @return An array of all schema records.
        fn get_all_schemas_records(self: @ContractState) -> Array<SchemaRecord> {
            let _schemaRecords: List<SchemaRecord> = self._schemaRecords.read();
            return _schemaRecords.array().unwrap();
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        /// @dev Calculates a unique identifier (UID) for a given schema.
        /// @param _schemaRecord The schema record.
        /// @param registerer The address of the account registering the schema.
        /// @param _schema The schema data.
        /// @return The UID of the schema.
        fn _getUID(
            self: @ContractState,
            _schemaRecord: SchemaRecord,
            registerer: ContractAddress,
            _schema: ByteArray
        ) -> u256 {
            // Implementation here
        }
    }
}
