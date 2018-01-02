pragma solidity ^0.4.0;

contract ue_contract{
    struct student{
        bytes32 name;
        bool status;//ue is validated true or not validated false
        uint index;
    }
    
    address resp_addr;
    string resp_name;
    string ue_name;
    uint16 remaining_places;
    uint16 total_places;
    
    mapping (address => student) students;
    address[] student_index;
    
    function stringToBytes32(string memory source) constant returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
    
    function enroll(address student_addr, string student_name) public returns (bool){
        require(student_addr != resp_addr);
        //require(students[student_addr].name.length == 0);
        if(remaining_places > 0){
            student_index.push(student_addr);
            students[student_addr] = student(stringToBytes32(student_name),false,student_index.length);
            remaining_places--;
            return true;
        }else{
            return false;
        }
    }
    
    function validateUE(address sender, address student_addr) public returns (bool){
        require(sender == resp_addr);
        require(students[student_addr].name.length != 0);
        students[student_addr].status = true;
    }
    
    
    function get_ue_name() public constant returns (string){
        return ue_name;
    }
    
    function get_free_places() public constant returns (uint16){
        return remaining_places;
    }
    
    function get_total_places() public constant returns (uint16){
        return total_places;
    }
    
    function get_number_of_enrolled_students(address sender) public constant returns (uint){
        require(sender == resp_addr);
        return student_index.length;
    }
    
    function get_students_name(address sender, uint index) public constant returns (bytes32){
        require(sender == resp_addr);
        require(index>=0 && index < student_index.length);
        return students[student_index[index]].name;
    }
    
    function get_students_address(address sender, uint index) public constant returns (address){
        require(sender == resp_addr);
        require(index>=0 && index < student_index.length);
        return student_index[index];
    }
    
    function get_student_info(address student) public constant returns (bytes32,bool){
        require(students[student].name.length != 0);
        return (students[student].name, students[student].status);
    }
    
    function ue_contract(address responsable_address, string responsable_name, string UE_name, uint16 ue_total_places){
        resp_addr = responsable_address;
        resp_name = responsable_name;
        ue_name = UE_name;
        total_places = ue_total_places;
        remaining_places = ue_total_places;
    }
}