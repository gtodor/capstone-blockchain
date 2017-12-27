pragma solidity ^0.4.0;

contract ue_manager{
    mapping (string => address) ue_addresses;
    string[] ue_names;
    
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
    
    function ue_manager(){
        
    }
    
    function create_ue(string responsable_name, string UE_name, uint16 ue_total_places){
        //verify that this function is called by a proffessor
        
        //verify that ue_name is not already existant
        require(ue_addresses[UE_name] == 0x0);
        address ue = new ue_contract(msg.sender, responsable_name, UE_name, ue_total_places);
        ue_addresses[UE_name] = ue;
        if(bytes(responsables[msg.sender].name).length == 0){
            responsables[msg.sender] = responsable(responsable_name,new address[](0));
            responsables[msg.sender].owned_ue.push(ue);
        }else{
            responsables[msg.sender].owned_ue.push(ue);
        }
        ue_names.push(UE_name);
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
    
    function enroll(string student_name, string ue_voulu) returns (bool){
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
    
    function get_students_name(uint index, string ue_voulu) returns (string){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        bytes32 res = ue_con.get_students_name(msg.sender,index);
        return bytes32ToString(res);
    }
    
    function get_students_address(uint index, string ue_voulu) returns (address){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        address res = ue_con.get_students_address(msg.sender,index);
        return res;
    }
    
    function get_number_of_enrolled_students(string ue_voulu) returns (uint){
        require(bytes(responsables[msg.sender].name).length != 0);
        require(ue_addresses[ue_voulu] != 0);
        ue_contract ue_con = ue_contract(ue_addresses[ue_voulu]);
        uint res = ue_con.get_number_of_enrolled_students(msg.sender);
        return res;
    }
    
    function get_enrolled_ue() returns (address[]){
        //the caller needs to be a student
        require(bytes(students[msg.sender].name).length != 0);
        return students[msg.sender].enrolled_ue;
    }
    
    function get_owned_ue() returns (address[]){
        //the caller needs to be a proffessor
        require(bytes(responsables[msg.sender].name).length != 0);
        return responsables[msg.sender].owned_ue;
    }
    
    function get_ue_names(uint index) returns (string){
        require(index>=0 && index < ue_names.length);
        return ue_names[index];
    }
    
    function get_number_of_ue() returns (uint){
        return ue_names.length;
    }
    
    function get_free_places(string ue) returns (uint){
        require(ue_addresses[ue] != 0x0);
        ue_contract ue_con = ue_contract(ue_addresses[ue]);
        uint res = ue_con.get_free_places();
        return res;
    }
    
}


contract ue_contract{
    struct student{
        bytes32 name;
        uint index;
    }
    
    address resp_addr;
    string resp_name;
    string ue_name;
    uint16 remaining_places;
    uint16 total_places;
    
    mapping (address => student) students;
    address[] student_index;
    
    function stringToBytes32(string memory source) returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
    
    function enroll(address student_addr, string student_name) returns (bool){
        require(student_addr != resp_addr);
        //require(students[student_addr].name.length == 0);
        if(remaining_places > 0){
            student_index.push(student_addr);
            students[student_addr] = student(stringToBytes32(student_name),student_index.length);
            remaining_places--;
            return true;
        }else{
            return false;
        }
    }
    
    
    function get_ue_name() returns (string){
        return ue_name;
    }
    
    function get_free_places() returns (uint16){
        return remaining_places;
    }
    
    function get_total_places() returns (uint16){
        return total_places;
    }
    
    function get_number_of_enrolled_students(address sender) returns (uint){
        require(sender == resp_addr);
        return student_index.length;
    }
    
    function get_students_name(address sender, uint index) returns (bytes32){
        require(sender == resp_addr);
        require(index>=0 && index < student_index.length);
        return students[student_index[index]].name;
    }
    
    function get_students_address(address sender, uint index) returns (address){
        require(sender == resp_addr);
        require(index>=0 && index < student_index.length);
        return student_index[index];
    }
    
    function ue_contract(address responsable_address, string responsable_name, string UE_name, uint16 ue_total_places){
        resp_addr = responsable_address;
        resp_name = responsable_name;
        ue_name = UE_name;
        total_places = ue_total_places;
        remaining_places = ue_total_places;
    }
}