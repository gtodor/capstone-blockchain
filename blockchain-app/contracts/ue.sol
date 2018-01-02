pragma solidity ^0.4.0;

import "./ue_contract.sol";
import "./smartid.sol";

contract ue_manager{
    mapping (string => address) ue_addresses;
    mapping (address => string) ue_names_map;
    string[] ue_names;
    address professorsIdContract = 0x0;
    
    struct student{
        string name;
        address[] enrolled_ue;
    }
    
    struct responsable{
        string name;
        address[] owned_ue;
    }
    
    mapping (address => student) students;
    mapping (address => responsable) responsables;
    
    address private owner;
    
    function ue_manager(){
        owner = msg.sender;
    }
    
    function createSmartId(address addr) public returns (address){
        if(professorsIdContract == 0x0){
            //professorsIdContract = new SmartIdentity();
            professorsIdContract = addr;
            SmartIdentity professorId = SmartIdentity(professorsIdContract);
            professorId.addAttribute("professor");
            professorId.addEndorsement("professor","urbain");
        }
        return professorsIdContract;
    }
    
    /**
     * _hash is a chain that is used to identify the sender. it could be the owner address
     * his public key or anythig else that could be verified 
     * by the one who created this ue_manager contract
     */
    function create_ue(bytes32 _hash, string responsable_name, string UE_name, uint16 ue_total_places) public{
        //verify that this function is called by a professor
        require(isProfessorValid(_hash) == true);
        //verify that ue_name is not already existant
        require(ue_addresses[UE_name] == 0x0);
        address ue = new ue_contract(msg.sender, responsable_name, UE_name, ue_total_places);
        ue_addresses[UE_name] = ue;
        ue_names_map[ue] = UE_name;
        if(bytes(responsables[msg.sender].name).length == 0){
            responsables[msg.sender] = responsable(responsable_name,new address[](0));
            responsables[msg.sender].owned_ue.push(ue);
        }else{
            responsables[msg.sender].owned_ue.push(ue);
        }
        ue_names.push(UE_name);
    }
    
    function isProfessorValid(bytes32 _hash) public returns(bool){
        SmartIdentity professorId = SmartIdentity(professorsIdContract);
        bool res = professorId.checkEndorsementExists("professor",_hash);
        return res;
    }
    
    function getSmartIdContractAddress() public constant returns(address){
        return professorsIdContract;
    }
    
    function askProfessorValidation(bytes32 _hash) public returns(bool){
        SmartIdentity professorId = SmartIdentity(professorsIdContract);
        bool res = professorId.addEndorsement("professor",_hash);
        return res;
    }
    
    function giveProfessorValidation(bytes32 _hash) public returns(bool){
        require(msg.sender == owner);
        SmartIdentity professorId = SmartIdentity(professorsIdContract);
        bool res = professorId.acceptEndorsement("professor",_hash);
        return res;
    }
    
    
    function bytes32ToString(bytes32 x) constant returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
    
    
    function enroll(string student_name, string ue_voulu) public returns (bool){
        require(ue_addresses[ue_voulu] != 0x0);
        address addr = ue_addresses[ue_voulu];
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        bool res = ue_con.enroll(msg.sender,student_name);
        if(bytes(students[msg.sender].name).length == 0){
            students[msg.sender] = student(student_name,new address[](0));
            students[msg.sender].enrolled_ue.push(ue_addresses[ue_voulu]);
        }else{
            students[msg.sender].enrolled_ue.push(ue_addresses[ue_voulu]);
        }
        return res;
    }
    
    function get_students_name(uint index, string ue_voulu) public constant returns (string){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        bytes32 res = ue_con.get_students_name(msg.sender,index);
        return bytes32ToString(res);
        //return res;
    }
    
    function get_students_address(uint index, string ue_voulu) public constant returns (address){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        address res = ue_con.get_students_address(msg.sender,index);
        return res;
    }
    
    function get_student_info(address ue_addr) public constant returns (string,bool,string){
        require(bytes(ue_names_map[ue_addr]).length != 0);
        ue_contract ue_con = ue_contract(ue_addr);
        bytes32 name;
        bool status;
        (name, status) = ue_con.get_student_info(msg.sender);
        return (bytes32ToString(name), status, ue_names_map[ue_addr]);
    }
    
    function get_number_of_enrolled_students(string ue_voulu) public constant returns (uint){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        uint res = ue_con.get_number_of_enrolled_students(msg.sender);
        return res;
    }
    
    function get_enrolled_ue() public constant returns (address[]){
        //the caller needs to be a student
        require(bytes(students[msg.sender].name).length != 0);
        return students[msg.sender].enrolled_ue;
    }
    
    function get_owned_ue() public constant returns (address[]){
        //the caller needs to be a proffessor
        require(bytes(responsables[msg.sender].name).length != 0);
        return responsables[msg.sender].owned_ue;
    }
    
    function get_ue_names(uint index) public constant returns (string){
        require(index>=0 && index < ue_names.length);
        return ue_names[index];
    }
    
    function get_number_of_ue() public constant returns (uint){
        return ue_names.length;
    }
    
    function get_free_places(string ue) public constant returns (uint){
        require(ue_addresses[ue] != 0x0);
        ue_contract ue_con = ue_contract(ue_addresses[ue]);
        uint res = ue_con.get_free_places();
        return res;
    }
    
}