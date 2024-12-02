use core::serde::Serde;
use core::traits::Destruct;
use starknet::ContractAddress;
use starknet::contract_address_const;

use snforge_std::{
    declare, ContractClassTrait, start_cheat_caller_address, stop_cheat_caller_address
};

use attestme::schema_registry::ISchemaRegistrySafeDispatcher;
use attestme::schema_registry::ISchemaRegistrySafeDispatcherTrait;
use attestme::schema_registry::ISchemaRegistryDispatcher;
use attestme::schema_registry::ISchemaRegistryDispatcherTrait;
use attestme::resolvers::recipient_resolver::IRecipientResolverSafeDispatcher;
use attestme::resolvers::recipient_resolver::IRecipientResolverSafeDispatcherTrait;
use attestme::resolvers::recipient_resolver::IRecipientResolverDispatcher;
use attestme::resolvers::recipient_resolver::IRecipientResolverDispatcherTrait;

use attestme::SAS::ISASSafeDispatcher;
use attestme::SAS::ISASSafeDispatcherTrait;
use attestme::SAS::ISASDispatcher;
use attestme::SAS::ISASDispatcherTrait;
use attestme::SAS::{AttestationRequest, AttestationRequestData, Attestation, RevocationRequest, RevocationRequestData};

fn deploy_contract_schema_registry(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}

fn deploy_contract_sas(name: ByteArray, schema_registry: ContractAddress) -> ContractAddress {
    let contract = declare(name).unwrap();
    let mut constructor_calldata: Array<felt252> = ArrayTrait::new();
    constructor_calldata.append(schema_registry.into());
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn deploy_contract_schema_resolver(name: ByteArray, sas: ContractAddress) -> ContractAddress {
    let contract = declare(name).unwrap();
    let mut constructor_calldata: Array<felt252> = ArrayTrait::new();
    constructor_calldata.append(sas.into());
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}


fn deploy_contract_recipient_resolver(name: ByteArray, sas: ContractAddress, target_recipient: ContractAddress) -> ContractAddress {
    let contract = declare(name).unwrap();
    let mut constructor_calldata: Array<felt252> = ArrayTrait::new();
    constructor_calldata.append(sas.into());
    constructor_calldata.append(target_recipient.into());
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

#[test]
fn test_sas() {
    let contract_address_schema_registry = deploy_contract_schema_registry("SchemaRegistry");

    let dispatcher_schema_registry = ISchemaRegistryDispatcher {
        contract_address: contract_address_schema_registry
    };
    let contract_address_sas = deploy_contract_sas("SAS", contract_address_schema_registry);

    let dispatcher_sas = ISASDispatcher { contract_address: contract_address_sas };

    let _recipient: ContractAddress = contract_address_const::<2345>();

    let contract_address_recipient_resolver = deploy_contract_recipient_resolver("RecipientResolver", contract_address_sas, _recipient);

    let _dispatcher_recipient_resolver = IRecipientResolverDispatcher { contract_address: contract_address_recipient_resolver };

    let (_schemaRecord, _schema) = dispatcher_schema_registry.get_schema(0_u256);
    assert(_schemaRecord.uid == 0_u256, 'Invalid schema UID');
    assert(_schemaRecord.resolver == contract_address_const::<0>(), 'Invalid resolver');
    assert(_schemaRecord.revocable == false, 'Invalid revocable');

    let schema: ByteArray = "felt252 name, u256 age, felt252 address";
    let resolver: ContractAddress = contract_address_recipient_resolver;
    let revocable: bool = true;

    let _uid: u256 = dispatcher_schema_registry.register(schema, resolver, revocable);

    let (_schemaRecord, _schema) = dispatcher_schema_registry.get_schema(_uid);
    assert(_schemaRecord.uid == _uid, 'Invalid uid');
    assert(_schemaRecord.resolver == resolver, 'Invalid resolver');
    assert(_schemaRecord.revocable == revocable, 'Invalid revocable');

    let _attestationRequestData: AttestationRequestData = AttestationRequestData {
        recipient: _recipient,
        expirationTime: 1719207030,
        revocable: true,
        refUID: 0,
        data: "123",
        value: 0
    };
    let _attestationRequest: AttestationRequest = AttestationRequest {
        schema: _uid, data: _attestationRequestData
    };
    let attestUID: u256 = dispatcher_sas.attest(_attestationRequest);
    // println!("attestUID 1: {}", attestUID);

    let _noOfAttestation: u256 = dispatcher_sas.getNoOfAttestation(_uid);
    // println!("noOfAttestation: {}", noOfAttestation);

    start_cheat_caller_address(contract_address_sas, contract_address_const::<3>());

    let _attestationRequestData: AttestationRequestData = AttestationRequestData {
        recipient: _recipient,
        expirationTime: 1719207030,
        revocable: true,
        refUID: 0,
        data: "123",
        value: 0
    };
    let _attestationRequest: AttestationRequest = AttestationRequest {
        schema: _uid, data: _attestationRequestData
    };
    let attestUID2: u256 = dispatcher_sas.attest(_attestationRequest);
    // println!("attestUID 2: {}", attestUID2);

    stop_cheat_caller_address(contract_address_sas);

    let _noOfAttestation: u256 = dispatcher_sas.getNoOfAttestation(_uid);
    // println!("noOfAttestation: {}", noOfAttestation);
    let _attestation: Attestation = dispatcher_sas.getAttestation(attestUID);
    // println!("attestUID 1: {}", _attestation.uid);

    let _attestation: Attestation = dispatcher_sas.getAttestation(attestUID2);
    // println!("attestUID 2: {}", _attestation.uid);

    let _allAttestation: Array<Attestation> = dispatcher_sas.getAllAttestations();
    // println!("attestUID 1: {}", *_allAttestation.at(0).uid);
    // println!("attestUID 2: {}", *_allAttestation.at(1).uid);

}

#[test]
fn test_revoke_and_validation() {
    let contract_address_schema_registry = deploy_contract_schema_registry("SchemaRegistry");

    let dispatcher_schema_registry = ISchemaRegistryDispatcher {
        contract_address: contract_address_schema_registry
    };
    let contract_address_sas = deploy_contract_sas("SAS", contract_address_schema_registry);

    let dispatcher_sas = ISASDispatcher { contract_address: contract_address_sas };

    let _recipient: ContractAddress = contract_address_const::<2345>();

    let contract_address_recipient_resolver = deploy_contract_recipient_resolver("RecipientResolver", contract_address_sas, _recipient);

    let _dispatcher_recipient_resolver = IRecipientResolverDispatcher { contract_address: contract_address_recipient_resolver };

    // Register a schema
    let schema: ByteArray = "felt252 name, u256 age, felt252 address";
    let resolver: ContractAddress = contract_address_recipient_resolver;
    let revocable: bool = true;
    let _uid: u256 = dispatcher_schema_registry.register(schema, resolver, revocable);

    // Create an attestation
    let _attestationRequestData: AttestationRequestData = AttestationRequestData {
        recipient: _recipient,
        expirationTime: 1719207030,
        revocable: true,
        refUID: 0,
        data: "sample",
        value: 0
    };
    let _attestationRequest: AttestationRequest = AttestationRequest {
        schema: _uid,
        data: _attestationRequestData
    };
    let attestUID: u256 = dispatcher_sas.attest(_attestationRequest);

    // println!("attestUID 12223333322: {}",attestUID);


    // Validate attestation
    assert(dispatcher_sas.isAttestationValid(attestUID), 'Attestation should be valid');
    // println!("attestUID 1222: {}", dispatcher_sas.isAttestationValid(attestUID));


    // Revoke the attestation
    dispatcher_sas.revoke(RevocationRequest {
        schema: _uid,
        data: RevocationRequestData {
            uid: attestUID,
            value: 0
        }
    });

    // println!("attestUID 1222: {}", dispatcher_sas.isAttestationValid(attestUID));


    // Verify invalidation
    assert(!dispatcher_sas.isAttestationValid(attestUID), 'NotFound');
}
