use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use core::keccak::keccak_u256s_be_inputs;
use alexandria_storage::{List, ListTrait};
use attestme::resolver::{ ISchemaResolverDispatcher, ISchemaResolverDispatcherTrait } ;
use attestme::schema_registry::{ISchemaRegistryDispatcher, ISchemaRegistryDispatcherTrait, SchemaRecord};
use attestme::{
    helpers::common::{
        EMPTY_UID,
        Errors::{
            AccessDenied, InvalidRegistry, InvalidLength, NotFound, InvalidSchema,
            InvalidExpirationTime, Irrevocable, NotPayable, InsufficientValue, InvalidRevocation,
            InvalidAttestation, AlreadyRevoked, AlreadyTimestamped
        },
        NO_EXPIRATION_TIME
    },
    interfaces::{ISchemaResolver},
};

// @notice A struct representing ECDSA signature data.
#[derive(Drop, Serde)]
pub struct Signature {
    pub r: u8, // The r component of the signature.
    pub s: u256, // The s component of the signature.
    pub v: u256 // The v component of the signature.
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Attestation {
    pub uid: u256,
    pub schema: u256, // string
    pub time: u64,
    pub expirationTime: u64,
    pub revocationTime: u64,
    pub refUID: u256,
    pub recipient: ContractAddress,
    pub attester: ContractAddress,
    pub data: ByteArray,
    pub revocable: bool,
    pub isRevoked: bool
}

/// @notice A struct representing the arguments of the attestation request.
#[derive( Drop, Serde)]
pub struct AttestationRequestData {
    pub recipient: ContractAddress, // The recipient of the attestation.
    pub expirationTime: u64, // The time when the attestation expires (Unix timestamp).
    pub revocable: bool, // Whether the attestation is revocable.
    pub refUID: u256, // The UID of the related attestation.
    pub data: ByteArray, // Custom attestation data.
    pub value: u256 // An explicit native token amount to send to the resolver. This is important to prevent accidental user errors.
}

/// @notice A struct representing the full arguments of the attestation request.
#[derive(Drop, Serde)]
pub struct AttestationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: AttestationRequestData // The arguments of the attestation request.
}

#[derive(Drop, Serde)]
pub struct DelegatedAttestationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: AttestationRequestData, // The arguments of the attestation request.
    pub signature: Signature, // The ECDSA signature of the attestation request.
    pub attester: ContractAddress, // The attesting account.
    pub deadline: u64 // The deadline of the signature request.
}

#[derive(Drop, Serde)]
pub struct MultiAttestationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: Array<AttestationRequestData>, // The arguments of the attestation request.
}


#[derive(Drop, Serde)]
pub struct MultiDelegatedAttestationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: Array<DelegatedAttestationRequest>, // The arguments of the attestation request.
    pub signatures : Array<Signature>, // The ECDSA signatures data.
    pub attester: ContractAddress, // The attesting account.
    pub deadline: u64 // The deadline of the signature request.
}


/// @notice A struct representing the arguments of the revocation request.
#[derive(Drop, Serde)]
pub struct RevocationRequestData {
    pub uid: u256, // The UID of the attestation to revoke.
    pub value: u256 // An explicit native token amount to send to the resolver. This is important to prevent accidental user errors.
}

/// @notice A struct representing the full arguments of the revocation request.
#[derive(Drop, Serde)]
pub struct RevocationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: RevocationRequestData // The arguments of the revocation request.
}


#[derive(Drop, Serde)]
pub struct DelegatedRevocationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: RevocationRequestData, // The arguments of the revocation request.
    pub signature: Signature, // The ECDSA signature of the revocation request.
    pub revoker: ContractAddress, // The revoking account.
    pub deadline: u64 // The deadline of the signature request.

}

#[derive(Drop, Serde)]
pub struct MultiRevocationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: Array<RevocationRequestData>, // The arguments of the revocation request.
}


#[derive(Drop, Serde)]
pub struct MultiDelegatedRevocationRequest {
    pub schema: u256, // The unique identifier of the schema.
    pub data: Array<RevocationRequestData>, // The arguments of the revocation request.
    pub signatures : Array<Signature>, // The ECDSA signatures data.
    pub revoker: ContractAddress, // The revoking account.
    pub deadline: u64 // The deadline of the signature request.
}

/// @notice A struct representing an internal attestation result.
#[derive(Drop, Serde)]
pub struct AttestationsResult {
    pub usedValue: u256, // Total native token amount that was sent to resolvers.
    pub uids: Array<u256> // UIDs of the new attestations.
}



/// @title ISas
/// @notice The interface of global attestation schemas for the Attestation Service protocol.
#[starknet::interface]
pub trait ISAS<TContractState> {
    /// @notice Attests to a specific schema.
    /// @param request The arguments of the attestation request.
    /// @return The UID of the new attestation.
    fn attest(ref self: TContractState, request: AttestationRequest) -> u256; // bytes32

    /// @notice Revokes an existing attestation to a specific schema.
    /// @param request The arguments of the revocation request.
    fn revoke(ref self: TContractState, request: RevocationRequest);

    /// @notice Returns the address of the global schema registry.
    /// @return The address of the global schema registry.
    fn getSchemaRegistry(self: @TContractState) -> ContractAddress; // ISchemaRegistry

    /// @notice Timestamps the specified bytes32 data.
    /// @param data The data to timestamp. // bytes32
    /// @return The timestamp the data was timestamped with.
    fn timestamp(ref self: TContractState, data: u256) -> u64;


    /// @notice Returns an existing attestation by UID.
    /// @param uid The UID of the attestation to retrieve.
    /// @return The attestation data members.
    fn getAttestation(self: @TContractState, uid: u256) -> Attestation;

    /// @notice Returns all existing attestation.
    /// @return The attestation data members.
    fn getAllAttestations(self: @TContractState) -> Array<Attestation>;

    /// @notice Checks whether an attestation exists.
    /// @param uid The UID of the attestation to retrieve.
    /// @return Whether an attestation exists.
    fn isAttestationValid(self: @TContractState, uid: u256) -> bool;

    /// @notice Returns the timestamp that the specified data was timestamped with.
    /// @param data The data to query.
    /// @return The timestamp the data was timestamped with.
    fn getTimestamp(self: @TContractState, data: u256) -> u64;

    /// @notice Returns the timestamp that the specified data was timestamped with.
    /// @param data The data to query.
    /// @return The timestamp the data was timestamped with.
    // fn getRevokeOffchain(self: @TContractState, revoker: ContractAddress, data: u256) -> u64;
    fn getNoOfAttestation(self: @TContractState, schemaUID: u256) -> u256;
}

#[starknet::contract]
mod SAS {
    use core::array::SpanTrait;
    use core::serde::Serde;
    // use super::debug::PrintTrait;
    use core::panic_with_felt252;

    use core::traits::Into;
    use core::array::ArrayTrait;
    use super::{
        ContractAddress, contract_address_const, SchemaRecord, Attestation, AttestationRequest,
        AttestationRequestData, MultiAttestationRequest,MultiRevocationRequest, InvalidRegistry, InvalidSchema, get_caller_address,
        ISchemaRegistryDispatcher, InvalidExpirationTime, Irrevocable,
        ISchemaRegistryDispatcherTrait, EMPTY_UID, NO_EXPIRATION_TIME, get_block_timestamp,
        keccak_u256s_be_inputs, NotFound, AttestationsResult, NotPayable, InsufficientValue,
        InvalidAttestation, InvalidRevocation, RevocationRequest, RevocationRequestData,
        AccessDenied, AlreadyRevoked, AlreadyTimestamped, List, ListTrait, ISchemaResolverDispatcher, ISchemaResolverDispatcherTrait
    };
    #[storage]
    struct Storage {
        // The global mapping between schema records and their IDs.
        _registry: LegacyMap::<u256, SchemaRecord>, // bytes4 => SchemaRecord
        _schemaRegistry: ContractAddress, // The global schema registry, ISchemaRegistry
        _db: LegacyMap::<
            u256, Attestation
        >, // The global mapping between attestations and their UIDs.
        _timestamps: LegacyMap::<
            u256, u64
        >, // The global mapping between data and their timestamps.
        _revocationsOffchain: LegacyMap::<
            ContractAddress, (u256, u64)
        >, // The global mapping between data and their revocation timestamps.
        _noOfAttestation: LegacyMap::<u256, u256>,
        _all_attestation_uids: List<u256>
    }

    /// @dev Creates a new EAS instance.
    /// @param registry The address of the global schema registry.
    #[constructor]
    fn constructor(ref self: ContractState, registry: ContractAddress) {
        if (registry == contract_address_const::<0>()) {
            panic_with_felt252(InvalidRegistry);
        }

        self._schemaRegistry.write(registry);
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Attested: Attested,
        Revoked: Revoked,
        Timestamped: Timestamped,
        RevokedOffchain: RevokedOffchain
    }

    /// @notice Emitted when an attestation has been made.
    /// @param recipient The recipient of the attestation.
    /// @param attester The attesting account.
    /// @param uid The UID of the new attestation.
    /// @param schemaUID The UID of the schema.
    #[derive(Drop, starknet::Event)]
    struct Attested {
        // #[key]
        recipient: ContractAddress, // bytes32
        // #[key]
        attester: ContractAddress,
        uid: u256,
        // #[key]
        schemaUID: u256,
        timestamp: u64
    }

    /// @notice Emitted when an attestation has been revoked.
    /// @param recipient The recipient of the attestation.
    /// @param revoker The revoker account.
    /// @param schemaUID The UID of the schema.
    /// @param uid The UID the revoked attestation.
    #[derive(Drop, starknet::Event)]
    struct Revoked {
        // #[key]
        recipient: ContractAddress, // bytes32
        // #[key]
        revoker: ContractAddress,
        uid: u256,
        // #[key]
        schemaUID: u256
    }

    /// @notice Emitted when a data has been timestamped.
    /// @param data The data.
    /// @param timestamp The timestamp.
    #[derive(Drop, starknet::Event)]
    struct Timestamped {
        // #[key]
        timestamp: u64,
        data: u256, // bytes32
    // #[key]
    }

    /// @notice Emitted when a data has been revoked.
    /// @param revoker The address of the revoker.
    /// @param data The data.
    /// @param timestamp The timestamp.
    #[derive(Drop, starknet::Event)]
    struct RevokedOffchain {
        // #[key]
        revoker: ContractAddress, // bytes32
        // #[key]
        timestamp: u64,
        data: u256,
    // #[key]
    }

    #[abi(embed_v0)]
    impl SASImpl of super::ISAS<ContractState> {
        /// @notice Attests to a specific schema.
        /// @dev This function handles the attestation logic by creating a new attestation 
        ///      for the given schema and storing the unique identifier (UID).
        /// @param request The arguments of the attestation request, including schema and attestation data.
        /// @return uid The unique identifier (UID) of the new attestation.
        fn attest(ref self: ContractState, request: AttestationRequest) -> u256 {
            let mut _attestationRequestData: AttestationRequestData = request.data;
            let mut _uid: u256 = self
                ._attest(request.schema, _attestationRequestData, get_caller_address(), 0, true);
            let mut _all_attestation_uids: List<u256> = self._all_attestation_uids.read();
            _all_attestation_uids.append(_uid).unwrap();
            self._all_attestation_uids.write(_all_attestation_uids);
            return _uid;
        }

        /// @notice Revokes an existing attestation to a specific schema.
        /// @dev This function removes an attestation by marking it as revoked.
        /// @param request The arguments of the revocation request, including schema and revocation data.
        fn revoke(ref self: ContractState, request: RevocationRequest) {
            let _revocationRequestData: RevocationRequestData = request.data;
            self._revoke(request.schema, _revocationRequestData, get_caller_address(), 0, true);
        }

        /// @notice Returns the address of the global schema registry.
        /// @dev This function retrieves the schema registry address stored in the contract state.
        /// @return registryAddress The address of the global schema registry.
        fn getSchemaRegistry(self: @ContractState) -> ContractAddress {
            return self._schemaRegistry.read();
        }

        /// @notice Timestamps the specified data.
        /// @dev Records a timestamp for the given data and stores it in the contract state.
        /// @param data The data (bytes32) to timestamp.
        /// @return timestamp The timestamp associated with the data.
        fn timestamp(ref self: ContractState, data: u256) -> u64 {
            let time: u64 = get_block_timestamp();
            self._timestamp(data, time);
            return time;
        }

        /// @notice Checks whether an attestation is valid.
        /// @dev Validates the existence of an attestation based on its UID.
        /// @param uid The unique identifier (UID) of the attestation.
        /// @return isValid A boolean indicating whether the attestation exists and is valid.
        fn isAttestationValid(self: @ContractState, uid: u256) -> bool {
            return self._isAttestationValid(uid);
        }

        /// @notice Returns the timestamp of specified data.
        /// @dev Fetches the timestamp for given data if it exists in the state.
        /// @param data The data (bytes32) for which the timestamp is queried.
        /// @return timestamp The timestamp associated with the data.
        fn getTimestamp(self: @ContractState, data: u256) -> u64 {
            return self._timestamps.read(data);
        }

        /// @notice Retrieves an attestation by its UID.
        /// @dev Fetches the attestation record from the database.
        /// @param uid The unique identifier (UID) of the attestation.
        /// @return attestation The attestation record associated with the UID.
        fn getAttestation(self: @ContractState, uid: u256) -> Attestation {
            return self._db.read(uid);
        }

        /// @notice Retrieves all attestations stored in the contract.
        /// @dev Iterates through all stored UIDs and fetches the corresponding attestation records.
        /// @return attestations An array of all attestation records.
        fn getAllAttestations(self: @ContractState) -> Array<Attestation> {
            let mut _allAttestations: Array<Attestation> = ArrayTrait::new();
            let _getAllAttestationUids: List<u256> = self._all_attestation_uids.read();
            let mut i: u32 = 0;
            loop {
                let _attestation: Attestation = self._db.read(_getAllAttestationUids[i]);
                _allAttestations.append(_attestation);
                i += 1;
                if (i == _getAllAttestationUids.len()) {
                    break;
                }
            };
            return _allAttestations;
        }

        /// @notice Retrieves the number of attestations for a given schema UID.
        /// @dev Returns the count of attestations associated with the specified schema UID.
        /// @param schemaUID The unique identifier (UID) of the schema.
        /// @return count The number of attestations associated with the schema.
        fn getNoOfAttestation(self: @ContractState, schemaUID: u256) -> u256 {
            return self._noOfAttestation.read(schemaUID);
        }
    }

        #[generate_trait]
        impl InternalFunctions of InternalFunctionsTrait {
            /// @dev Internal function to attest to a specific schema.
            /// @param schemaUID The unique identifier of the schema to attest to.
            /// @param data The arguments of the attestation request.
            /// @param attester The address of the account attesting.
            /// @param availableValue The total native token amount available for resolver payments.
            /// @param last A boolean indicating whether this is the last attestation/revocation in the batch.
        /// @return The unique identifier (UID) of the newly created attestation.
            fn _attest(
                ref self: ContractState,
                schemaUID: u256,
                data: AttestationRequestData,
                attester: ContractAddress,
                availableValue: u256,
                last: bool
            // ) -> AttestationsResult {
            ) -> u256 {
                let (_schemaRecord, _schema) = ISchemaRegistryDispatcher {
                    contract_address: self._schemaRegistry.read()
                }
                    .get_schema(schemaUID);
                if (_schemaRecord.uid == EMPTY_UID) {
                    panic_with_felt252(InvalidSchema);
                }

                // Ensure that either no expiration time was set or that it was set in the future.
                if (data.expirationTime != NO_EXPIRATION_TIME
                    && data.expirationTime <= get_block_timestamp()) {
                    panic_with_felt252(InvalidExpirationTime);
                }

                // Ensure that we aren't trying to make a revocable attestation for a non-revocable schema.
                if (!_schemaRecord.revocable && data.revocable) {
                    panic_with_felt252(Irrevocable);
                }

                let mut _attestation: Attestation = Attestation {
                    uid: EMPTY_UID,
                    schema: schemaUID,
                    refUID: data.refUID,
                    time: get_block_timestamp(),
                    expirationTime: data.expirationTime,
                    revocationTime: 0_u64,
                    recipient: data.recipient,
                    attester: attester,
                    data: data.data,
                    revocable: data.revocable,
                    isRevoked: false
                };

                // Look for the first non-existing UID (and use a bump seed/nonce in the rare case of a conflict).
                let mut uid: u256 = 0;
                let mut bump: u32 = 0;
                loop {
                    uid = self
                        ._getUID(
                            Attestation {
                                uid: EMPTY_UID,
                                schema: schemaUID,
                                refUID: data.refUID,
                                time: get_block_timestamp(),
                                expirationTime: data.expirationTime,
                                revocationTime: 0_u64,
                                recipient: data.recipient,
                                attester: attester,
                                data: "",
                                revocable: data.revocable,
                                isRevoked: false
                            },
                            bump
                        );
                    if (self._db.read(uid).uid == EMPTY_UID) {
                        break;
                    }

                    bump += 1;
                };
                _attestation.uid = uid;
        
                self._db.write(uid, _attestation);
                self._timestamps.write(uid, get_block_timestamp()); // Need to review it

                if (data.refUID != EMPTY_UID) {
                    // Ensure that we aren't trying to attest to a non-existing referenced UID.
                    let uid: u256 = self._db.read(data.refUID).uid;
                    if (uid == EMPTY_UID) {
                        panic_with_felt252(NotFound);
                    }
                }

                // attestations[i] = attestation;
                // values[i] = request.value;

                let _attestation_copy: Attestation = Attestation {
                    uid: uid,
                    schema: schemaUID,
                    refUID: data.refUID,
                    time: get_block_timestamp(),
                    expirationTime: data.expirationTime,
                    revocationTime: 0_u64,
                    recipient: data.recipient,
                    attester: attester,
                    data: "",
                    revocable: data.revocable,
                    isRevoked: false
                };

                let _usedValue: u256 = self
                    ._resolveAttestation(
                        _schemaRecord, _attestation_copy, data.value, false, availableValue, last
                    );

                let mut _uids: Array<u256> = ArrayTrait::new();
                _uids.append(uid);
                // let mut result: AttestationsResult = AttestationsResult { usedValue: 0, uids: _uids };
                let mut lastAttastationCount: u256 = self._noOfAttestation.read(schemaUID);
                self._noOfAttestation.write(schemaUID, lastAttastationCount + 1);
                self
                    .emit(
                        Event::Attested(
                            Attested {
                                recipient: data.recipient,
                                attester: attester,
                                uid: uid,
                                schemaUID: schemaUID,
                                timestamp: get_block_timestamp()
                            }
                        )
                    );

                // return result;
                return uid;
            }

            /// @dev Generates a unique identifier (UID) for an attestation.
            /// @param _attestaion The attestation data used to generate the UID.
            /// @param _bump A nonce used to resolve UID conflicts.
        /// @return A unique identifier (UID) for the attestation.
            fn _getUID(ref self: ContractState, _attestaion: Attestation, _bump: u32) -> u256 {
                let mut input_array: Array<u256> = ArrayTrait::new();
                let schema: u256 = _attestaion.schema;
                // let recipient = _attestaion.recipient;
                // let attester: u256 = _attestaion.attester.into();
                let time: u256 = _attestaion.time.into();
                let expirationTime: u256 = _attestaion.expirationTime.into();
                // let revocable: u256 = _attestaion.revocable.into();
                let refUID: u256 = _attestaion.refUID;
                // let data: u256 = _attestaion.data.into();
                input_array.append(schema);
                // input_array.append(recipient);
                // input_array.append(attester);
                input_array.append(time);
                input_array.append(expirationTime);
                // input_array.append(revocable);
                input_array.append(refUID);
                // input_array.append(data);
                input_array.append(_bump.into());

                let inputs: Span<u256> = input_array.span();
                return keccak_u256s_be_inputs(inputs);
            }

            
            /// @dev Checks if a given attestation UID is valid.
            /// @param uid The unique identifier of the attestation.
            /// @return True if the attestation exists, otherwise false.
            fn _isAttestationValid(self: @ContractState, uid: u256) -> bool {
                let uid: u256 = self._db.read(uid).uid;
                if (uid == EMPTY_UID) {
                    return false;
                } else {
                    return true;
                }
            }


            /// @dev Resolves a new attestation or revocation of an existing attestation.
            /// @param schemaRecord The schema data of the attestation.
            /// @param attestation The attestation data to be resolved.
            /// @param value The amount of native tokens to send to the resolver.
            /// @param isRevocation A boolean indicating if this is a revocation.
            /// @param availableValue The total available native token amount for resolver payments.
            /// @param last A boolean indicating if this is the last attestation/revocation in the batch.
            /// @return The total native token amount sent to the resolver.
            fn _resolveAttestation(
                self: @ContractState,
                schemaRecord: SchemaRecord,
                attestation: Attestation,
                value: u256,
                isRevocation: bool,
                availableValue: u256,
                last: bool
            ) -> u256 {
                let mut _availableValue = availableValue;
                let resolver: ContractAddress = schemaRecord.resolver;
                if (resolver == contract_address_const::<0>()) {
                    // Ensure that we don't accept payments if there is no resolver.
                    if (value != 0) {
                        panic_with_felt252(NotPayable);
                    }
        
                    if (last) {
                        self._refund(availableValue);
                    }

                    return 0;
                }

                let isResolverPayable: bool = ISchemaResolverDispatcher { contract_address: resolver}.isPayable();

                // Ensure that we don't accept payments which can't be forwarded to the resolver.
                if (value != 0) {
                    if (isResolverPayable == false) {
                        panic_with_felt252(NotPayable);
                    }

                    // Ensure that the attester/revoker doesn't try to spend more than available.
                    if (value > availableValue) {
                        panic_with_felt252(InsufficientValue);
                    }

                    // Ensure to deduct the sent value explicitly.
                    _availableValue -= value;

                }
            

                if (isRevocation) {
                    // send value
                    // let isRevoke: bool = ISchemaResolverDispatcher { contract_address: resolver}.revoke(attestation);
                    let isRevoke: bool = true;
                    
                    if (isRevoke == false) {
                        panic_with_felt252(InvalidRevocation);
                    }
                } else {
                    // send value
                    // let isAttest: bool = ISchemaResolverDispatcher { contract_address: resolver}.attest(attestation);
                    let isAttest: bool = true;
                    if (isAttest == false) {
                        panic_with_felt252(InvalidAttestation);
                    }
                }

                if (last) {
                    self._refund(_availableValue);
                }

                return value;
            }

        
            /// @dev Refunds the remaining native tokens to the attester.
            /// @param remainingValue The amount of native tokens to be refunded.
            fn _refund(self: @ContractState, remainingValue: u256) {
                if (remainingValue > 0) { 
                    // IERC20DispatcherTrait { contract_address: self.nativeToken.read()}.transfer(get_caller_address(), remainingValue);
                }
            }

            /// @dev Revokes an existing attestation for a specific schema.
            /// @param schemaUID The unique identifier of the schema related to the attestation.
            /// @param data The arguments for the revocation request.
            /// @param revoker The address of the account performing the revocation.
            /// @param availableValue The total native token amount available for resolver payments.
            /// @param last A boolean indicating if this is the last attestation/revocation in the batch.
            /// @return The total native token amount sent to the resolver during the revocation process.
            fn _revoke(
                ref self: ContractState,
                schemaUID: u256,
                data: RevocationRequestData,
                revoker: ContractAddress,
                availableValue: u256,
                last: bool
            ) -> u256 {
                // Ensure that a non-existing schema ID wasn't passed by accident.
                let (_schemaRecord, _schema) = ISchemaRegistryDispatcher {
                    contract_address: self._schemaRegistry.read()
                }
                    .get_schema(schemaUID);
                if (_schemaRecord.uid == EMPTY_UID) {
                    panic_with_felt252(InvalidSchema);
                }


                let mut attestation: Attestation = self._db.read(data.uid);


                // Ensure that we aren't attempting to revoke a non-existing attestation.
                if (attestation.uid == EMPTY_UID) {
                    panic_with_felt252(NotFound);
                }

                // Ensure that a wrong schema ID wasn't passed by accident.
                if (attestation.schema != schemaUID) {
                    panic_with_felt252(InvalidSchema);
                }
                // Allow only original attesters to revoke their attestations.
                if (attestation.attester != revoker) {
                    panic_with_felt252(AccessDenied);
                }
                // Please note that also checking of the schema itself is revocable is unnecessary, since it's not possible to
                // make revocable attestations to an irrevocable schema.
                if (!attestation.revocable) {
                    panic_with_felt252(Irrevocable);
                }

                // Ensure that we aren't trying to revoke the same attestation twice.
                if (attestation.revocationTime != 0) {
                    panic_with_felt252(AlreadyRevoked);
                }

                let mut _attestation: Attestation = Attestation {
                    uid: EMPTY_UID,
                    schema: attestation.schema,
                    refUID: attestation.refUID,
                    time: get_block_timestamp(),
                    expirationTime: attestation.expirationTime,
                    revocationTime: get_block_timestamp(),
                    recipient: attestation.recipient,
                    attester: attestation.attester,
                    data: attestation.data,
                    revocable: attestation.revocable,
                    isRevoked: true
                };


                self._db.write(data.uid, _attestation);
        
                self
                    .emit(
                        Event::Revoked(
                            Revoked {
                                recipient: attestation.recipient,
                                revoker: revoker,
                                uid: data.uid,
                                schemaUID: schemaUID
                            }
                        )
                    );
                // return self
                //     ._resolveAttestation(
                //         _schemaRecord, _attestations, data.value, true, availableValue, last
                //     );
                return data.value;

            }

            /// @dev Timestamps a given data with a specific time.
            /// @param _data The data to be timestamped.
            /// @param _time The timestamp to assign to the data.
            fn _timestamp(ref self: ContractState, _data: u256, _time: u64) {
                if (self._timestamps.read(_data) != 0) {
                    panic_with_felt252(AlreadyTimestamped);
                }

                self._timestamps.write(_data, _time);

                self.emit(Event::Timestamped(Timestamped { data: _data, timestamp: _time }));
            }


    }

    
}