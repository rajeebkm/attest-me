use core::serde::Serde;
use core::traits::Destruct;
use starknet::ContractAddress;
use starknet::contract_address_const;

use snforge_std::{
    declare, ContractClassTrait, start_cheat_caller_address, stop_cheat_caller_address
};

use attestme::schema_registry::{ ISchemaRegistrySafeDispatcher, ISchemaRegistrySafeDispatcherTrait, ISchemaRegistryDispatcher, ISchemaRegistryDispatcherTrait } ;


fn deploy_contract_schema_registry(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}


#[test]
#[feature("safe_dispatcher")]
fn test_register_new_schema() {
    let contract_address = deploy_contract_schema_registry("SchemaRegistry");
    let safe_dispatcher = ISchemaRegistrySafeDispatcher { contract_address };
    let schema: ByteArray = "felt252 name, u256 age, felt252 address";
    let resolver: ContractAddress = contract_address_const::<1>();
    let revocable: bool = true;
    let uid = safe_dispatcher.register(schema.clone(), resolver, revocable).unwrap();
    let (schema_record, stored_schema) = safe_dispatcher.get_schema(uid).unwrap();
    assert(schema_record.uid == uid, 'UID mismatch');
    assert(schema_record.resolver == resolver, 'Resolver mismatch');
    assert(schema_record.revocable == revocable, 'Revocable mismatch');
    assert(stored_schema == schema, 'Schema data mismatch');
}


#[test]
#[feature("safe_dispatcher")]
fn test_retrieve_all_uids() {
    let contract_address = deploy_contract_schema_registry("SchemaRegistry");
    let safe_dispatcher = ISchemaRegistrySafeDispatcher { contract_address };
    let schema1: ByteArray = "felt252 name, u256 age";
    let schema2: ByteArray = "felt252 address, u256 id";
    let resolver: ContractAddress = contract_address_const::<1>();
    let revocable: bool = true;
    let uid1 = safe_dispatcher.register(schema1, resolver, revocable).unwrap();
    let uid2 = safe_dispatcher.register(schema2, resolver, revocable).unwrap();
    let all_uids = safe_dispatcher.get_all_uids().unwrap();
    assert(*all_uids.at(0) == uid1, 'UID1 not found');
    assert(*all_uids.at(1) == uid2, 'UID2 not found');
}

#[test]
#[feature("safe_dispatcher")]
fn test_retrieve_all_schema_records() {
    let contract_address = deploy_contract_schema_registry("SchemaRegistry");
    let safe_dispatcher = ISchemaRegistrySafeDispatcher { contract_address };
    let schema1: ByteArray = "felt252 name, u256 age";
    let schema2: ByteArray = "felt252 address, u256 id";
    let resolver: ContractAddress = contract_address_const::<1>();
    let revocable: bool = true;
    safe_dispatcher.register(schema1, resolver, revocable).unwrap();
    safe_dispatcher.register(schema2, resolver, revocable).unwrap();
    let all_records = safe_dispatcher.get_all_schemas_records().unwrap();
    assert(all_records.len() == 2, 'Wrong no of schema records');
}

#[test]
#[feature("safe_dispatcher")]
fn test_duplicate_registration_prevention() {
    let contract_address = deploy_contract_schema_registry("SchemaRegistry");
    let safe_dispatcher = ISchemaRegistrySafeDispatcher { contract_address };
    let schema: ByteArray = "felt252 name, u256 age, felt252 address";
    let resolver: ContractAddress = contract_address_const::<1>();
    let revocable: bool = true;
    let _uid: u256 = safe_dispatcher.register(schema, resolver, revocable).unwrap();
    let (_schemaRecord, _schema) = safe_dispatcher.get_schema(_uid).unwrap();
    assert(_schemaRecord.uid == _uid, 'Invalid uid');
    assert(_schemaRecord.resolver == resolver, 'Invalid resolver');
    assert(_schemaRecord.revocable == revocable, 'Invalid revocable');
    let _schema: ByteArray = "felt252 name, u256 age, felt252 address";
    let _resolver: ContractAddress = contract_address_const::<1>();
    let _revocable: bool = true;
    match safe_dispatcher.register(_schema, _resolver, _revocable) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'AlreadyExists', *panic_data.at(0));
        }
    };
}

#[test]
#[feature("safe_dispatcher")]
fn test_register_schema_with_empty_data() {
    let contract_address = deploy_contract_schema_registry("SchemaRegistry");
    let safe_dispatcher = ISchemaRegistrySafeDispatcher { contract_address };
    let schema: ByteArray = "";
    let resolver: ContractAddress = contract_address_const::<1>();
    let revocable: bool = true;
    let uid = safe_dispatcher.register(schema.clone(), resolver, revocable).unwrap();
    let (schema_record, stored_schema) = safe_dispatcher.get_schema(uid).unwrap();
    assert(schema_record.uid == uid, 'UID mismatch');
    assert(schema_record.revocable == revocable, 'Revocable mismatch');
    assert(stored_schema == schema, 'Schema data mismatch');
}