// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentRegistry {
    struct AgentRecord {
        string did;
        string controller;
        string createdAt;
        string revokedAt;
        string documentRef;
        bool exists;
        address owner;
    }

    mapping(string => AgentRecord) private records;

    event AgentRegistered(string did, string controller, string createdAt);
    event AgentRevoked(string did, string revokedAt);
    mapping(string => mapping(address => bool)) private revocationDelegates;
    event RevocationDelegateUpdated(string did, address indexed delegate, bool authorized);
    event AgentOwnershipTransferred(string did, address indexed previousOwner, address indexed newOwner);

    function registerAgent(string calldata did, string calldata controller) external {
        require(bytes(did).length > 0, "did required");
        require(bytes(controller).length > 0, "controller required");
        require(!records[did].exists, "already registered");

        string memory nowIso = _timestampToString(block.timestamp);

        records[did] = AgentRecord({
            did: did,
            controller: controller,
            createdAt: nowIso,
            revokedAt: "",
            documentRef: "",
            exists: true,
            owner: msg.sender
        });

        emit AgentRegistered(did, controller, nowIso);
    }

    function revokeAgent(string calldata did) external {
        AgentRecord storage record = records[did];

        require(record.exists, "not found");
        require(bytes(record.revokedAt).length == 0, "already revoked");
        require(_isAuthorizedRevoker(did, msg.sender), "not authorized");

        string memory nowIso = _timestampToString(block.timestamp);
        record.revokedAt = nowIso;

        emit AgentRevoked(did, nowIso);
    }

    function setRevocationDelegate(string calldata did, address delegate, bool authorized) external {
        AgentRecord storage record = records[did];

        require(record.exists, "not found");
        require(record.owner == msg.sender, "only owner");
        require(delegate != address(0), "delegate required");

        revocationDelegates[did][delegate] = authorized;
        emit RevocationDelegateUpdated(did, delegate, authorized);
    }

    function transferAgentOwnership(string calldata did, address newOwner) external {
        AgentRecord storage record = records[did];

        require(record.exists, "not found");
        require(record.owner == msg.sender, "only owner");
        require(newOwner != address(0), "newOwner required");

        address previousOwner = record.owner;
        record.owner = newOwner;

        emit AgentOwnershipTransferred(did, previousOwner, newOwner);
    }

    function isRevocationDelegate(string calldata did, address delegate) external view returns (bool) {
        return revocationDelegates[did][delegate];
    }

    function setDocumentRef(string calldata did, string calldata documentRef) external {
        AgentRecord storage record = records[did];

        require(record.exists, "not found");
        require(record.owner == msg.sender, "only owner");
        require(bytes(documentRef).length > 0, "documentRef required");

        record.documentRef = documentRef;
    }

    function getAgentRecord(string calldata did)
        external
        view
        returns (
            string memory recordDid,
            string memory controller,
            string memory createdAt,
            string memory revokedAt,
            string memory documentRef
        )
    {
        AgentRecord memory record = records[did];
        require(record.exists, "not found");

        return (
            record.did,
            record.controller,
            record.createdAt,
            record.revokedAt,
            record.documentRef
        );
    }

    function isRevoked(string calldata did) external view returns (bool) {
        AgentRecord memory record = records[did];
        if (!record.exists) {
            return false;
        }

        return bytes(record.revokedAt).length > 0;
    }

    function _timestampToString(uint256 timestamp) private pure returns (string memory) {
        return _toString(timestamp);
    }

    function _isAuthorizedRevoker(string calldata did, address actor) private view returns (bool) {
        AgentRecord memory record = records[did];
        return record.owner == actor || revocationDelegates[did][actor];
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
